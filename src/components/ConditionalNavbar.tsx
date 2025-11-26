"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");
  const isUserPage = pathname?.startsWith("/user");

  if (isAuthPage || isAdminPage || isUserPage) {
    return null;
  }

  return <Navbar />;
}
