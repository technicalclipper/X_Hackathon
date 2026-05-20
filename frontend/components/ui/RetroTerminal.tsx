"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalLine {
  id: string;
  text: string;
  type: "command" | "output" | "error";
  timestamp?: Date;
}

interface RetroTerminalProps {
  className?: string;
  prompt?: string;
  onCommand?: (command: string) => void;
  lines?: TerminalLine[];
  autoFocus?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
}

export default function RetroTerminal({
  className,
  prompt = "user@macintosh:~$",
  onCommand,
  lines = [],
  autoFocus = true,
  showCursor = true,
  cursorChar = "_",
}: RetroTerminalProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>(lines);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const newLine: TerminalLine = {
      id: Date.now().toString(),
      text: `${prompt} ${currentInput}`,
      type: "command",
      timestamp: new Date(),
    };

    setTerminalLines((prev) => [...prev, newLine]);
    onCommand?.(currentInput);
    setCurrentInput("");
  };

  const addLine = (text: string, type: "output" | "error" = "output") => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
    };
    setTerminalLines((prev) => [...prev, newLine]);
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "output":
        return "text-white";
      default:
        return "text-white";
    }
  };

  return (
    <div
      className={cn(
        "bg-black border-2 border-gray-400 font-mono text-sm",
        "shadow-[inset_0_0_0_2px_rgba(0,255,65,0.1)]",
        "relative overflow-hidden",
        className
      )}
    >
      {/* CRT screen effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,255,65,0.1) 1px, rgba(0,255,65,0.1) 2px)",
        }}
      />

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="h-full p-4 overflow-y-auto scrollbar-thin scrollbar-track-black scrollbar-thumb-green-800"
      >
        {/* Terminal header */}
        <div className="text-green-400 mb-4">
          <div>Macintosh Terminal v1.0</div>
          <div className="text-xs text-gray-500">
            Type 'help' for available commands
          </div>
          <div className="border-b border-green-800 my-2" />
        </div>

        {/* Terminal lines */}
        <AnimatePresence>
          {terminalLines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(getLineColor(line.type), "mb-1")}
            >
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current input line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400 mr-2">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none caret-green-400"
            autoComplete="off"
            spellCheck={false}
          />
          {showCursor && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-green-400 ml-1"
            >
              {cursorChar}
            </motion.span>
          )}
        </form>
      </div>
    </div>
  );
}
