import { markdownToHtml } from "@/utils/helpers";
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

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export const getBase64FromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export function extractCloudinaryPublicId(url: string) {
  try {
    // Remove the Cloudinary upload prefix
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // Get the path after upload/
    const path = parts[1];

    // Remove versioning (e.g., v1234567890/)
    const pathWithoutVersion = path.replace(/^v\d+\//, '');

    // Remove file extension
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error: unknown) {
    return null;
  }
}


export async function markdownToHtmlText(text: string): Promise<string> {
  // Convert markdown to HTML
  const html: string = await markdownToHtml(text);

  // Strip all HTML tags
  let strippedText: string = html.replace(/<[^>]*>?/gm, '');

  // Remove emojis using regex (covers most common emojis)
  strippedText = strippedText.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uD000-\uDFFF]|\uD83D[\uD000-\uDFFF]|\uFE0F|\u200D)/g,
    ''
  );


  return strippedText.trim();
}

// Function to generate a random 4-digit number
export function getRandomFourDigits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
}
