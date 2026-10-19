"use client"


export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white">
            <p className="mt-4 text-emerald-300 text-sm tracking-wide animate-pulse">
                Loading auth dashboard...
            </p>
        </div>
    )
}
