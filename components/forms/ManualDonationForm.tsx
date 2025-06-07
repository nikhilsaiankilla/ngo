'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { addManualDonation } from '@/actions/addManualDonation';

const ManualDonationForm = () => {
    const [form, setForm] = useState({
        donorName: '',
        amount: '',
        method: 'Cash',
        notes: '',
    });

    const [isPending, startTransition] = useTransition();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleMethodChange = (value: string) => {
        setForm((prev) => ({ ...prev, method: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.amount || isNaN(Number(form.amount))) {
            toast.error('Please enter a valid amount.');
            return;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append('donorName', form.donorName || '');
        formData.append('amount', form.amount);
        formData.append('method', form.method);
        formData.append('notes', form.notes || '');

        startTransition(async () => {
            try {
                const result = await addManualDonation(formData);
                if (result?.success) {
                    toast.success(result.message || 'Manual donation added successfully');
                    setForm({
                        donorName: '',
                        amount: '',
                        method: 'Cash',
                        notes: '',
                    });
                } else {
                    toast.error(result?.message || 'Failed to record manual donation.');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to record manual donation.');
            }
        });
    };


    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">📋 Record Manual Donation</h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="donorName">Donor Name</Label>
                        <Input
                            id="donorName"
                            name="donorName"
                            value={form.donorName}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (INR)</Label>
                        <Input
                            id="amount"
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Donation Method</Label>
                        <Select value={form.method} onValueChange={handleMethodChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Optional notes"
                        />
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full mt-4">
                        {isPending ? 'Saving...' : 'Add Donation'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ManualDonationForm;
