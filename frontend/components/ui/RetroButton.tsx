"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface RetroButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | "onDrag"
    | "onDragEnd"
    | "onDragStart"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  variant?: "default" | "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  pixelated?: boolean;
  children: React.ReactNode;
}

const RetroButton = forwardRef<HTMLButtonElement, RetroButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      pixelated = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "relative inline-flex items-center justify-center font-bold text-black",
      "border-2 border-black transition-all duration-75",
      "active:translate-x-1 active:translate-y-1",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0",
      pixelated && "font-mono tracking-wider"
    );

    const variants = {
      default:
        "bg-gray-200 hover:bg-gray-300 shadow-[4px_4px_0px_rgba(0,0,0,1)]",
      primary:
        "bg-blue-400 hover:bg-blue-500 shadow-[4px_4px_0px_rgba(0,0,0,1)]",
      secondary:
        "bg-yellow-400 hover:bg-yellow-500 shadow-[4px_4px_0px_rgba(0,0,0,1)]",
      danger: "bg-red-400 hover:bg-red-500 shadow-[4px_4px_0px_rgba(0,0,0,1)]",
    };

    const sizes = {
      sm: "px-3 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10">{children}</span>

        {/* Retro highlight effect */}
        <div className="absolute inset-0 bg-white opacity-20 border border-white" />
      </motion.button>
    );
  }
);

RetroButton.displayName = "RetroButton";

export default RetroButton;
