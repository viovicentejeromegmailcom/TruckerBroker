import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, ApproveUserInput } from "@shared/schema";
import { generateToken, sendVerificationEmail, sendApprovalEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "trucklink-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid username or password" });
          }

          // If this is an admin, status check is not required
          if (user.userType === "admin") {
            return done(null, user);
          }

          // Check if account is verified or approved
          if (user.status === "pending") {
            return done(null, false, { message: "Your account is awaiting approval from an administrator" });
          } else if (user.status !== "verified") {
            return done(null, false, { message: "Please verify your email address to login" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Function to check if a user is an admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in" });
    }

    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };

  // Admin registration with special key
  app.post("/api/register/admin", async (req, res, next) => {
    try {
      const { username, email, password, confirmPassword, adminKey, firstName, lastName, phone } = req.body;

      // Validate admin key
      if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ message: "Invalid admin key" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if password matches confirmation
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Create admin user with verified status
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        phone,
        userType: "admin",
        status: "verified" // Admin accounts are automatically verified
      });

      // Auto login after registration
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  // Regular user registration (truckers and brokers)
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, userType } = req.body;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      req.body.password = await hashPassword(req.body.password);

      // Generate verification token with expiration (24 hours from now)
      const verificationToken = generateToken();
      const tokenExpires = new Date();
      tokenExpires.setHours(tokenExpires.getHours() + 24);

      // Create user with pending status and verification token
      const user = await storage.createUser({
        ...req.body,
        status: "pending",
        verificationToken,
        verificationExpires: tokenExpires
      });

      // Create profile based on user type
      if (userType === "trucker") {
        await storage.createTruckerProfile({
          userId: user.id,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip: req.body.zip,
          licensePlate: req.body.licensePlate || null,
          licenseNumber: req.body.licenseNumber || null,
          truckType: req.body.truckType || null,
          truckCapacity: req.body.truckCapacity || null,
          serviceAreas: req.body.serviceAreas || null,
          available: true
        });
      } else if (userType === "broker") {
        await storage.createBrokerProfile({
          userId: user.id,
          companyName: req.body.companyName,
          companyAddress: req.body.companyAddress,
          companyCity: req.body.companyCity,
          companyState: req.body.companyState,
          companyZip: req.body.companyZip,
          businessType: req.body.businessType || null,
          taxId: req.body.taxId || null
        });
      }

      // Send verification email
      const emailSent = await sendVerificationEmail(email, verificationToken);

      if (!emailSent) {
        console.error(`Failed to send verification email to ${email}`);
      }

      // Return success without auto login - user must verify email and be approved by admin
      res.status(201).json({
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        registrationComplete: true,
        message: "Registration successful. Please check your email to verify your account. After verification, an administrator will review your application."
      });

    } catch (err) {
      next(err);
    }
  });

  // Email verification endpoint
  app.get("/api/verify", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      // Find user with this token
      const user = await storage.getUserByVerificationToken(token);

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Check if token is expired
      if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
        return res.status(400).json({ message: "Verification token has expired" });
      }

      // Verify the user
      await storage.updateUser(user.id, {
        status: "verified",
        verificationToken: null,
        verificationExpires: null
      });

      // Redirect to login page with success message
      res.redirect('/auth?verified=true');

    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ message: "Server error during verification" });
    }
  });

  // Admin endpoint to approve or reject users
  app.post("/api/admin/approve-user", isAdmin, async (req, res, next) => {
    try {
      const { userId, approved, message } = req.body as ApproveUserInput;

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (approved) {
        // Generate new verification token
        const verificationToken = generateToken();
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        // Update user status to approved and set verification token
        await storage.updateUser(user.id, {
          status: "approved",
          verificationToken,
          verificationExpires: tokenExpires,
          verificationNotes: "Approved by admin"
        });

        // Send verification email
        const emailSent = await sendVerificationEmail(user.email, verificationToken);

        if (!emailSent) {
          return res.status(500).json({ message: "Failed to send verification email" });
        }

        res.status(200).json({ message: "User approved and verification email sent" });
      } else {
        // If rejected, update user status (optional: could delete the user instead)
        await storage.updateUser(user.id, {
          status: "rejected",
          verificationNotes: message || "Rejected by admin"
        });

        // Send rejection email if a message was provided
        if (message) {
          await sendApprovalEmail(user.email, false, message);
        }

        res.status(200).json({ message: "User registration rejected" });
      }
    } catch (err) {
      next(err);
    }
  });

  // Admin endpoint to get pending users
  app.get("/api/admin/pending-users", isAdmin, async (req, res, next) => {
    try {
      const pendingUsers = await storage.getUsersByStatus("pending");
      res.json(pendingUsers);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      // First check if the user exists and has the right status
      const { username } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check user status
      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your account is pending verification. Please check your email to verify your account."
        });
      }

      if (user.status === "verified") {
        return res.status(403).json({
          message: "Your account has been verified but is awaiting admin approval."
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your registration has been rejected. Please contact support for more information."
        });
      }

      if (user.status !== "approved") {
        return res.status(403).json({
          message: "Your account is not currently active. Please contact support for assistance."
        });
      }

      // If status checks pass, proceed with authentication
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(user);
        });
      })(req, res, next);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
