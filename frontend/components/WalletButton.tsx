"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "./WalletProvider";
import {
  Shield,
  Wallet,
  LogOut,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const WalletButton: React.FC = () => {
  const {
    userAddress,
    isConnected,
    isConnecting,
    psgBalance,
    chzBalance,
    error,
    connectWallet,
    disconnectWallet,
    refreshPsgBalance,
  } = useWallet();

  const [isExpanded, setIsExpanded] = useState(false);

  // Show loading state while auto-connecting or manually connecting
  if (isConnecting) {
    return (
      <motion.div
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-sm">CONNECTING...</span>
      </motion.div>
    );
  }

  // Show connected state with wallet info
  if (isConnected && userAddress) {
    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Collapsed State */}
        <motion.div
          className="flex items-center gap-2 bg-main text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer px-3 py-2"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shield className="w-4 h-4" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-black">
              {parseFloat(psgBalance).toFixed(1)}
            </span>
            <span className="text-xs font-black opacity-70">Fan</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-black">
              {parseFloat(chzBalance).toFixed(1)}
            </span>
            <span className="text-xs font-black opacity-70">OKB</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </motion.div>

        {/* Expanded State */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute top-full right-0 mt-2 flex flex-col gap-2 min-w-max"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Fan Balance (Full) */}
              <motion.div
                className="bg-main text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-black">
                    {parseFloat(psgBalance).toFixed(2)} Fan
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshPsgBalance();
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>

              {/* OKB Balance (Full) */}
              <motion.div
                className="bg-blue-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 }}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-black">
                    {parseFloat(chzBalance).toFixed(2)} OKB
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshPsgBalance();
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>

              {/* Wallet Address */}
              <motion.div
                className="bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.11 }}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-black font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              </motion.div>

              {/* Disconnect Button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  disconnectWallet();
                  setIsExpanded(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.14 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">DISCONNECT</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center gap-2 bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer px-3 py-2"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-black">ERROR</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute top-full right-0 mt-2 flex flex-col gap-2 min-w-max"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="bg-red-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-3 py-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
              >
                <span className="text-sm text-red-800 font-black">{error}</span>
              </motion.div>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  connectWallet();
                  setIsExpanded(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Wallet className="w-4 h-4" />
                <span>RETRY</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Show connect button if not connected
  return (
    <motion.button
      onClick={connectWallet}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Wallet className="w-4 h-4" />
      <span>CONNECT</span>
    </motion.button>
  );
};
