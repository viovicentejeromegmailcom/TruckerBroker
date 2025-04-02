import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table - base for truckers, brokers, and admins
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  userType: text("user_type", { enum: ["trucker", "broker", "admin"] }).notNull(),
  status: text("status", { enum: ["pending", "approved", "verified", "rejected"] }).default("pending").notNull(),
  verificationToken: text("verification_token"),
  verificationExpires: timestamp("verification_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Trucker profile table
export const truckerProfiles = pgTable("trucker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  contactNumber: text("contact_number").notNull(),
  businessEmail: text("business_email").notNull(),

  // Legal & Compliance Documents
  bir2303Certificate: text("bir_2303_certificate"),
  businessPermit: text("business_permit"),
  insuranceCoverage: text("insurance_coverage"),
  permitToOperate: text("permit_to_operate"),

  // Vehicle Information
  vehicles: json("vehicles").$type<{
    vehicleType: string;
    vehicleMake: string;
    plateNumber: string;
    weightCapacity: string;
    truckDocuments: string;
  }[]>().default([]),

  // Additional fields
  serviceAreas: json("service_areas").$type<string[]>(),
  licensePlate: text("license_plate"),
  licenseNumber: text("license_number"),
  truckType: text("truck_type"),
  truckCapacity: text("truck_capacity"),
  available: boolean("available").default(true),
});

// Broker profile table
export const brokerProfiles = pgTable("broker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),

  // Basic Information
  companyName: text("company_name").notNull(),
  companyAddress: text("company_address").notNull(),
  companyCity: text("company_city").notNull(),
  companyState: text("company_state").notNull(),
  companyZip: text("company_zip").notNull(),
  contactNumber: text("contact_number").notNull(),
  businessEmail: text("business_email").notNull(),

  // Contact Person Information
  contactPersonName: text("contact_person_name").notNull(),
  contactPersonPosition: text("contact_person_position").notNull(),

  // Legal & Compliance Documents
  dtiSecRegistration: text("dti_sec_registration"),
  bir2303Certificate: text("bir_2303_certificate"),
  mayorsPermit: text("mayors_permit"),
  bocAccreditation: text("boc_accreditation"),

  // Additional fields
  businessType: text("business_type"),
  taxId: text("tax_id"),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  originCity: text("origin_city").notNull(),
  originState: text("origin_state").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationState: text("destination_state").notNull(),
  distance: integer("distance"),
  price: integer("price").notNull(),
  cargoType: text("cargo_type").notNull(),
  weight: integer("weight"),
  loadType: text("load_type").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  companyName: text("company_name"),
  status: text("status", { enum: ["active", "pending", "completed", "cancelled"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

// Conversations table to group messages
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  lastMessageTime: timestamp("last_message_time").defaultNow().notNull(),
});

// Applications/Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  truckerId: integer("trucker_id").notNull().references(() => users.id),
  status: text("status", { enum: ["pending", "accepted", "rejected", "completed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin Action History table
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action", { enum: ["approve", "reject"] }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users)
    .omit({ id: true, createdAt: true, verificationToken: true, verificationExpires: true });

export const insertTruckerProfileSchema = createInsertSchema(truckerProfiles)
    .omit({ id: true });

export const insertBrokerProfileSchema = createInsertSchema(brokerProfiles)
    .omit({ id: true });

export const insertJobSchema = createInsertSchema(jobs)
    .omit({ id: true, status: true, createdAt: true });

export const insertMessageSchema = createInsertSchema(messages)
    .omit({ id: true, createdAt: true, isRead: true });

export const insertConversationSchema = createInsertSchema(conversations)
    .omit({ id: true, lastMessageTime: true });

export const insertBookingSchema = createInsertSchema(bookings)
    .omit({ id: true, status: true, createdAt: true });

export const insertAdminActionSchema = createInsertSchema(adminActions)
    .omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TruckerProfile = typeof truckerProfiles.$inferSelect;
export type InsertTruckerProfile = z.infer<typeof insertTruckerProfileSchema>;

export type BrokerProfile = typeof brokerProfiles.$inferSelect;
export type InsertBrokerProfile = z.infer<typeof insertBrokerProfileSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;

// Define vehicle type for truckers
export const vehicleSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  weightCapacity: z.string().min(1, "Weight capacity is required"),
  truckDocuments: z.string().optional(),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

// Extended registration schemas
export const truckerRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  // Basic Information
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Business address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  businessEmail: z.string().email("Invalid email address"),

  // Legal & Compliance Documents
  bir2303Certificate: z.string().optional(),
  businessPermit: z.string().optional(),
  insuranceCoverage: z.string().optional(),
  permitToOperate: z.string().optional(),

  // Vehicle Information
  vehicles: z.array(vehicleSchema).optional(),
}).superRefine((data, ctx) => {
  // Check that password matches confirmPassword
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export const brokerRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string(),

  // Basic Information
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Business address is required"),
  companyCity: z.string().min(1, "City is required"),
  companyState: z.string().min(1, "State is required"),
  companyZip: z.string().min(1, "ZIP code is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  businessEmail: z.string().email("Invalid email address"),

  // Contact Person Information
  contactPersonName: z.string().min(1, "Contact person name is required"),
  contactPersonPosition: z.string().min(1, "Contact person position is required"),

  // Legal & Compliance Documents
  dtiSecRegistration: z.string().optional(),
  bir2303Certificate: z.string().optional(),
  mayorsPermit: z.string().optional(),
  bocAccreditation: z.string().optional(),
}).superRefine((data, ctx) => {
  // Check that password matches confirmPassword
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Admin registration schema
export const adminRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  adminKey: z.string().min(1, "Admin key is required"),
}).superRefine((data, ctx) => {
  // Check that password matches confirmPassword
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

// Account verification schema
export const verifyAccountSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// User account approval schema (for admin use)
export const approveUserSchema = z.object({
  userId: z.number().min(1, "User ID is required"),
  approved: z.boolean(),
  message: z.string().optional(),
});

export type TruckerRegisterInput = z.infer<typeof truckerRegisterSchema>;
export type BrokerRegisterInput = z.infer<typeof brokerRegisterSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyAccountInput = z.infer<typeof verifyAccountSchema>;
export type ApproveUserInput = z.infer<typeof approveUserSchema>;
