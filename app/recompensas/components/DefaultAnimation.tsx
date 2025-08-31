"use client";

import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";

export function DefaultAnimation() {
  return (
    <div className="relative mx-auto h-24 w-24">
      {/* Círculo de fondo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30"
      />

      {/* Regalo principal */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Gift className="h-10 w-10 text-green-600" />
      </motion.div>

      {/* Sparkles alrededor */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            delay: 0.5 + i * 0.1,
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
          }}
          className="absolute"
          style={{
            top: `${12 + Math.sin((i * 45 * Math.PI) / 180) * 30}px`,
            left: `${12 + Math.cos((i * 45 * Math.PI) / 180) * 30}px`,
          }}
        >
          <Sparkles className="h-3 w-3 text-green-400" />
        </motion.div>
      ))}

      {/* Pulso suave */}
      <motion.div
        initial={{ scale: 1, opacity: 0.3 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="absolute inset-0 rounded-full bg-green-300"
      />
    </div>
  );
}
