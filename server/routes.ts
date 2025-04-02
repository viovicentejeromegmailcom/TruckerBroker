import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertJobSchema, insertBookingSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Development-only route to view all verification tokens for testing
  app.get('/api/dev/verification-tokens', async (req, res) => {
    try {
      const users = await storage.getUsersByStatus('pending');
      const tokenInfo = users.map(user => ({
        username: user.username,
        email: user.email,
        token: user.verificationToken,
        verifyUrl: `${req.protocol}://${req.get('host')}/api/verify?token=${user.verificationToken}`
      }));
      res.json(tokenInfo);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving tokens', error });
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Routes for user profile
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userType = req.user!.userType;

      if (userType === "trucker") {
        const profile = await storage.getTruckerProfile(userId);
        return res.json(profile);
      } else if (userType === "broker") {
        const profile = await storage.getBrokerProfile(userId);
        return res.json(profile);
      }

      return res.status(404).json({ message: "Profile not found" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/profile/trucker", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.userType !== "trucker") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userId = req.user!.id;
      const updatedProfile = await storage.updateTruckerProfile(userId, req.body);

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.json(updatedProfile);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/profile/broker", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.userType !== "broker") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const userId = req.user!.id;
      const updatedProfile = await storage.updateBrokerProfile(userId, req.body);

      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.json(updatedProfile);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Routes for jobs
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      // Parse query parameters for filtering
      const { originState, destinationState, loadType, cargoType } = req.query;

      const filters: any = {};
      if (originState) filters.originState = originState;
      if (destinationState) filters.destinationState = destinationState;
      if (loadType) filters.loadType = loadType;
      if (cargoType) filters.cargoType = cargoType;
      filters.status = "active"; // Only return active jobs

      const jobs = await storage.getJobs(filters);
      res.json(jobs);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      // Ensure user is a broker
      if (req.user!.userType !== "broker") {
        return res.status(403).json({ message: "Only brokers can post jobs" });
      }

      // Validate request body
      const validatedData = insertJobSchema.parse({
        ...req.body,
        brokerId: req.user!.id
      });

      // Create job
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);

      // Check if job exists and user is the broker who created it
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.brokerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this job" });
      }

      // Update job
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/broker/jobs", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.userType !== "broker") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const jobs = await storage.getJobsByBroker(req.user!.id);
      res.json(jobs);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Routes for bookings/applications
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      // Ensure user is a trucker
      if (req.user!.userType !== "trucker") {
        return res.status(403).json({ message: "Only truckers can apply for jobs" });
      }

      // Validate request body
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        truckerId: req.user!.id
      });

      // Check if job exists
      const job = await storage.getJob(validatedData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if trucker already applied for this job
      const existingBookings = await storage.getBookingsByJob(validatedData.jobId);
      const alreadyApplied = existingBookings.some(b => b.truckerId === req.user!.id);

      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      // Create booking
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/trucker/bookings", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.userType !== "trucker") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const bookings = await storage.getBookingsByTrucker(req.user!.id);

      // Get all associated jobs
      const bookingsWithJobs = await Promise.all(
          bookings.map(async (booking) => {
            const job = await storage.getJob(booking.jobId);
            return { ...booking, job };
          })
      );

      res.json(bookingsWithJobs);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/broker/job/:jobId/applications", isAuthenticated, async (req, res) => {
    try {
      if (req.user!.userType !== "broker") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJob(jobId);

      // Ensure broker owns this job
      if (!job || job.brokerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view applications for this job" });
      }

      const bookings = await storage.getBookingsByJob(jobId);

      // Get all applicant details
      const bookingsWithApplicants = await Promise.all(
          bookings.map(async (booking) => {
            const user = await storage.getUser(booking.truckerId);
            const profile = await storage.getTruckerProfile(booking.truckerId);
            return { ...booking, trucker: user, truckerProfile: profile };
          })
      );

      res.json(bookingsWithApplicants);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/bookings/:id/status", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;

      if (!["pending", "accepted", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify authorization (broker who owns the job or trucker who applied)
      const job = await storage.getJob(booking.jobId);
      if (!job) {
        return res.status(404).json({ message: "Associated job not found" });
      }

      if (req.user!.userType === "broker" && job.brokerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }

      if (req.user!.userType === "trucker" && booking.truckerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }

      // Only brokers can accept/reject, only truckers can mark as completed
      if (req.user!.userType === "broker" && status === "completed") {
        return res.status(403).json({ message: "Only truckers can mark jobs as completed" });
      }

      if (req.user!.userType === "trucker" && (status === "accepted" || status === "rejected")) {
        return res.status(403).json({ message: "Only brokers can accept or reject applications" });
      }

      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      res.json(updatedBooking);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Messaging routes
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const conversations = await storage.getUserConversations(userId);

      // Get other user details for each conversation
      const conversationsWithUsers = await Promise.all(
          conversations.map(async (conv) => {
            const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const otherUser = await storage.getUser(otherUserId);

            // Get the latest message
            const messages = await storage.getMessages(conv.id);
            const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            // Count unread messages
            const unreadCount = messages.filter(m => m.receiverId === userId && !m.isRead).length;

            return {
              ...conv,
              otherUser,
              latestMessage,
              unreadCount
            };
          })
      );

      res.json(conversationsWithUsers);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user!.id;

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Ensure user is part of the conversation
      if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }

      const messages = await storage.getMessages(conversationId);

      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, userId);

      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const senderId = req.user!.id;
      const { receiverId, content } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ message: "Receiver ID and content are required" });
      }

      // Validate that receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      // Check if conversation exists, create if not
      let conversation = await storage.getConversationByUsers(senderId, receiverId);

      if (!conversation) {
        conversation = await storage.createConversation({
          user1Id: senderId,
          user2Id: receiverId
        });
      }

      // Create message
      const validatedData = insertMessageSchema.parse({
        senderId,
        receiverId,
        content
      });

      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin Routes - Only accessible to admin users
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user!.userType === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  };

  // Get all users
  app.get("/api/admin/all-users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get pending truckers
  app.get("/api/admin/pending-truckers", isAdmin, async (req, res) => {
    try {
      const pendingTruckers = await storage.getPendingTruckers();
      res.json(pendingTruckers);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get pending brokers
  app.get("/api/admin/pending-brokers", isAdmin, async (req, res) => {
    try {
      const pendingBrokers = await storage.getPendingBrokers();
      res.json(pendingBrokers);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get admin action history
  app.get("/api/admin/action-history", isAdmin, async (req, res) => {
    try {
      const adminId = req.user!.id;
      const actions = await storage.getAdminActions(adminId);
      res.json(actions);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Approve or reject user
  app.post("/api/admin/approve-user", isAdmin, async (req, res) => {
    try {
      const { userId, approved, message } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user status
      const status = approved ? "approved" : "rejected";
      const updatedUser = await storage.updateUser(userId, { status });

      // Record admin action
      await storage.createAdminAction({
        adminId: req.user!.id,
        userId,
        action: approved ? "approve" : "reject",
        reason: message
      });

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get user profile details
  app.get("/api/admin/user-profile/:userId", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let profile = null;
      if (user.userType === "trucker") {
        profile = await storage.getTruckerProfile(userId);
      } else if (user.userType === "broker") {
        profile = await storage.getBrokerProfile(userId);
      }

      res.json({
        user,
        profile
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
