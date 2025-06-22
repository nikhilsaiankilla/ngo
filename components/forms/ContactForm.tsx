'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader } from '../ui/card'
import { toast } from 'sonner'
import { contactFormAction } from '@/actions/mail'

const formSchema = z.object({
    name: z.string().min(1, 'Enter your name'),
    email: z.string().email('Enter a valid email'),
    message: z.string().min(5),
})

type FormValues = z.infer<typeof formSchema>

const ContactForm = () => {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            message: '',
        },
    })

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true)
        try {

            console.log(values);


            if (values?.message && values?.email && values?.name) {
                const res = await contactFormAction(values);

                if (!res?.success) {
                    return toast.warning('something went wrong');
                }

                toast.success('message sent successfully')
            } else {
                toast.error('all fields are required')
            }
            // Reset form
            form.reset()
        } catch (err) {
            console.error('Form error', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full mt-5 shadow-xl border mx-auto rounded-2xl bg-white">
            <CardHeader className="text-center pb-2">
                <h2 className="text-2xl font-bold">Contact Association</h2>
                <p className="text-sm text-muted-foreground">Send Direct Message to the Hussaini Welfare Association</p>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your name"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your email"
                                            type="email"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Message */}
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Your message"
                                            {...field}
                                            disabled={isLoading}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader className="animate-spin h-4 w-4 mr-2" />
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default ContactForm
