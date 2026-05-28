"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Coins, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWallet } from "@/components/WalletProvider";

interface Team {
  id: string;
  name: string;
  shortName: string;
  logoPath: string;
  isAvailable: boolean;
}

const ALL_TEAMS = [
  { id: "algeria",            name: "ALGERIA",            shortName: "ALG" },
  { id: "argentina",          name: "ARGENTINA",          shortName: "ARG" },
  { id: "australia",          name: "AUSTRALIA",          shortName: "AUS" },
  { id: "austria",            name: "AUSTRIA",            shortName: "AUT" },
  { id: "belgium",            name: "BELGIUM",            shortName: "BEL" },
  { id: "bosnia-herzegovina", name: "BOSNIA HERZEGOVINA", shortName: "BIH" },
  { id: "brazil",             name: "BRAZIL",             shortName: "BRA" },
  { id: "canada",             name: "CANADA",             shortName: "CAN" },
  { id: "cape-verde",         name: "CAPE VERDE",         shortName: "CPV" },
  { id: "colombia",           name: "COLOMBIA",           shortName: "COL" },
  { id: "croatia",            name: "CROATIA",            shortName: "CRO" },
  { id: "curacao",            name: "CURAÇAO",            shortName: "CUW" },
  { id: "czechia",            name: "CZECHIA",            shortName: "CZE" },
  { id: "dr-congo",           name: "DR CONGO",           shortName: "COD" },
  { id: "ecuador",            name: "ECUADOR",            shortName: "ECU" },
  { id: "egypt",              name: "EGYPT",              shortName: "EGY" },
  { id: "england",            name: "ENGLAND",            shortName: "ENG" },
  { id: "france",             name: "FRANCE",             shortName: "FRA" },
  { id: "germany",            name: "GERMANY",            shortName: "GER" },
  { id: "ghana",              name: "GHANA",              shortName: "GHA" },
  { id: "haiti",              name: "HAITI",              shortName: "HAI" },
  { id: "iran",               name: "IRAN",               shortName: "IRN" },
  { id: "iraq",               name: "IRAQ",               shortName: "IRQ" },
  { id: "ivory-coast",        name: "IVORY COAST",        shortName: "CIV" },
  { id: "japan",              name: "JAPAN",              shortName: "JPN" },
  { id: "jordan",             name: "JORDAN",             shortName: "JOR" },
  { id: "mexico",             name: "MEXICO",             shortName: "MEX" },
  { id: "morocco",            name: "MOROCCO",            shortName: "MAR" },
  { id: "netherlands",        name: "NETHERLANDS",        shortName: "NED" },
  { id: "new-zealand",        name: "NEW ZEALAND",        shortName: "NZL" },
  { id: "norway",             name: "NORWAY",             shortName: "NOR" },
  { id: "panama",             name: "PANAMA",             shortName: "PAN" },
  { id: "paraguay",           name: "PARAGUAY",           shortName: "PAR" },
  { id: "portugal",           name: "PORTUGAL",           shortName: "POR" },
  { id: "qatar",              name: "QATAR",              shortName: "QAT" },
  { id: "saudi-arabia",       name: "SAUDI ARABIA",       shortName: "KSA" },
  { id: "scotland",           name: "SCOTLAND",           shortName: "SCO" },
  { id: "senegal",            name: "SENEGAL",            shortName: "SEN" },
  { id: "south-africa",       name: "SOUTH AFRICA",       shortName: "RSA" },
  { id: "south-korea",        name: "SOUTH KOREA",        shortName: "KOR" },
  { id: "spain",              name: "SPAIN",              shortName: "ESP" },
  { id: "sweden",             name: "SWEDEN",             shortName: "SWE" },
  { id: "switzerland",        name: "SWITZERLAND",        shortName: "SUI" },
  { id: "tunisia",            name: "TUNISIA",            shortName: "TUN" },
  { id: "turkiye",            name: "TÜRKİYE",            shortName: "TUR" },
  { id: "united-states",      name: "UNITED STATES",      shortName: "USA" },
  { id: "uruguay",            name: "URUGUAY",            shortName: "URU" },
  { id: "uzbekistan",         name: "UZBEKISTAN",         shortName: "UZB" },
];

export default function ClubSelect() {
  const router = useRouter();
  const { fanBalances, isConnected, isConnecting } = useWallet();

  const hasFanToken =
    isConnected &&
    (parseFloat(fanBalances.ARG) >= 1 ||
      parseFloat(fanBalances.BRA) >= 1 ||
      parseFloat(fanBalances.FRA) >= 1);

  const teams: Team[] = ALL_TEAMS.map((t) => ({
    ...t,
    logoPath: `/logos/${t.id}.png`,
    isAvailable: hasFanToken,
  }));

  const handleEnterTeam = (teamId: string) => {
    if (hasFanToken) {
      router.push(`/clubroom/psg?team=${teamId}`);
    }
  };

  const totalFanTokens =
    parseFloat(fanBalances.ARG || "0") +
    parseFloat(fanBalances.BRA || "0") +
    parseFloat(fanBalances.FRA || "0");

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-border p-0">
            <CardHeader className="bg-black text-white p-0">
              {/* Top Nav */}
              <div className="bg-gray-900 px-6 py-3 border-b-2 border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => router.push("/")}
                      variant="noShadow"
                      className="bg-white text-black border-2 border-border hover:bg-gray-100 p-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="bg-white px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-black font-black text-sm tracking-wider">
                        FANVAS
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-sm">
                      / WORLD CUP 2026
                    </span>
                  </div>

                  {/* Token balance chip */}
                  <div className="flex items-center gap-2 bg-main text-black px-3 py-2 border-2 border-border font-black text-sm">
                    <Coins className="w-4 h-4" />
                    {isConnecting ? (
                      <span className="text-xs opacity-70">Connecting...</span>
                    ) : isConnected ? (
                      <span>{totalFanTokens.toFixed(0)} FAN TOKENS</span>
                    ) : (
                      <span className="text-xs opacity-70">Connect Wallet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="px-6 py-6">
                <CardTitle className="text-3xl font-black tracking-wider mb-1">
                  PICK YOUR WORLD CUP TEAM
                </CardTitle>
                <p className="text-sm font-mono opacity-80">
                  {teams.length} NATIONS · HOLD ANY FAN TOKEN TO ENTER
                </p>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.02, duration: 0.4 }}
            >
              <Card
                className={`
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  border-2 border-border
                  cursor-pointer
                  transition-all duration-200
                  ${team.isAvailable
                    ? "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-105"
                    : "opacity-50 cursor-not-allowed"
                  }
                `}
                onClick={() => handleEnterTeam(team.id)}
              >
                <CardContent className="p-3 text-center space-y-2">
                  {/* Logo */}
                  <div className="flex justify-center">
                    <motion.div
                      className="relative w-16 h-16 bg-white border-2 border-black flex items-center justify-center p-2 overflow-hidden group"
                      whileHover={team.isAvailable ? { scale: 1.05 } : {}}
                    >
                      <Image
                        src={team.logoPath}
                        alt={team.name}
                        width={56}
                        height={56}
                        className="object-contain max-w-full max-h-full z-10 relative"
                      />
                      {/* Shine */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        initial={{ x: "-100%", rotate: 25 }}
                        whileHover={{ x: "100%", transition: { duration: 0.6, ease: "easeInOut" } }}
                        style={{ width: "150%", height: "150%", top: "-25%", left: "-25%" }}
                      />
                    </motion.div>
                  </div>

                  {/* Name */}
                  <p className="text-xs font-black text-foreground leading-tight">
                    {team.name}
                  </p>

                  {/* Status badge */}
                  {team.isAvailable ? (
                    <div className="bg-main text-black px-2 py-1 border border-border font-black text-xs">
                      <Unlock className="w-2.5 h-2.5 inline mr-1" />
                      ENTER
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white px-2 py-1 border border-border font-black text-xs">
                      <Lock className="w-2.5 h-2.5 inline mr-1" />
                      LOCKED
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs font-bold text-gray-600">
            POWERED BY FANVAS · WORLD CUP 2026 · ON X LAYER
          </p>
        </motion.div>
      </div>
    </div>
  );
}
