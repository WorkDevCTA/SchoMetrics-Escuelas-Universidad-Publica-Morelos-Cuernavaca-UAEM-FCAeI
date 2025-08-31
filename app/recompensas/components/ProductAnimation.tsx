"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Gift, Star } from "lucide-react";

export function ProductAnimation() {
  return (
    <div className="relative mx-auto h-24 w-24">
      {/* Círculo de fondo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30"
      />

      {/* Bolsa de compras principal */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <ShoppingBag className="h-10 w-10 text-green-600" />
      </motion.div>

      {/* Regalo flotante */}
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute -right-2 -top-2 rounded-full bg-green-600 p-1"
      >
        <Gift className="h-4 w-4 text-white" />
      </motion.div>

      {/* Estrellas brillantes */}
      {[...Array(5)].map((_, i) => (
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
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
          }}
          className="absolute"
          style={{
            top: `${20 + Math.sin((i * 72 * Math.PI) / 180) * 30}px`,
            left: `${20 + Math.cos((i * 72 * Math.PI) / 180) * 30}px`,
          }}
        >
          <Star className="h-3 w-3 fill-current text-green-400" />
        </motion.div>
      ))}

      {/* Pulso de fondo */}
      <motion.div
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="absolute inset-0 rounded-full bg-green-200 dark:bg-green-800/20"
      />
    </div>
  );
}
