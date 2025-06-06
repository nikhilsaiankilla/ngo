import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to conditionally join class names and merge Tailwind classes properly.
 * - `clsx` handles conditional className logic (e.g., truthy/falsy values, arrays, objects).
 * - `twMerge` ensures conflicting Tailwind classes (like `p-2` and `p-4`) are resolved cleanly.
 *
 * @param inputs - List of class name values (strings, arrays, objects, etc.)
 * @returns A single merged string of valid class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
