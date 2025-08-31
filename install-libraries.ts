import { exec } from "child_process";
import { promisify } from "util";

// Convertimos `exec` a una versión que devuelve una promesa para manejarlo de forma más sencilla
const execPromise = promisify(exec);

const libraries = [
  // Libraries for Tailwind CSS
  "-D tailwindcss@3.4.0 postcss autoprefixer",
  "clsx",
  "tailwind-merge",
  // Libraries for Prisma ORM
  "prisma --save-dev",
  "@prisma/client@latest",
  "@libsql/client @prisma/adapter-libsql",
  // Bcryptjs
  "bcryptjs",
  // "jose" = (JSON Object Signing and Encryption)
  "jose",
  // Supabase
  "@supabase/supabase-js",
  // Libraries for UI
  "lucide-react",
  "react-hot-toast",
  "radix-ui",
  "@radix-ui/themes",
  "clsx",
  "motion clsx tailwind-merge",
  "framer-motion",
  // Time and Zone
  "date-fns",
  "papaparse",
  "xlsx",
  "react-hook-form",
  "axios", // Axios Librarie
  "qrcode", // QR Codes
  "recharts", // Charts
  "jspdf-autotable",
  "jspdf",
  // Backend Libraries
  "zod@3.25.67",
  "resend", // RESEND Libraries
  "uuid",
  "qrcode",
  "--save-dev @types/qrcode",
  "@hookform/resolvers",
  "papaparse",
  "--save-dev @types/papaparse",
  "react-countup",
  "date-fns-tz",
  "qss",
  "embla-carousel-react",
  "react-day-picker",
  "class-variance-authority",
  // Types Librarie
  // "--save-dev @types/papaparse"
  // "@hookform/resolvers", Maybe generated an error, it's better install alone
  // "--save-dev @types/qrcode" // QR Code
];
// == npx Libraries == //
// "npx prisma init --datasource-provider postgresql",
// "npx tailwindcss init -p",
// "npx shadcn@latest init", # schadcn UI
// Instala cada librería usando npm

async function installLibraries() {
  for (const library of libraries) {
    try {
      console.log(`Instalando ${library}...`);
      await execPromise(`npm install ${library}`);
      console.log(`${library} instalada correctamente.`);
    } catch (error) {
      console.error(`Error al instalar ${library}:`, error);
    }
  }
}

installLibraries().then(() => {
  console.log("Todas las librerías han sido instaladas.");
});
