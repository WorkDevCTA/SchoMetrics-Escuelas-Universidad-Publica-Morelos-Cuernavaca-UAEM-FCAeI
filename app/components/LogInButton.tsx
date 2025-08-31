"use client";

import { ArrowLeftCircleIcon, Leaf } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
interface LoginButtonProps {
  href: string;
}

const LoginButton = ({ href }: LoginButtonProps) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHoveredButton("premium")}
      onMouseLeave={() => setHoveredButton(null)}
      title="Iniciar Sesión en SchoMetrics"
    >
      <button className="group relative w-full overflow-hidden rounded-2xl border-t-4 border-t-schoMetricsBaseColor bg-white px-8 py-4 font-semibold shadow-sm shadow-schoMetricsBaseColor/10 transition-all duration-500 hover:rotate-1 hover:scale-105 hover:shadow-2xl hover:shadow-schoMetricsBaseColor/50">
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div
            className="absolute left-4 top-2 h-1 w-1 animate-bounce rounded-full bg-yellow-300"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute right-8 top-6 h-1 w-1 animate-bounce rounded-full bg-yellow-300"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute bottom-4 left-8 h-1 w-1 animate-bounce rounded-full bg-yellow-300"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="absolute bottom-2 right-4 h-1 w-1 animate-bounce rounded-full bg-yellow-300"
            style={{ animationDelay: "0.6s" }}
          ></div>
        </div>
        <div className="relative flex items-center justify-center gap-3">
          <Leaf className="h-5 w-5 text-schoMetricsBaseColor transition-transform duration-500 group-hover:animate-spin" />
          <span className="text-schoMetricsBaseColor">Iniciar Sesión</span>
          <ArrowLeftCircleIcon className="h-5 w-5 text-schoMetricsBaseColor transition-transform duration-500 group-hover:rotate-180" />
        </div>
      </button>
    </Link>
  );
};

export default LoginButton;
