"use client";

import { motion } from "framer-motion";
import React from "react";

export default function RetroGridBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Main Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Chunky Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, black 2px, transparent 2px),
            linear-gradient(to bottom, black 2px, transparent 2px)
          `,
          backgroundSize: "120px 120px",
        }}
      />

      {/* Retro Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* CRT Scanlines Effect */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `repeating-linear-gradient(  
            0deg,
            transparent,
            transparent 2px,
            black 2px,
            black 3px
          )`,
        }}
        animate={{
          y: [0, -6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Subtle Wave Animation on Grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "60px 60px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Geometric Pulse Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-black opacity-[0.05]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/4 w-2 h-2 bg-black opacity-[0.05]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 4,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 left-3/4 w-2 h-2 bg-black opacity-[0.05]"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 4,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Retro Stripes */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              black 10px,
              black 11px
            )`,
          }}
        />
      </div>

      {/* Subtle Data Stream */}
      <motion.div
        className="absolute top-0 left-10 w-px h-full bg-black opacity-[0.04]"
        animate={{
          opacity: [0.04, 0.08, 0.04],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-0 right-20 w-px h-full bg-black opacity-[0.04]"
        animate={{
          opacity: [0.04, 0.08, 0.04],
        }}
        transition={{
          duration: 3,
          delay: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Retro Loading Bar Effect */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-black opacity-[0.06]"
        animate={{
          width: ["0%", "100%", "0%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Central Focus Grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02]">
        <div className="w-80 h-80 grid grid-cols-4 grid-rows-4 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-full h-full border border-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 4,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 8,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
