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
