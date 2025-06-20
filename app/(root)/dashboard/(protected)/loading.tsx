import { Loader } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-light">
            <p className="text-lg font-semibold flex items-center justify- gap-3"><Loader className="animate-spin" /> Loading..</p>
        </div>
    );
}
