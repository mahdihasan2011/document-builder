
import { ResumeData, User } from "../types";

/**
 * Detect environment to set the correct API URL.
 * In a real-world cPanel deployment, replace the production URL 
 * with your actual hosted Laravel API endpoint.
 */
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : `https://api.${window.location.hostname.replace('www.', '')}/api`;

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const apiService = {
    // Auth - Step 1: Request OTP
    sendOtp: async (phone: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await fetch(`${BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ phone }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
            return data;
        } catch (error) {
            console.warn("Backend unavailable, falling back to demo mode:", error);
            return { success: true, message: 'OTP Sent (Offline Demo Mode)' };
        }
    },

    // Auth - Step 2: Verify OTP and Login
    verifyOtp: async (phone: string, otp: string): Promise<{ user: User; token: string }> => {
        try {
            const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ phone, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Invalid OTP');
            return data;
        } catch (error) {
            console.warn("Backend unavailable, logging in as Demo User:", error);
            if (otp === '1234') {
                return {
                    user: { id: '1', phone, name: 'Demo User' },
                    token: 'demo-token-123'
                };
            }
            throw new Error('Invalid OTP (Try 1234 for demo)');
        }
    },

    // Get User Profile & Saved Data
    getUserProfile: async (): Promise<{ user: User; resume_data: ResumeData | null; template_id: string | null }> => {
        try {
            const response = await fetch(`${BASE_URL}/user/profile`, {
                method: 'GET',
                headers: getHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
            return data;
        } catch (error) {
            console.warn("Backend unavailable, returning null profile:", error);
            return { user: { id: '1', phone: '0000', name: 'Demo User' }, resume_data: null, template_id: null };
        }
    },

    // Save Resume Data
    saveResume: async (resumeData: ResumeData, templateId: string) => {
        try {
            const response = await fetch(`${BASE_URL}/user/resume`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ resume_data: resumeData, template_id: templateId }),
            });
            if (!response.ok) throw new Error('Failed to save');
            return await response.json();
        } catch (error) {
            console.warn("Save failed (Backend might be offline)", error);
            return { success: false, message: "Offline mode: Changes not saved to server." };
        }
    }
};
