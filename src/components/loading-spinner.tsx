"use client"

export default function LoadingSpinner() {
  return (
    <div className="relative w-12 h-12">
      {/* Outer ring */}
      <div className="absolute inset-0 border-4 border-t-transparent border-orange-400 rounded-full animate-spin"></div>

      {/* Inner glow */}
      <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 to-orange-500 rounded-full animate-pulse blur-[1px]"></div>
    </div>
  )
}
