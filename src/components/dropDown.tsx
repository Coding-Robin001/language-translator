"use client";
import React from "react";

type Option = {
  label: string;
  value: string;
};

type DropDownProps = {
  name: string;
  label: string; // accessible name, visually hidden
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

const DropDown = ({ name, label, value, onChange, options }: DropDownProps) => {
  return (
    <div className="relative">
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-lg border border-[#B85C1E] bg-[#4A2208] py-2 pl-3 pr-9 text-sm font-semibold text-[#FFB86B] transition-colors hover:bg-[#5A2B0C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB86B]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* custom chevron, since appearance-none removes the native one */}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FFB86B]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 8l5 5 5-5" />
      </svg>
    </div>
  );
};

export default DropDown;