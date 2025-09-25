import { Prisma, User, UserRole, UserStatus } from "../generated/prisma/client";
import {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  PaginationOptions,
} from "../schemas/user.schema";
import { db } from "../db";

export class UserRepository {
  async create(data: CreateUserInput): Promise<User> {
    return db.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
    });
  }

  async findMany(
    filters: UserFilters = {},
    pagination: PaginationOptions
  ): Promise<{ users: User[]; total: number }> {
    const {
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const { role, status, search } = filters;

    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      db.user.count({ where }),
    ]);

    return { users, total };
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return db.user.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<{ count: number }> {
    return db.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async updateLastLogin(id: string): Promise<User> {
    return db.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Record<UserRole, number>;
  }> {
    const [
      total,
      active,
      inactive,
      suspended,
      adminCount,
      userCount,
      moderatorCount,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: UserStatus.ACTIVE } }),
      db.user.count({ where: { status: UserStatus.INACTIVE } }),
      db.user.count({ where: { status: UserStatus.SUSPENDED } }),
      db.user.count({ where: { role: UserRole.ADMIN } }),
      db.user.count({ where: { role: UserRole.USER } }),
      db.user.count({ where: { role: UserRole.MODERATOR } }),
    ]);

    return {
      total,
      active,
      inactive,
      suspended,
      byRole: {
        [UserRole.ADMIN]: adminCount,
        [UserRole.USER]: userCount,
        [UserRole.MODERATOR]: moderatorCount,
      },
    };
  }
}

export const userRepository = new UserRepository();
