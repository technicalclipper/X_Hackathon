"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden p-16 flex items-center justify-center">
      {/* Main Neo-Brutalist Window */}
      <motion.div
        className="bg-white border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] max-w-5xl w-full relative transform rotate-1"
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      >
        {/* Title Bar */}
        <div className="bg-black border-b-8 border-black px-8 py-6 font-mono text-lg font-black">
          <div className="flex items-center justify-between">
            <span className="bg-white text-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              ✕
            </span>
            <span className="text-white text-xl tracking-wider">
              FANVAS.EXE
            </span>
            <div className="w-12"></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-24 text-center space-y-16">
          {/* Main Title */}
          <motion.div
            className="text-7xl md:text-8xl font-black tracking-wider text-black transform -rotate-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="bg-white px-6 py-4 border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block transform rotate-3 mr-8">
              FAN
            </span>
            <span className="bg-gray-900 text-white px-6 py-4 border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block transform -rotate-2">
              VAS
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="text-2xl md:text-3xl text-black font-black bg-gray-200 px-12 py-6 border-6 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block transform rotate-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            DIGITAL ART STUDIO
          </motion.div>

          {/* Tagline */}
          <motion.div
            className="text-lg font-black text-white bg-black px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] inline-block transform -rotate-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            CREATE • PAINT • DOMINATE
          </motion.div>

          {/* Enter Button */}
          <motion.button
            className="bg-white text-black text-xl font-black px-16 py-8 border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-150 transform rotate-2 hover:rotate-0 hover:bg-gray-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 1,
              duration: 0.4,
              type: "spring",
              bounce: 0.6,
            }}
          >
            ENTER DAPP
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
