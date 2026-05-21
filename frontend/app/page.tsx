"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden p-16 flex items-center justify-center">
      {/* Main Neo-Brutalist Window */}
      <motion.div
        className="max-w-5xl w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      >
        <Card className="shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          {/* Title Bar */}
          <CardHeader className="bg-black border-b-8 border-border px-8 py-6 font-mono text-lg font-black">
            <div className="flex items-center justify-between">
              <Button
                variant="noShadow"
                size="sm"
                className="bg-white text-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                ✕
              </Button>
              <CardTitle className="text-white text-xl tracking-wider font-mono">
                FANVAS.EXE
              </CardTitle>
              <div className="w-12"></div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-24 text-center space-y-16">
            {/* Main Title */}
            <motion.div
              className="text-7xl md:text-8xl font-black tracking-wider text-foreground"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="bg-background px-6 py-4 border-6 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block mr-8">
                FAN
              </span>
              <span className="bg-black text-white px-6 py-4 border-6 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block">
                VAS
              </span>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              className="text-2xl md:text-3xl text-foreground font-black bg-secondary-background px-12 py-6 border-6 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              DIGITAL ART STUDIO
            </motion.div>

            {/* Tagline */}
            <motion.div
              className="text-lg font-black text-white bg-black px-8 py-4 border-4 border-border shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] inline-block"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              CREATE • PAINT • DOMINATE
            </motion.div>

            {/* Enter Button */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 1,
                duration: 0.4,
                type: "spring",
                bounce: 0.6,
              }}
            >
              <Button
                size="lg"
                className="text-xl font-black px-16 py-8 border-6 text-main-foreground bg-main"
              >
                ENTER DAPP
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
