import { Loader } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-lg font-semibold flex items-center justify-center"><Loader className="animate-spin" /> Loading..</p>
        </div>
    );
}
