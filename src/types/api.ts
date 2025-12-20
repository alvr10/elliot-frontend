/**
 * API Types
 * Elliot Frontend Application
 */

export enum ErrorCode {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

export interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
}

// Auth types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  session: any; // Supabase session
}

export interface LoginDto {
  email: string;
}

export interface RegisterDto {
  email: string;
  name: string;
}

export interface MagicLinkResponse {
  message: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name?: string;
  dailyLimit?: number;
}

// Admin types
export interface AdminStatsResponse {
  totalUsers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  recentSignups: number;
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface SubscriptionStatsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
}

export interface RevenueStatsResponse {
  totalRevenue: number;
  monthlyRevenue: number;
  averageRevenuePerUser: number;
}

export interface SignupResponse {
  id: string;
  email: string;
  createdAt: string;
}

// Caffeine types
export interface LogIntakeDto {
  drinkId: string;
  servings: number;
  consumedAt: string;
}

export interface IntakeLogResponse {
  id: string;
  drinkId: string;
  servings: number;
  consumedAt: string;
  caffeineMg: number;
  drink?: Drink;
}

export interface DailyLimitResponse {
  dailyLimitMg: number;
  recommendedLimitMg: number;
}

export interface UpdateDailyLimitDto {
  dailyCaffeineLimit: number;
}

export interface UpdateDailyLimitResponse {
  dailyCaffeineLimit: number;
}

export interface Drink {
  id: string;
  name: string;
  caffeine_per_serving: number;
  category: string;
  brand: string;
  serving_size: string;
  is_public: boolean;
  image_url: string;
  description: string;
}

// Subscription types
export interface CreateSubscriptionDto {
  planId: string;
}

export interface SubscriptionResponse {
  message: string;
  userId: string;
  planId: string;
  subscriptionType: string;
}

export interface SubscriptionStatusResponse {
  userId: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
}
