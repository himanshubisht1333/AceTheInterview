/**
 * Auth API Service
 *
 * This file provides utility functions for authentication API calls.
 * The main auth logic is managed by the Zustand store (lib/auth.store.ts)
 */

import { API_ENDPOINTS } from "./api.config";

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    token: string;
}

export interface UserResponse {
    user: {
        _id: string;
        name: string;
        email: string;
    };
}

/**
 * Register a new user
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
}

/**
 * Login user
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

/**
 * Get current user (requires token)
 */
export async function getUser(token: string): Promise<UserResponse> {
    const response = await fetch(API_ENDPOINTS.AUTH.GET_USER, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user");
    }

    return data;
}
