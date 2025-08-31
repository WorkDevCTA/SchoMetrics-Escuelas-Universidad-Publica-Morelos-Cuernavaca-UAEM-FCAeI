"use client";

import { motion } from "framer-motion";
import { Ticket, Sparkles, Heart } from "lucide-react";

export function ExperienceAnimation() {
  return (
    <div className="relative mx-auto h-24 w-24">
      {/* Círculo de fondo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-pink-100 dark:bg-pink-900/30"
      />

      {/* Ticket principal */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Ticket className="h-10 w-10 text-pink-600" />
      </motion.div>

      {/* Corazón flotante */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0, 1.2, 0],
          y: [0, -20, -40],
        }}
        transition={{
          delay: 0.4,
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1,
        }}
        className="absolute -left-2 -top-2"
      >
        <Heart className="h-5 w-5 fill-current text-red-500" />
      </motion.div>

      {/* Sparkles mágicos */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            delay: 0.6 + i * 0.2,
            duration: 1.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
          }}
          className="absolute"
          style={{
            top: `${12 + Math.sin((i * 60 * Math.PI) / 180) * 35}px`,
            left: `${12 + Math.cos((i * 60 * Math.PI) / 180) * 35}px`,
          }}
        >
          <Sparkles className="h-3 w-3 text-pink-400" />
        </motion.div>
      ))}

      {/* Ondas de emoción */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: [0.5, 1.5, 2], opacity: [0.6, 0.3, 0] }}
          transition={{
            delay: 0.8 + i * 0.4,
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
          }}
          className="absolute inset-0 rounded-full border-2 border-pink-300"
        />
      ))}
    </div>
  );
}
