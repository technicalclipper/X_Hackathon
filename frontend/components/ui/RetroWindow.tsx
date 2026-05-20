"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Square } from "lucide-react";
import { cn, macWindow } from "@/lib/utils";
import { useState } from "react";

interface RetroWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  closable?: boolean;
  minimizable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  defaultOpen?: boolean;
}

export default function RetroWindow({
  title = "Untitled",
  children,
  className,
  closable = true,
  minimizable = true,
  resizable = false,
  onClose,
  onMinimize,
  defaultOpen = true,
}: RetroWindowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            height: isMinimized ? "auto" : undefined,
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={cn(
            "bg-gray-200 border-2 border-black relative",
            macWindow.shadow,
            resizable && "resize overflow-auto",
            className
          )}
          style={{
            filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.5))",
          }}
        >
          {/* Title bar */}
          <div
            className={cn(
              macWindow.titleBar,
              "flex items-center justify-between px-2 cursor-move select-none"
            )}
          >
            <div className="flex items-center space-x-1">
              {/* Window controls */}
              {closable && (
                <button
                  onClick={handleClose}
                  className="w-3 h-3 bg-white border border-black hover:bg-red-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
              {minimizable && (
                <button
                  onClick={handleMinimize}
                  className="w-3 h-3 bg-white border border-black hover:bg-yellow-200 transition-colors"
                  aria-label="Minimize"
                >
                  <Minus className="w-2 h-2" />
                </button>
              )}
              <div className="w-3 h-3 bg-white border border-black">
                <Square className="w-2 h-2" />
              </div>
            </div>
            {/* Title */}
            <div className="text-xs font-bold text-black tracking-wide">
              {title}
            </div>
            <div className="w-12" /> {/* Spacer for balance */}
          </div>

          {/* Content area */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={cn(macWindow.content, "p-4")}>{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
