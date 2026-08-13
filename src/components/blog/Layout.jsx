import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

export default function BlogLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {/* pb-16 for mobile+tablet bottom nav; lg:pb-0 for desktop/ChromeOS where navbar handles nav */}
      <main className="flex-1 pt-14 pb-14 lg:pt-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}