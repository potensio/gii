import bcrypt from "bcryptjs";
import { User, UserStatus } from "../generated/prisma/client";
import { userRepository } from "../repositories/user.repository";
import { 
  generateTokenPair, 
  verifyRefreshToken, 
  sanitizeUser,
  type TokenPair 
} from "../auth";
import { 
  loginFormSchema, 
  signupFormSchema,
  type LoginFormData,
  type SignupFormData,
  type AuthResponse,
  type AuthUser 
} from "../schemas/auth-schema";

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(input: LoginFormData): Promise<{
    success: boolean;
    message: string;
    user?: AuthUser;
    tokens?: TokenPair;
  }> {
    try {
      // Validate input
      const validatedInput = loginFormSchema.parse(input);

      // Find user by email
      const user = await userRepository.findByEmail(validatedInput.email);
      if (!user) {
        return {
          success: false,
          message: "Email atau password tidak valid",
        };
      }

      // Check if user is active
      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          message: "Akun Anda tidak aktif. Silakan hubungi administrator.",
        };
      }

      // Verify password
      if (!user.password) {
        return {
          success: false,
          message: "Password belum diatur untuk akun ini",
        };
      }

      const isPasswordValid = await bcrypt.compare(
        validatedInput.password,
        user.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Email atau password tidak valid",
        };
      }

      // Update last login
      await userRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokens = generateTokenPair(user);

      // Return success response
      return {
        success: true,
        message: "Login berhasil",
        user: this.formatUserResponse(user),
        tokens,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat login",
      };
    }
  }

  /**
   * Register a new user
   */
  async signup(input: SignupFormData): Promise<{
    success: boolean;
    message: string;
    user?: AuthUser;
    tokens?: TokenPair;
  }> {
    try {
      // Validate input
      const validatedInput = signupFormSchema.parse(input);

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(validatedInput.email);
      if (existingUser) {
        return {
          success: false,
          message: "Email sudah terdaftar",
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedInput.password, 12);

      // Create user
      const newUser = await userRepository.create({
        name: validatedInput.name,
        email: validatedInput.email,
        password: hashedPassword,
        role: "USER", // Default role
        status: "ACTIVE", // Default status
      });

      // Generate tokens
      const tokens = generateTokenPair(newUser);

      // Return success response
      return {
        success: true,
        message: "Pendaftaran berhasil",
        user: this.formatUserResponse(newUser),
        tokens,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mendaftar",
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    message: string;
    user?: AuthUser;
    tokens?: TokenPair;
  }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        return {
          success: false,
          message: "Token refresh tidak valid",
        };
      }

      // Find user
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      // Check if user is still active
      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          message: "Akun tidak aktif",
        };
      }

      // Generate new token pair
      const tokens = generateTokenPair(user);

      return {
        success: true,
        message: "Token berhasil diperbarui",
        user: this.formatUserResponse(user),
        tokens,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return {
        success: false,
        message: "Gagal memperbarui token",
      };
    }
  }

  /**
   * Get user profile from token
   */
  async getProfile(userId: string): Promise<{
    success: boolean;
    message: string;
    user?: AuthUser;
  }> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      if (user.status !== UserStatus.ACTIVE) {
        return {
          success: false,
          message: "Akun tidak aktif",
        };
      }

      return {
        success: true,
        message: "Profile berhasil diambil",
        user: this.formatUserResponse(user),
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: "Gagal mengambil profile",
      };
    }
  }

  /**
   * Logout user (invalidate tokens)
   */
  async logout(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // In a more sophisticated implementation, you might want to:
      // 1. Blacklist the current tokens
      // 2. Increment token version to invalidate all existing tokens
      // 3. Log the logout event
      
      // For now, we'll just return success
      // The actual token invalidation happens on the client side
      return {
        success: true,
        message: "Logout berhasil",
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: "Gagal logout",
      };
    }
  }

  /**
   * Validate user credentials for password change
   */
  async validatePassword(userId: string, currentPassword: string): Promise<boolean> {
    try {
      const user = await userRepository.findById(userId);
      if (!user || !user.password) {
        return false;
      }

      return await bcrypt.compare(currentPassword, user.password);
    } catch (error) {
      console.error("Password validation error:", error);
      return false;
    }
  }

  /**
   * Format user data for client response
   */
  private formatUserResponse(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };
  }
}

export const authService = new AuthService();