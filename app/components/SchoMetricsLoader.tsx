"use client";

import { useEffect, useState } from "react";
import { Leaf, BookOpen, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";

const SchoMetricsLoader = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Iniciando SchoMetrics...");
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      left: number;
      top: number;
      delay: number;
      duration: number;
    }>
  >([]);

  const loadingMessages = [
    "Iniciando SchoMetrics...",
    "Cargando tu perfil ecológico...",
    "Preparando tus métricas...",
    "Sincronizando datos ambientales...",
    "¡Casi listo para aprender!",
  ];

  // Inicializar en el cliente para evitar problemas de hidratación
  useEffect(() => {
    setIsClient(true);

    // Generar partículas solo en el cliente
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    const textInterval = setInterval(() => {
      setLoadingText((prev) => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [isClient, loadingMessages]);

  // Renderizar un loader simple hasta que el cliente esté listo
  if (!isClient) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-blue-700">SchoMetrics</h1>
          <p className="text-blue-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-200/20"></div>
        <div
          className="absolute right-1/4 top-3/4 h-48 w-48 animate-pulse rounded-full bg-sky-200/20"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 h-32 w-32 animate-pulse rounded-full bg-blue-200/20"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="animate-float absolute"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          >
            <Leaf className="h-4 w-4 text-blue-400/60" />
          </div>
        ))}
      </div>

      {/* Main loader content */}
      <div className="relative z-10 mx-auto max-w-md px-6 text-center">
        {/* Logo/Icon section */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Rotating outer ring */}
            <div className="h-[200px] w-[200px] animate-spin rounded-full border-4 border-blue-200">
              <div className="absolute left-0 top-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-sky-500"></div>
            </div>

            {/* Inner content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[170px] w-[170px] items-center justify-center rounded-full bg-blue-50 p-6 shadow-lg shadow-schoMetricsBaseColor/20">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="schometrics-logo"
                    width={200}
                    height={200}
                    priority
                    className="animate-heartbeat px-2"
                  />
                </div>
                <div className="absolute -right-1 -top-1">
                  <Leaf className="h-4 w-4 animate-bounce text-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="mb-6">
          <h1 className="mb-2 bg-gradient-to-r from-schoMetricsBaseColor via-sky-600 to-schoMetricsBaseColor bg-clip-text text-4xl font-bold text-transparent">
            SchoMetrics
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">
              Plataforma Educativa
            </span>
            <Zap className="h-4 w-4 text-sky-500" />
          </div>
        </div>

        {/* Loading progress */}
        <div className="mb-6">
          <div className="mb-3 rounded-full bg-white/80 p-1 shadow-inner backdrop-blur-sm">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="relative h-3 rounded-full bg-gradient-to-r from-blue-400 via-sky-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 animate-pulse bg-white/30"></div>
                <div className="absolute right-0 top-0 h-3 w-2 animate-ping bg-white/50"></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-1 text-lg font-medium text-blue-700">
              {loadingText}
            </p>
            <p className="text-sm text-blue-600">
              {Math.round(Math.min(progress, 100))}% completado
            </p>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 w-3 animate-bounce rounded-full bg-blue-500"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>

        {/* Inspirational message */}
        <div className="mt-8 rounded-md bg-gradient-to-tl from-blue-700 via-schoMetricsBaseColor/80 to-schoMetricsBaseColor p-4 shadow-md shadow-blue-400 backdrop-blur-sm">
          <p className="text-sm italic text-white">
            "Pequeños gestos, grandes cambios. Sé parte de la solución, no de la
            contaminación 🌱"
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SchoMetricsLoader;
