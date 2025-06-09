import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-gray-200 dark:border-gray-800">
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-700 dark:text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.93 19a10 10 0 1112.14 0H5.93z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">
                        Unauthorized Access
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        You don't have permission to view this page. Please log in with an authorized account.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4 w-full">
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
