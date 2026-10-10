 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global error captured:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-6">
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_30px_rgba(34,197,94,0.25)]">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {/* <AlertTriangle className="text-red-500 w-12 h-12" /> */}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">
            An unexpected error occurred. Try refreshing the page or go back
            home.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              {/* <RefreshCcw size={18} /> Try Again */}
            </button>

            <button
              onClick={() => router.push("/")}
              className="border border-gray-700 hover:bg-gray-800 text-gray-300 px-4 py-2 rounded-lg transition"
            >
              Go Home
            </button>
          </div>

          {/* Optional digest info */}
          {error.digest && (
            <p className="text-xs text-gray-600 mt-6">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
