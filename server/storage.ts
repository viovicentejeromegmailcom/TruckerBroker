import {
  User, InsertUser,
  TruckerProfile, InsertTruckerProfile,
  BrokerProfile, InsertBrokerProfile,
  Job, InsertJob,
  Message, InsertMessage,
  Conversation, InsertConversation,
  Booking, InsertBooking,
  AdminAction, InsertAdminAction,
  users, truckerProfiles, brokerProfiles, jobs,
  conversations, messages, bookings, adminActions
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { eq, and, or, desc } from "drizzle-orm";
import { db, pool } from "./db";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUsersByStatus(status: User['status']): Promise<User[]>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getAllUsers(excludeUserId?: number): Promise<User[]>;
  getPendingTruckers(): Promise<User[]>;
  getPendingBrokers(): Promise<User[]>;

  // Trucker Profile operations
  getTruckerProfile(userId: number): Promise<TruckerProfile | undefined>;
  createTruckerProfile(profile: InsertTruckerProfile): Promise<TruckerProfile>;
  updateTruckerProfile(userId: number, profile: Partial<TruckerProfile>): Promise<TruckerProfile | undefined>;

  // Broker Profile operations
  getBrokerProfile(userId: number): Promise<BrokerProfile | undefined>;
  createBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile>;
  updateBrokerProfile(userId: number, profile: Partial<BrokerProfile>): Promise<BrokerProfile | undefined>;

  // Job operations
  getJob(id: number): Promise<Job | undefined>;
  getJobs(filters?: Partial<Job>): Promise<Job[]>;
  getJobsByBroker(brokerId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;

  // Message & Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByUsers(user1Id: number, user2Id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByJob(jobId: number): Promise<Booking[]>;
  getBookingsByTrucker(truckerId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined>;

  // Admin actions operations
  getAdminActions(adminId: number): Promise<AdminAction[]>;
  createAdminAction(action: InsertAdminAction): Promise<AdminAction>;

  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PostgresSessionStore = connectPg(session);

    // Create the session store
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
    return updated;
  }

  async getUsersByStatus(status: User['status']): Promise<User[]> {
    return await db
        .select()
        .from(users)
        .where(eq(users.status, status))
        .orderBy(users.createdAt);
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.verificationToken, token));
    return user;
  }

  async getAllUsers(excludeUserId?: number): Promise<User[]> {
    // Using a simpler approach to avoid Drizzle typing issues
    const allUsers = await db.select().from(users).orderBy(users.createdAt);

    // Exclude a specific user if requested (e.g., the current admin)
    if (excludeUserId) {
      return allUsers.filter(user => user.id !== excludeUserId);
    }

    return allUsers;
  }

  async getPendingTruckers(): Promise<User[]> {
    const pendingUsers = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.status, "verified"),
                eq(users.userType, "trucker")
            )
        )
        .orderBy(users.createdAt);
    return pendingUsers;
  }

  async getPendingBrokers(): Promise<User[]> {
    const pendingUsers = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.status, "verified"),
                eq(users.userType, "broker")
            )
        )
        .orderBy(users.createdAt);
    return pendingUsers;
  }

  // Trucker Profile operations
  async getTruckerProfile(userId: number): Promise<TruckerProfile | undefined> {
    const [profile] = await db.select().from(truckerProfiles).where(eq(truckerProfiles.userId, userId));
    return profile;
  }

  async createTruckerProfile(profile: InsertTruckerProfile): Promise<TruckerProfile> {
    const [truckerProfile] = await db.insert(truckerProfiles).values(profile).returning();
    return truckerProfile;
  }

  async updateTruckerProfile(userId: number, updates: Partial<TruckerProfile>): Promise<TruckerProfile | undefined> {
    const [profile] = await db.select().from(truckerProfiles).where(eq(truckerProfiles.userId, userId));
    if (!profile) return undefined;

    const [updated] = await db
        .update(truckerProfiles)
        .set(updates)
        .where(eq(truckerProfiles.id, profile.id))
        .returning();
    return updated;
  }

  // Broker Profile operations
  async getBrokerProfile(userId: number): Promise<BrokerProfile | undefined> {
    const [profile] = await db.select().from(brokerProfiles).where(eq(brokerProfiles.userId, userId));
    return profile;
  }

  async createBrokerProfile(profile: InsertBrokerProfile): Promise<BrokerProfile> {
    const [brokerProfile] = await db.insert(brokerProfiles).values(profile).returning();
    return brokerProfile;
  }

  async updateBrokerProfile(userId: number, updates: Partial<BrokerProfile>): Promise<BrokerProfile | undefined> {
    const [profile] = await db.select().from(brokerProfiles).where(eq(brokerProfiles.userId, userId));
    if (!profile) return undefined;

    const [updated] = await db
        .update(brokerProfiles)
        .set(updates)
        .where(eq(brokerProfiles.id, profile.id))
        .returning();
    return updated;
  }

  // Job operations
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobs(filters: Partial<Job> = {}): Promise<Job[]> {
    let query = db.select().from(jobs);

    // Apply filters if any
    const conditions = [];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && key in jobs) {
        conditions.push(eq(jobs[key as keyof typeof jobs], value));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(jobs.createdAt));
  }

  async getJobsByBroker(brokerId: number): Promise<Job[]> {
    return await db
        .select()
        .from(jobs)
        .where(eq(jobs.brokerId, brokerId))
        .orderBy(desc(jobs.createdAt));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values({
      ...insertJob,
      status: "active"
    }).returning();
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job | undefined> {
    const [updated] = await db
        .update(jobs)
        .set(updates)
        .where(eq(jobs.id, id))
        .returning();
    return updated;
  }

  // Message & Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationByUsers(user1Id: number, user2Id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
        .select()
        .from(conversations)
        .where(
            or(
                and(
                    eq(conversations.user1Id, user1Id),
                    eq(conversations.user2Id, user2Id)
                ),
                and(
                    eq(conversations.user1Id, user2Id),
                    eq(conversations.user2Id, user1Id)
                )
            )
        );
    return conversation;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return await db
        .select()
        .from(conversations)
        .where(
            or(
                eq(conversations.user1Id, userId),
                eq(conversations.user2Id, userId)
            )
        )
        .orderBy(desc(conversations.lastMessageTime));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return [];

    return await db
        .select()
        .from(messages)
        .where(
            or(
                and(
                    eq(messages.senderId, conversation.user1Id),
                    eq(messages.receiverId, conversation.user2Id)
                ),
                and(
                    eq(messages.senderId, conversation.user2Id),
                    eq(messages.receiverId, conversation.user1Id)
                )
            )
        )
        .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();

    // Find or create conversation
    let conversation = await this.getConversationByUsers(message.senderId, message.receiverId);

    if (!conversation) {
      conversation = await this.createConversation({
        user1Id: message.senderId,
        user2Id: message.receiverId
      });
    }

    // Update conversation's lastMessageTime
    await db
        .update(conversations)
        .set({ lastMessageTime: newMessage.createdAt })
        .where(eq(conversations.id, conversation.id));

    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return;

    await db
        .update(messages)
        .set({ isRead: true })
        .where(
            and(
                eq(messages.receiverId, userId),
                eq(messages.isRead, false),
                or(
                    eq(messages.senderId, conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id),
                    eq(messages.senderId, conversation.user2Id === userId ? conversation.user1Id : conversation.user2Id)
                )
            )
        );
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByJob(jobId: number): Promise<Booking[]> {
    return await db
        .select()
        .from(bookings)
        .where(eq(bookings.jobId, jobId))
        .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByTrucker(truckerId: number): Promise<Booking[]> {
    return await db
        .select()
        .from(bookings)
        .where(eq(bookings.truckerId, truckerId))
        .orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values({
      ...booking,
      status: "pending"
    }).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: Booking['status']): Promise<Booking | undefined> {
    const [updated] = await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, id))
        .returning();
    return updated;
  }

  // Admin action operations
  async getAdminActions(adminId: number): Promise<AdminAction[]> {
    return await db
        .select()
        .from(adminActions)
        .where(eq(adminActions.adminId, adminId))
        .orderBy(desc(adminActions.createdAt));
  }

  async createAdminAction(action: InsertAdminAction): Promise<AdminAction> {
    const [adminAction] = await db.insert(adminActions).values(action).returning();
    return adminAction;
  }
}

// Use the database implementation
export const storage = new DatabaseStorage();
