import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../utils/errorHandler';
import { UserRole, UserStatus } from '../models/User';

// Register a new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await UserService.createUser(req.body);
  res.status(201).json({ user, token });
});

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await UserService.loginUser(email, password);
  res.json({ user, token });
});

// Get current user profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.getUserById(req.user!.id);
  res.json({ user });
});

// Update profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.updateUser(req.user!.id, req.body);
  res.json({ user });
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = await UserService.updateUser(req.user!.id, { password });
  res.json({ message: 'Password updated successfully', user });
});

// Admin: list users
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const { users, total, pages } = await UserService.getAllUsers(page, limit);
  res.json({ users, total, pages });
});

// Admin: search users
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const { users, total, pages } = await UserService.searchUsers(query, page, limit);
  res.json({ users, total, pages });
});

// Admin: change user status
export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await UserService.changeUserStatus(id, status as UserStatus);
  res.json({ message: 'User status updated', user });
});

// Admin: change user role
export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await UserService.changeUserRole(id, role as UserRole);
  res.json({ message: 'User role updated', user });
});

// Admin: delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await UserService.deleteUser(id);
  res.json({ message: 'User deleted' });
}); 