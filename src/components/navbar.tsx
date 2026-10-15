import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import NavbarLinks from "@/components/navbarLinks";

// Server component: finds out whether the user is signed in, so pages just render <Navbar />
export default async function Navbar() {
  let signedIn = false;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    signedIn = !!session;
  } catch {
    // treat any auth lookup failure as signed out
  }

  return <NavbarLinks signedIn={signedIn} />;
}