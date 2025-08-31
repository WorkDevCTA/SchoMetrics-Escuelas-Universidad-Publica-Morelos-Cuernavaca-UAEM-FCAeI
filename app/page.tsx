"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import LoginButton from "./components/LogInButton";
import { DynamicCounters } from "./components/home/DynamicCounters";
import GlobalMetricsSchool from "./components/home/GlobalMetricsSchool";
import { TimelineSchoMetrics } from "./components/home/TimeLineSchoMetrics";
export default function Home() {

  return (
    <div className="home flex min-h-screen flex-col">
      <header className="top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mb-5 flex flex-col items-center justify-between py-3 md:flex-row">
          <div className="mb-4 mt-4 flex flex-col justify-center items-center gap-2 pb-2 md:flex-row">
            <Image
              src="/logo.png"
              alt="logo"
              width={130}
              height={130}
              priority
            />
            <div className="flex justify-center items-center">
              <Image
                src="/uaem-logo.svg"
                alt="uaem-logo"
                width={120}
                height={120}
                priority
                className="ml-5"
              />
              <Image
                src="/fcaei-logo.svg"
                alt="fcaei-logo"
                width={120}
                height={120}
                priority
                className="ml-5"
              />
            </div>
          </div>
          <LoginButton href="/login" />
        </div>
      </header>
      <main className="flex-1">
        <motion.span
          initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.1,
            ease: "easeInOut",
          }}
          className=""
        >
          <section className="w-full bg-white py-12 lg:py-16">
            <div className="px-4 md:px-6">
              <div className="flex flex-col items-center justify-center gap-3 lg:mx-10 lg:flex-row lg:gap-5">
                <div className="space-y-4 lg:mx-10">
                  <h1 className="mx-auto max-w-full text-start text-2xl font-bold text-slate-600 md:text-4xl lg:text-6xl">
                    {/* SchoMetrics Normal */}
                    <span className="text-schoMetricsBaseColor">
                      SchoMetrics
                    </span>
                    {/* Festividad Septiembre */}
                    {/* <span className="flex m-0 p-0">
                      <p className="text-[#006341] border-b-8 border-b-[#006341]">Scho</p>
                      <p className="text-[#d8d8d8] border-b-8 border-b-[#ebebeb]">Me</p>
                      <p className="text-[#c90005] border-b-8 border-b-[#c90005]">Trics</p>
                    </span> */}
                    <br />
                    Transformación educativa hacia la sostenibilidad ambiental
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Plataforma de sostenibilidad y participación ambiental para
                    escuelas, alumnos y docentes en México.
                  </p>
                </div>
                <div className="mt-16 w-[320px] sm:w-[500px] md:w-[600px] lg:mt-0 lg:w-[900px] xl:w-[1200px]">
                  <Image
                    src="/heart.svg"
                    alt="hero"
                    width={600}
                    height={600}
                    priority
                    className="animate-heartbeat"
                  />
                </div>
              </div>
              <div className="container mt-16 flex flex-col items-center justify-center gap-3 lg:mx-10 lg:flex-row lg:gap-5">
                <div className="mt-16 w-[320px] sm:w-[500px] md:w-[600px] lg:mt-0 lg:w-[900px] xl:w-[1200px]">
                  <Image
                    src="/fcaei-logo.svg"
                    alt="hero"
                    width={600}
                    height={600}
                    priority
                    className="animate-heartbeat"
                  />
                </div>
                <div className="space-y-4 lg:mx-10">
                  <div className="mx-auto max-w-full">
                    <h2 className="text-baseColor text-2xl lg:text-5xl font-bold">
                      Facultad de Contaduría, Administración e Informática
                    </h2>
                    <p className="text-baseSecondColor text-xl lg:text-4xl font-semibold">
                      Por una Facultad innovadora creando un futuro sostenible
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Contadores de Estádisticas Generales */}
          <section className="container w-full py-12 md:py-16 lg:py-20">
            <div className="px-4 md:px-6">
              <div className="mb-10 text-center md:mb-12">
                <h2 className="mx-auto max-w-full text-center text-2xl font-bold text-slate-600 md:text-4xl lg:text-6xl">
                  Nuestra Comunidad en Números
                </h2>
                <p className="text-md mx-auto mt-3 max-w-3xl text-gray-500">
                  Descubre el impacto colectivo de{" "}
                  <span className="font-semibold text-schoMetricsBaseColor">
                    SchoMetrics
                  </span>{" "}
                  junto a la{" "}
                  <span className="font-semibold text-baseColor">
                    Facultad de Contaduría, Administración e Informática
                  </span>{" "}
                  y descubre cómo estamos creciendo juntos.
                </p>
              </div>
              <DynamicCounters />
              {/* Global Metrics */}
              <GlobalMetricsSchool />
            </div>
          </section>
          {/* TimeLine Demo */}
          <TimelineSchoMetrics />
        </motion.span>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link
              href="https://schometrics.website/terminos"
              className="text-sm text-muted-foreground hover:underline"
            >
              Términos
            </Link>
            <Link
              href="https://schometrics.website/privacidad"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
