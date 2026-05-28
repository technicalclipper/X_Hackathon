import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const macWindow = {
  shadow: "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  titleBar: "bg-gray-300 border-b-2 border-black py-1",
  content: "bg-white",
};
