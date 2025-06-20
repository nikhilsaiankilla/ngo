import SuccessCard from "@/components/cards/SuccessCard";
import { Loader } from "lucide-react";
import { Suspense } from "react";

export default function SuccessPage() {
    return (
        <Suspense fallback={<Loader size={25} className="animate-spin"/>}>
            <SuccessCard />
        </Suspense>
    );
}