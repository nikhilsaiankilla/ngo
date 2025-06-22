// ---------------------------
// Error Handling Utilities
// ---------------------------

/**
 * Utility function to extract a human-readable error message from various error types.
 * 
 * @param error - The error thrown or returned.
 * @returns A string representing the error message.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message; // Standard JavaScript Error
    if (typeof error === 'string') return error;      // Custom string error
    return 'Unknown error occurred';                  // Fallback for unhandled types
}

// ---------------------------
// User Role Utilities
// ---------------------------

/**
 * Enum-like union type representing allowed user roles in the system.
 */
export type UserRole = 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';

/**
 * Defines the role promotion chain.
 * Used when promoting users to the next role level.
 */
export const roleUpgradeMap: Record<UserRole, UserRole | undefined> = {
    REGULAR: 'MEMBER',
    MEMBER: 'TRUSTIE',
    TRUSTIE: 'UPPER_TRUSTIE',
    UPPER_TRUSTIE: undefined, // No further upgrade
};

/**
 * Ordered role hierarchy used for permission checks.
 */
const ROLES = ['REGULAR', 'MEMBER', 'TRUSTIE', 'UPPER_TRUSTIE'] as const;

/**
 * Role type derived from the ROLES array to ensure consistent usage.
 */
export type Role = typeof ROLES[number];

/**
 * Utility to check if a given user role satisfies the minimum required role.
 *
 * @param userRole - The current user's role.
 * @param requiredRole - The minimum required role to access a resource.
 * @returns `true` if userRole ≥ requiredRole in hierarchy.
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLES.indexOf(userRole) >= ROLES.indexOf(requiredRole);
}

// ---------------------------
// Markdown Utilities
// ---------------------------

import { remark } from 'remark';
import html from 'remark-html';

/**
 * Converts a Markdown string into HTML.
 *
 * @param markdown - The Markdown input string.
 * @returns A string of HTML converted from Markdown.
 */
export const markdownToHtml = async (markdown: string): Promise<string> => {
    const result = await remark().use(html).process(markdown);
    return result.toString();
};

// ---------------------------
// Timestamp Utilities
// ---------------------------

/**
 * Converts a Firestore timestamp to an ISO string.
 *
 * @param timestamp - Firestore timestamp object or already stringified timestamp.
 * @returns A valid ISO date string or null if timestamp is invalid.
 */
export function timestampToISOString(
    timestamp?: { seconds: number; nanoseconds: number } | string | null
): string | null {
    if (!timestamp) return null;
    if (typeof timestamp === 'string') return timestamp;
    return new Date(timestamp.seconds * 1000).toISOString();
}
