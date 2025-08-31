"use client";

import { motion } from "framer-motion";
import { Tag, Percent } from "lucide-react";

export function DiscountAnimation() {
  return (
    <div className="relative mx-auto h-24 w-24">
      {/* Círculo de fondo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/30"
      />

      {/* Etiqueta principal */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Tag className="h-10 w-10 text-blue-600" />
      </motion.div>

      {/* Símbolo de porcentaje flotante */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute -right-2 -top-2 rounded-full bg-blue-600 p-1"
      >
        <Percent className="h-4 w-4 text-white" />
      </motion.div>

      {/* Partículas flotantes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, Math.cos((i * 60 * Math.PI) / 180) * 40],
            y: [0, Math.sin((i * 60 * Math.PI) / 180) * 40],
          }}
          transition={{
            delay: 0.6 + i * 0.1,
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
          }}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-blue-400"
        />
      ))}
    </div>
  );
}
