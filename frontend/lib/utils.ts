import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Retro macintosh color palette
export const retroColors = {
  // Classic Mac beige/cream colors
  macBeige: "#F2F2F2",
  macCream: "#FFEFD5",
  macGray: "#C0C0C0",

  // Classic Mac screen colors
  macGreen: "#00FF41",
  macAmber: "#FFB000",
  macBlue: "#0080FF",

  // Dark mode variants
  macDarkGray: "#2C2C2C",
  macCharcoal: "#1A1A1A",

  // Accent colors
  macRed: "#FF0040",
  macPurple: "#8000FF",
} as const;

// Retro screen effects
export const screenEffects = {
  scanlines:
    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
  crtCurvature:
    "0 0 0 1px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)",
  pixelBorder: "2px solid #000",
  retroShadow: "4px 4px 0px rgba(0,0,0,0.5)",
} as const;

// Classic Mac window chrome
export const macWindow = {
  titleBar:
    "h-6 bg-gradient-to-b from-gray-200 to-gray-300 border-b border-gray-400",
  closeButton: "w-3 h-3 bg-white border border-black rounded-sm",
  content: "bg-white border-2 border-black",
  shadow: "drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]",
} as const;

// Retro typography helpers
export const retroTypography = {
  pixelFont: "font-mono text-sm tracking-wider",
  systemFont: "font-sans text-base",
  terminalFont: "font-mono text-green-400 bg-black p-2",
} as const;
