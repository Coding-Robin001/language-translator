import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-center gap-10 py-5 text-lg font-bold text-[#5C2A0A]">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link
        href="/"
        aria-current="page"
        className="underline underline-offset-4"
      >
        Translate
      </Link>
    </nav>
  );
};

export default Navbar;
