// types/index.ts
import { Timestamp } from "firebase-admin/firestore";
import { RecaptchaVerifier } from "firebase/auth";

export interface ServerActionResponse<T = unknown> {
    success: boolean;
    status: number;
    message: string;
    data?: T;
}

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

export interface ManualDonationData {
    donorName?: string | null;
    amount: number;
    method?: string | null;
    notes?: Record<string, any> | null;
}

export interface DonationStats {
    month: string;
    total: number;
    count: number;
};

export interface UserTypeDistributionTypes {
    userType: string
    count: number
}

export type UserType = "REGULAR" | "MEMBER" | "TRUSTIE" | "UPPER_TRUSTIE"; // extend as needed

export interface GrowthByMonth {
    month: string;
    count: number;
}

export interface DonationStats {
    month: string;
    total: number;
    count: number;
}

export interface UserTypeDistributionTypes {
    userType: string;
    count: number;
}

export interface APIResponse<T = unknown> {
    success: boolean;
    message: string;
    status: number;
    data?: T;
}

export interface AddEventInput {
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string; // hosted image URL
    startDate: Date;
    endDate: Date;
}

export interface ServerResponse {
    success: boolean;
    message: string;
    status: number;
    data?: any;
}

export interface UpdateEventInput {
    id: string;
    title: string;
    tagline: string;
    location: string;
    description: string;
    image: string | null;
    startDate: string | Date;
    endDate: string | Date;
};

export interface ContactFormValues {
    name: string;
    email: string;
    message: string;
}

export interface RequestRoleUpgradeInput {
    requestedRole: 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE'
    message: string
}

export interface RoleRequest {
    id: string;
    userId: string;
    name: string;
    status: string;
    message: string;
    requestedRole: string;
    currentRole: string;
    createdAt: Timestamp;
};

export interface AddServiceInput {
    title: string;
    tagline: string;
    description: string;
    image: string; // hosted image URL
}

export interface UpdateServiceInput {
    id: string;
    title: string;
    tagline: string;
    description: string;
    image: string;
}

export type OrderBody = {
    amount: number;
    currency: string;
}

// Response types
export interface CronResponse {
    success: boolean;
    message: string;
    error?: string;
    executionTime?: number;
    metrics?: {
        memoryUsage: number;
        cpuTime: number;
    };
}

export interface VerifyBody {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface Transaction {
    userId: string | null;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    status: "success" | "failed" | "pending";
    invoiceId?: string,
    invoice_url?: string,
    reason?: string;
    amount?: number;
    currency?: string;
    method?: string;
    email?: string;
    contact?: string;
    notes?: Record<string, string>;
    fee?: number;
    tax?: number;
    captured?: boolean;
    created_at?: number;
    timestamp: Timestamp;
}