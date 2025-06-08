'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { requestRoleUpgrade } from '@/actions/requestRoleUpgrade';

type Props = {
    currentRole: 'REGULAR' | 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';
    requestedRole: 'MEMBER' | 'TRUSTIE' | 'UPPER_TRUSTIE';
};

export const RequestRoleButton = ({ requestedRole }: Props) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);

    // Handle sending role upgrade request
    const handleRequest = async () => {
        if (!message.trim()) {
            setFeedback('Please provide a reason for your role upgrade.');
            return;
        }

        try {
            setLoading(true);
            // Call the backend action to request role upgrade with reason message
            await requestRoleUpgrade({ requestedRole, message });

            setFeedback(`Request to upgrade to ${requestedRole} has been sent.`);
            setMessage('');
        } catch (err: unknown) {
            setFeedback('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <textarea
                aria-label="Reason for role upgrade"
                placeholder="Why do you want to upgrade?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                disabled={loading}
            />
            <Button
                onClick={handleRequest}
                disabled={loading}
                className="w-full"
                aria-live="polite"
            >
                {loading ? 'Requesting...' : `Request ${requestedRole} Access`}
            </Button>
            {feedback && (
                <p className="text-sm text-muted-foreground" role="alert" aria-live="assertive">
                    {feedback}
                </p>
            )}
        </div>
    );
};
