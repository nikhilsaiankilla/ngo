'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
        <Card className="mt-12 max-w-xl mx-auto shadow-xl border rounded-2xl bg-white dark:bg-zinc-900">
            <CardHeader className="text-center pb-2">
                <h2 className="text-2xl font-bold">Manual Donation</h2>
                <p className="text-sm text-muted-foreground">Record offline donations securely</p>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="donorName" className="text-sm">Donor Name (Optional)</Label>
                        <Input
                            id="donorName"
                            name="donorName"
                            value={form.donorName}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-sm">Amount (INR)</Label>
                        <Input
                            id="amount"
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            required
                            placeholder="500"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="method" className="text-sm">Donation Method</Label>
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

                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Any additional information..."
                            rows={3}
                        />
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full mt-2">
                        {isPending ? 'Saving...' : 'Add Donation'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
export default ManualDonationForm;
