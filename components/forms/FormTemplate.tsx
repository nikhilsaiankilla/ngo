import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';

interface FormTemplateProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

const FormTemplate = ({ title, description, children }: FormTemplateProps) => {
    return (
        <Card className="max-w-2xl mx-auto mt-12 shadow-xl border rounded-2xl bg-white dark:bg-zinc-900">
            <CardHeader className="text-center pb-2">
                <h2 className="text-2xl font-bold">{title}</h2>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </CardHeader>

            <CardContent className="p-6 space-y-5">{children}</CardContent>
        </Card>
    );
};

export default FormTemplate;
