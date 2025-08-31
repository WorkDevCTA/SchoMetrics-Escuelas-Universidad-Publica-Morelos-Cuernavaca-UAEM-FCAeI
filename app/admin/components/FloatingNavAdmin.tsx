"use client";
import React from "react";
import { UserCog2 } from "lucide-react";
import { FloatingNav } from "./FloatingNav";
export function FloatingNavAdmin() {
  const navItems = [
    {
      name: "Volver a Incio",
      link: "/admin",
      icon: <UserCog2 className="h-4 w-4 text-white" />,
    },
  ];
  return (
    <div className="relative z-[5000] w-min">
      <FloatingNav navItems={navItems} />
    </div>
  );
}
