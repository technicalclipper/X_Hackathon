"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Marquee from "@/components/ui/marquee";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Circle,
  Trophy,
  Palette,
  Zap,
  Users,
  Coins,
  Heart,
  Flag,
  Shield,
} from "lucide-react";
import useCanvasCursor from "@/hooks/useCanvasCursor";

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [terminalText, setTerminalText] = useState("");
  const [currentFeature, setCurrentFeature] = useState(0);
  useCanvasCursor();
  const features = [
    { icon: Palette, text: "DESIGN FAN ART" },
    { icon: Trophy, text: "CLUB ARTIFACTS" },
    { icon: Users, text: "FAN COMMUNITY" },
    { icon: Coins, text: "EARN CHZ TOKENS" },
  ];

  const clubs = [
    "FC BARCELONA",
    "JUVENTUS FC",
    "AC MILAN",
    "PARIS SAINT-GERMAIN",
    "MANCHESTER CITY",
    "ARSENAL FC",
  ];

  // Terminal typing effect
  useEffect(() => {
    const messages = [
      "CONNECTING TO CHILLIZ NETWORK...",
      "LOADING FAN ART STUDIO...",
      "SYNCING WITH CLUB DATABASES...",
      "READY FOR FAN CREATION >",
    ];

    let messageIndex = 0;
    let charIndex = 0;

    const typeText = () => {
      if (messageIndex < messages.length) {
        if (charIndex < messages[messageIndex].length) {
          setTerminalText(messages[messageIndex].substring(0, charIndex + 1));
          charIndex++;
          setTimeout(typeText, 50);
        } else {
          setTimeout(() => {
            messageIndex++;
            charIndex = 0;
            if (messageIndex < messages.length) {
              setTerminalText("");
              typeText();
            }
          }, 1000);
        }
      }
    };

    const timer = setTimeout(typeText, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Feature cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    mouseX.set((mousePosition.x - window.innerWidth / 2) / 50);
    mouseY.set((mousePosition.y - window.innerHeight / 2) / 50);
  }, [mousePosition, mouseX, mouseY]);

  return (
    <div className="min-h-screen overflow-hidden p-4 md:p-8 relative">
      <canvas className="pointer-events-none fixed inset-0" id="canvas" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Main Hero Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          style={{
            x: useTransform(springX, (x) => x * 0.1),
            y: useTransform(springY, (y) => y * 0.1),
          }}
        >
          <Card className="shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] hover:shadow-[25px_25px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 p-0">
            <CardHeader className="bg-black border-b-0 border-border px-0 py-0 mb-0 pb-0 font-mono text-lg font-black ">
              <div className="flex items-center justify-between h-full">
                <motion.div whileTap={{ scale: 0.9 }} className="h-full">
                  <Button
                    variant="noShadow"
                    className="bg-white text-black h-full w-16 border-0 border-r-8 border-black shadow-none rounded-none hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>

                <CardTitle className="text-white text-xl tracking-wider font-mono flex items-center gap-3 px-6">
                  <Shield className="w-4 h-4 animate-pulse" />
                  FANVAS.EXE
                  <Trophy
                    className="w-4 h-4 animate-pulse"
                    style={{ animationDelay: "500ms" }}
                  />
                </CardTitle>

                <div className="w-16"></div>
              </div>
            </CardHeader>

            <CardContent className="p-8 md:p-12 space-y-8">
              {/* Unified Title */}
              <motion.div
                className="text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.div
                  className="text-5xl md:text-8xl font-black tracking-wider text-foreground"
                  style={{
                    x: useTransform(springX, (x) => x * 0.2),
                    y: useTransform(springY, (y) => y * 0.15),
                  }}
                >
                  <motion.div
                    className="bg-background px-8 py-6 border-8 border-border shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] inline-block relative overflow-hidden group"
                    whileHover={{
                      boxShadow: "16px_16px_0px_0px_rgba(0,0,0,1)",
                      scale: 1.02,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">FANVAS</span>
                    <motion.div
                      className="absolute top-2 right-2 w-4 h-4 bg-black opacity-30 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-6 text-lg md:text-xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    DEMOCRATIZING FAN ART
                  </span>
                </motion.div>
              </motion.div>

              {/* Club Showcase */}

              {/* Enter Button */}
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 1.2,
                  duration: 0.4,
                  type: "spring",
                  bounce: 0.6,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    x: useTransform(springX, (x) => x * -0.05),
                    y: useTransform(springY, (y) => y * -0.05),
                  }}
                >
                  <Button
                    size="lg"
                    onClick={() => router.push("/clubselect")}
                    className="text-xl font-black px-12 py-6 text-main-foreground bg-main hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Shield className="w-5 h-5 group-hover:animate-spin" />
                      CREATE FAN ART
                      <Heart className="w-5 h-5 group-hover:animate-pulse" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className=" w-full opacity-50">
            <Marquee items={clubs} />
          </div>
        </motion.div>
        {/* Chilliz Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.6 }}
          className="text-center"
        >
          <div className="bg-red-500 text-white font-black px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>POWERED BY CHILLIZ</span>
              <Zap className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
