"use server";

import { sendEmail } from "@/utils/mail";
import { ContactFormAdminNotification, ContactFormAutoReplyTemplate } from "@/utils/MailTemplates";

interface ContactFormValues {
    name: string;
    email: string;
    message: string;
}

export const contactFormAction = async (values: ContactFormValues) => {
    try {
        // Send to admin
        const htmlToAdmin = ContactFormAdminNotification(
            values.name,
            values.email,
            values.message
        );

        await sendEmail(
            "nikhilsaiankilla@gmail.com",
            "Message from Hussaini Contact Form",
            htmlToAdmin
        );

        // Send auto-response to user
        const htmlToUser = ContactFormAutoReplyTemplate(values.name);

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
        console.error("Error sending contact form emails:", err);
        return {
            success: false,
            status: 500,
            message: "Something went wrong. Please try again later.",
        };
    }
};
