import { db } from "@/lib/db/db";
import { users, SelectUser } from "@/lib/db/schema";
import { eq, and, or, ilike, desc, count } from "drizzle-orm";

export interface GetUsersParams {
  page?: number;
  search?: string;
  role?: "user" | "admin" | "super_admin";
  isActive?: boolean;
}

export interface GetUsersResponse {
  users: SelectUser[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const userService = {
  // Get users with pagination and filters
  getUsers: async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    const { page = 1, search, role, isActive } = params;
    const limit = 10; // Fixed limit as requested
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(users.isDeleted, false)]; // Always exclude deleted users

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (isActive !== undefined) {
      conditions.push(eq(users.isActive, isActive));
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    // Get users with pagination
    const usersResult = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    return {
      users: usersResult,
      total,
      totalPages,
      currentPage: page,
    };
  },

  // Get user by ID
  getUserById: async (id: string): Promise<SelectUser | null> => {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .limit(1);

    return result[0] || null;
  },

  // Update user
  updateUser: async (
    id: string,
    data: Partial<Pick<SelectUser, "name" | "email" | "role" | "isActive">>
  ): Promise<SelectUser | null> => {
    const result = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .returning();

    return result[0] || null;
  },

  // Soft delete user
  deleteUser: async (id: string): Promise<boolean> => {
    const result = await db
      .update(users)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.isDeleted, false)))
      .returning();

    return result.length > 0;
  },
};