import { UserRole, UserStatus, User } from '../models';
import { Op } from 'sequelize';
import { AppError } from '../utils/errorHandler';
import { generateToken } from '../middleware/auth';

export class UserService {
  // Create a new user
  static async createUser(userData: any) {
    const user = await User.create(userData);
    const token = generateToken(user.id, user.email, user.role);
    return { user, token };
  }

  // Login user
  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user.id, user.email, user.role);
    return { user, token };
  }

  // Get user by ID
  static async getUserById(id: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Update user
  static async updateUser(id: string, updateData: any) {
    const user = await this.getUserById(id);
    await user.update(updateData);
    return user;
  }

  // Get all users with pagination
  static async getAllUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { count, rows: users } = await User.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      users,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  // Search users
  static async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { count, rows: users } = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${query}%` } },
          { lastName: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
        ],
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      users,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  // Change user status
  static async changeUserStatus(id: string, status: UserStatus) {
    const user = await this.getUserById(id);
    await user.update({ status });
    return user;
  }

  // Change user role
  static async changeUserRole(id: string, role: UserRole) {
    const user = await this.getUserById(id);
    await user.update({ role });
    return user;
  }

  // Delete user
  static async deleteUser(id: string) {
    const user = await this.getUserById(id);
    await user.destroy();
  }
} 