// // components/navbar-wrapper.tsx
// import { auth } from "@/lib/auth";
// import Navbar from "./navbar";
// import { headers } from "next/headers";

// export default async function NavbarWrapper() {
//   let session = null;

//   try {
//     session = await auth.api.getSession({
//       headers: await headers(),
//     });
//   } catch {}

//   return <Navbar session={session} />;
// }
