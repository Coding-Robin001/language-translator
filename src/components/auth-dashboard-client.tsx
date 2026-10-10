"use client";

import { signOut } from "../actions/auth-actions";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Session = typeof auth.$Infer.Session;

const AuthDashboardClient = ({ session }: { session: Session | null }) => {
  const router = useRouter();
  const user = session?.user;

  const [copied, setCopied] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(user, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-6 bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-6 rounded-2xl shadow">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome to Your Authentication Dashboard 🎉

            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Authenticated with{" "}
              <span className="font-semibold text-indigo-600">Better Auth</span>
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Avatar or initials */}
            {user?.image ? (
              <Image
                src={user.image}
                alt="User Avatar"
                width={48}
                height={48}
                className="rounded-full border"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}

            <div className="text-right">
              <p className="font-medium">{user?.name ?? "User"}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            <button
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-gray-500 text-sm mb-1">Auth Provider</h3>
            <p className="text-lg font-semibold text-gray-800">Better Auth</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-gray-500 text-sm mb-1">Email Verified</h3>

            <div className="flex items-center justify-between">
              <p
                className={`text-lg font-semibold ${user?.emailVerified ? "text-green-600" : "text-red-500"
                  }`}
              >
                {user?.emailVerified ? "Yes" : "No"}
              </p>

              {!user?.emailVerified && (
                <Link
                  href="/verify-email"
                  className="px-3 py-1 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-colors"
                >
                  Verify email →
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="text-gray-500 text-sm mb-1">User Email</h3>
            <p className="text-xs font-mono text-gray-700 break-all">
              {user?.email}
            </p>
          </div>
        </div>

        {/* User JSON Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">User Data</h2>
            <button
              onClick={handleCopy}
              className="text-sm cursor-pointer px-3 py-1 border rounded-lg hover:bg-gray-100 transition"
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto text-gray-700">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Developer Message + GitHub Link */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h2 className="font-semibold text-indigo-700 mb-1">
            Getting Started 🚀
          </h2>

          <p className="text-sm text-indigo-800">
            This dashboard is powered by{" "}
            <span className="font-semibold">Next.js 15</span> +{" "}
            <span className="font-semibold">Better Auth</span>. Clone it, set
            your environment variables in <code>.env</code>, plug in your
            database (Postgres/MySQL), and start building!
          </p>

          {/* GitHub button */}
          <div className="flex justify-end mt-4">
            <a
              href="https://github.com/Coding-Robin001/Next.js-15-Better-Auth-Starter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path
                  fillRule="evenodd"
                  d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.93c-3.2.7-3.88-1.39-3.88-1.39-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.53-2.55-.29-5.23-1.27-5.23-5.63 0-1.25.44-2.28 1.17-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.84 10.84 0 0 1 5.73 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.8 1.17 1.83 1.17 3.08 0 4.38-2.69 5.33-5.25 5.62.41.35.78 1.04.78 2.1v3.11c0 .31.21.65.79.54A10.99 10.99 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"
                  clipRule="evenodd"
                />
              </svg>
              View repo on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between mt-8">
        <button
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition cursor-pointer"
          onClick={() => router.push("/")}
        >
          ← Back to Home
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
          Manage Account
        </button>
      </div>
    </div>
  );
};

export default AuthDashboardClient;
