import SuccessClient from "@/components/SuccessClient";
import { Suspense } from "react";

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading payment details...</div>}>
            <SuccessClient />
        </Suspense>
    );
}