import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <h1 className="text-7xl font-extrabold text-emerald-600 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
                <p className="text-gray-600 mb-6">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
}
