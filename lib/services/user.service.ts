import { User, UserRole, UserStatus } from "../generated/prisma/client";
import { userRepository } from "../repositories/user.repository";
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  paginationSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserFilters,
  type PaginationOptions,
} from "../schemas/user.schema";
import bcrypt from "bcryptjs";

export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    // Validate input
    const validatedInput = createUserSchema.parse(input);

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(validatedInput.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(validatedInput.password || "", 10);

    return userRepository.create({
      ...validatedInput,
      password: hashedPassword,
    });
  }

  async getUserById(id: string): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    if (!email) {
      throw new Error("Email is required");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getUsers(
    filters: UserFilters = {},
    pagination: PaginationOptions
  ): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    // Validate inputs
    const validatedFilters = userFiltersSchema.parse(filters);
    const validatedPagination = paginationSchema.parse(pagination);

    const result = await userRepository.findMany(
      validatedFilters,
      validatedPagination
    );

    return {
      ...result,
      totalPages: Math.ceil(result.total / validatedPagination.limit),
      currentPage: validatedPagination.page,
    };
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Validate input
    const validatedInput = updateUserSchema.parse(input);

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // If email is being updated, check for conflicts
    if (validatedInput.email && validatedInput.email !== existingUser.email) {
      const emailConflict = await userRepository.findByEmail(
        validatedInput.email
      );
      if (emailConflict) {
        throw new Error("Email is already in use by another user");
      }
    }

    return userRepository.update(id, validatedInput);
  }

  async deleteUser(id: string): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Prevent deletion of the last admin
    if (existingUser.role === UserRole.ADMIN) {
      const adminCount = await userRepository.getUserStats();
      if (adminCount.byRole[UserRole.ADMIN] <= 1) {
        throw new Error("Cannot delete the last admin user");
      }
    }

    return userRepository.delete(id);
  }

  async deleteUsers(ids: string[]): Promise<{ count: number }> {
    if (!ids || ids.length === 0) {
      throw new Error("User IDs are required");
    }

    // Check if any of the users to be deleted are admins
    const users = await Promise.all(
      ids.map((id) => userRepository.findById(id))
    );
    const adminUsers = users.filter((user) => user?.role === UserRole.ADMIN);

    if (adminUsers.length > 0) {
      const stats = await userRepository.getUserStats();
      if (stats.byRole[UserRole.ADMIN] <= adminUsers.length) {
        throw new Error("Cannot delete all admin users");
      }
    }

    return userRepository.deleteMany(ids);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Prevent suspending the last admin
    if (
      status === UserStatus.SUSPENDED &&
      existingUser.role === UserRole.ADMIN
    ) {
      const stats = await userRepository.getUserStats();
      if (stats.byRole[UserRole.ADMIN] <= 1) {
        throw new Error("Cannot suspend the last admin user");
      }
    }

    return userRepository.update(id, { status });
  }

  async updateLastLogin(id: string): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    return userRepository.updateLastLogin(id);
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Record<UserRole, number>;
  }> {
    return userRepository.getUserStats();
  }
}

export const userService = new UserService();
