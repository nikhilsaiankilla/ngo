'use client';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
    }
}

import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { auth } from '@/firebase/firebase';
import { toast } from 'sonner';
import { savePhoneNumber } from '@/actions/auth';
import { Loader2, Verified } from 'lucide-react';

type Props = {
    defaultPhone?: string;
    isVerified?: boolean;
};

export const PhoneVerification: React.FC<Props> = ({ defaultPhone = '', isVerified = false }) => {
    const [phone, setPhone] = useState(defaultPhone);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [verified, setVerified] = useState(isVerified);
    const recaptchaRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!verified && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA solved');
                },
                'expired-callback': () => {
                    console.warn('reCAPTCHA expired');
                },
            });

            window.recaptchaVerifier.render().then((widgetId) => {
                console.log('reCAPTCHA widget rendered', widgetId);
            });
        }
    }, [verified]);

    const sendOTP = async () => {
        setLoading(true);
        console.log('inside send otp');

        if (!phone) {
            setLoading(false);
            return toast.error('Enter phone number');
        }

        try {

            if (!window.recaptchaVerifier) {
                return toast.error('reCAPTCHA not ready');
            }

            const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);

            if (confirmation) {
                setConfirmationResult(confirmation);
                setOtpSent(true);
            }
        } catch (err: unknown) {
            toast?.error('Something went wrong')
            console.log(err);
            
        }

        setLoading(false)
    };

    const verifyOTP = async () => {
        try {
            setLoading(true)
            await confirmationResult.confirm(otp);

            // Save to your DB via API
            const res = await savePhoneNumber(phone)

            if (res.success) {
                setVerified(true);
                toast?.success('Phone verified and saved');
            } else {
                toast?.error('Verification failed');
            }
            setLoading(false)
        } catch (err: unknown) {
            toast?.error('Incorrect OTP')
        }
        setLoading(false)
    };

    if (verified) {
        return (
            <div className="flex items-center gap-2 mt-4">
                <span className="font-medium flex items-center gap-2">
                    {defaultPhone || phone}
                    <span className='test-xs font-normal flex items-center gap-1'><Verified size={16} className='text-green-400' /> Verified</span>
                </span>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-2">
                <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border px-3 py-2 rounded"
                    placeholder="+91XXXXXXXXXX"
                />
                {!otpSent ? (
                    <Button onClick={sendOTP} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {loading ? <><Loader2 size={24} className='animate-spin' /> sending OTP</> : "Send OTP"}
                    </Button>
                ) : (
                    <>
                        <Input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="border px-3 py-2 rounded"
                            placeholder="Enter OTP"
                        />
                        <Button onClick={verifyOTP} className="bg-green-600 text-white px-4 py-2 rounded">
                            {loading ? <><Loader2 size={24} className='animate-spin' /> verifying</> : "Verify"}
                        </Button>
                    </>
                )}
            </div>
            <div id="recaptcha-container" ref={recaptchaRef}></div>
        </div>
    );
};
