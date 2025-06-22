"use server";

import { ContactFormValues } from "@/types";
import { sendEmail } from "@/utils/mail";
import { ContactFormAdminNotification, ContactFormAutoReplyTemplate } from "@/utils/MailTemplates";

/**
 * Handles contact form submissions.
 *
 * Workflow:
 * 1. Sends a notification email to the admin with the user's message.
 * 2. Sends an automatic reply to the user confirming message receipt.
 * 
 * @param values - Object containing the user's name, email, and message.
 * @returns A response object indicating success or failure of the operation.
 */

export const contactFormAction = async (values: ContactFormValues) => {
    try {
        // Generate email HTML content for admin notification
        const htmlToAdmin = ContactFormAdminNotification(
            values.name,
            values.email,
            values.message
        );

        // Send the notification email to the admin
        await sendEmail(
            "nikhilsaiankilla@gmail.com",
            "Message from Hussaini Contact Form",
            htmlToAdmin
        );

        // Generate auto-reply email content for the user
        const htmlToUser = ContactFormAutoReplyTemplate(values?.name);

        // Send confirmation email to the user
        await sendEmail(
            values.email,
            "Message Received by Hussaini Welfare Team",
            htmlToUser
        );

        return {
            success: true,
            status: 200,
            message: "Message sent successfully!",
        };
    } catch (err) {
        // Log error and return failure response
        console.error("Error sending contact form emails:", err);
        return {
            success: false,
            status: 500,
            message: "Something went wrong. Please try again later.",
        };
    }
};
