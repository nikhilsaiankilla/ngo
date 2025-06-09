// Utility function to extract a readable error message from unknown errors
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;        // Standard JS Error object
    if (typeof error === 'string') return error;             // Custom string error
    return 'Unknown error occurred';                         // Fallback message
}

// Define the allowed user roles in the system (used for type safety)
export type UserRole = 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';

// Map for upgrading user roles in a fixed promotion chain
// Used for scenarios like requesting/promoting user roles
export const roleUpgradeMap: Record<UserRole, UserRole | undefined> = {
    REGULAR: 'MEMBER',             // REGULAR → MEMBER
    MEMBER: 'TRUSTIE',             // MEMBER → TRUSTIE
    TRUSTIE: 'UPPER_TRUSTIE',      // TRUSTIE → UPPER_TRUSTIE
    UPPER_TRUSTIE: undefined,      // No upgrade beyond UPPER_TRUSTIE
};

// Constant array representing the role hierarchy from lowest to highest
const ROLES = ['REGULAR', 'MEMBER', 'TRUSTIE', 'UPPER_TRUSTIE'] as const

// Role type derived from the ROLES array (for consistency and type safety)
export type Role = typeof ROLES[number]

// Utility to check if a user's role satisfies a required role based on hierarchy
// Returns true if userRole is equal to or higher than requiredRole
export function hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLES.indexOf(userRole) >= ROLES.indexOf(requiredRole)
}

import { remark } from 'remark';
import html from 'remark-html';

export const markdownToHtml = async (markdown: string) => {
    const result = await remark().use(html).process(markdown);
    return result.toString();
};

// helper function to convert Firestore timestamp to ISO string
export function timestampToISOString(
    timestamp?: { seconds: number; nanoseconds: number } | string | null
): string | null {
    if (!timestamp) return null;
    if (typeof timestamp === 'string') return timestamp;
    return new Date(timestamp.seconds * 1000).toISOString();
}