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
}

interface Region {
  label: string;
  teams: Team[];
}

const REGIONS: Region[] = [
  {
    label: "EUROPE",
    teams: [
      { id: "austria",            name: "AUSTRIA",            shortName: "AUT" },
      { id: "belgium",            name: "BELGIUM",            shortName: "BEL" },
      { id: "bosnia-herzegovina", name: "BOSNIA HERZEGOVINA", shortName: "BIH" },
      { id: "croatia",            name: "CROATIA",            shortName: "CRO" },
      { id: "czechia",            name: "CZECHIA",            shortName: "CZE" },
      { id: "england",            name: "ENGLAND",            shortName: "ENG" },
      { id: "france",             name: "FRANCE",             shortName: "FRA" },
      { id: "germany",            name: "GERMANY",            shortName: "GER" },
      { id: "netherlands",        name: "NETHERLANDS",        shortName: "NED" },
      { id: "norway",             name: "NORWAY",             shortName: "NOR" },
      { id: "portugal",           name: "PORTUGAL",           shortName: "POR" },
      { id: "scotland",           name: "SCOTLAND",           shortName: "SCO" },
      { id: "spain",              name: "SPAIN",              shortName: "ESP" },
      { id: "sweden",             name: "SWEDEN",             shortName: "SWE" },
      { id: "switzerland",        name: "SWITZERLAND",        shortName: "SUI" },
      { id: "turkiye",            name: "TÜRKİYE",            shortName: "TUR" },
    ],
  },
  {
    label: "SOUTH AMERICA",
    teams: [
      { id: "argentina", name: "ARGENTINA", shortName: "ARG" },
      { id: "brazil",    name: "BRAZIL",    shortName: "BRA" },
      { id: "colombia",  name: "COLOMBIA",  shortName: "COL" },
      { id: "ecuador",   name: "ECUADOR",   shortName: "ECU" },
      { id: "paraguay",  name: "PARAGUAY",  shortName: "PAR" },
      { id: "uruguay",   name: "URUGUAY",   shortName: "URU" },
    ],
  },
  {
    label: "NORTH & CENTRAL AMERICA",
    teams: [
      { id: "canada",        name: "CANADA",        shortName: "CAN" },
      { id: "curacao",       name: "CURAÇAO",       shortName: "CUW" },
      { id: "haiti",         name: "HAITI",         shortName: "HAI" },
      { id: "mexico",        name: "MEXICO",        shortName: "MEX" },
      { id: "panama",        name: "PANAMA",        shortName: "PAN" },
      { id: "united-states", name: "UNITED STATES", shortName: "USA" },
    ],
  },
  {
    label: "AFRICA",
    teams: [
      { id: "algeria",      name: "ALGERIA",      shortName: "ALG" },
      { id: "cape-verde",   name: "CAPE VERDE",   shortName: "CPV" },
      { id: "dr-congo",     name: "DR CONGO",     shortName: "COD" },
      { id: "egypt",        name: "EGYPT",        shortName: "EGY" },
      { id: "ghana",        name: "GHANA",        shortName: "GHA" },
      { id: "ivory-coast",  name: "IVORY COAST",  shortName: "CIV" },
      { id: "morocco",      name: "MOROCCO",      shortName: "MAR" },
      { id: "senegal",      name: "SENEGAL",      shortName: "SEN" },
      { id: "south-africa", name: "SOUTH AFRICA", shortName: "RSA" },
      { id: "tunisia",      name: "TUNISIA",      shortName: "TUN" },
    ],
  },
  {
    label: "ASIA & OCEANIA",
    teams: [
      { id: "australia",    name: "AUSTRALIA",    shortName: "AUS" },
      { id: "iran",         name: "IRAN",         shortName: "IRN" },
      { id: "iraq",         name: "IRAQ",         shortName: "IRQ" },
      { id: "japan",        name: "JAPAN",        shortName: "JPN" },
      { id: "jordan",       name: "JORDAN",       shortName: "JOR" },
      { id: "new-zealand",  name: "NEW ZEALAND",  shortName: "NZL" },
      { id: "qatar",        name: "QATAR",        shortName: "QAT" },
      { id: "saudi-arabia", name: "SAUDI ARABIA", shortName: "KSA" },
      { id: "south-korea",  name: "SOUTH KOREA",  shortName: "KOR" },
      { id: "uzbekistan",   name: "UZBEKISTAN",   shortName: "UZB" },
    ],
  },
];

export default function ClubSelect() {
  const router = useRouter();
  const { fanBalances, isConnected, isConnecting } = useWallet();

  const hasFanToken =
    isConnected &&
    (parseFloat(fanBalances.ARG) >= 1 ||
      parseFloat(fanBalances.BRA) >= 1 ||
      parseFloat(fanBalances.FRA) >= 1);

  const totalFanTokens =
    parseFloat(fanBalances.ARG || "0") +
    parseFloat(fanBalances.BRA || "0") +
    parseFloat(fanBalances.FRA || "0");

  const handleEnterTeam = (teamId: string) => {
    if (hasFanToken) {
      router.push(`/clubroom/psg?team=${teamId}`);
    }
  };

  let cardIndex = 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Card className="shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-border p-0">
            <CardHeader className="bg-black text-white p-0">
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
                      <span className="text-black font-black text-sm tracking-wider">FANVAS</span>
                    </div>
                    <span className="text-gray-400 font-mono text-sm">/ WORLD CUP 2026</span>
                  </div>

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

              <div className="px-6 py-6">
                <CardTitle className="text-3xl font-black tracking-wider mb-1">
                  PICK YOUR WORLD CUP TEAM
                </CardTitle>
                <p className="text-sm font-mono opacity-70">
                  48 NATIONS · 5 REGIONS · HOLD ANY FAN TOKEN TO ENTER
                </p>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Regions */}
        <div className="space-y-10">
          {REGIONS.map((region, regionIndex) => (
            <motion.div
              key={region.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: regionIndex * 0.1 }}
            >
              {/* Region header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-black text-white px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black text-sm tracking-widest">{region.label}</span>
                </div>
                <div className="flex-1 h-1 bg-black" />
                <span className="font-black text-xs text-gray-500">{region.teams.length} TEAMS</span>
              </div>

              {/* Team grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {region.teams.map((team) => {
                  const delay = cardIndex++ * 0.03;
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay }}
                    >
                      <Card
                        className={`
                          border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                          transition-all duration-200 cursor-pointer
                          ${hasFanToken
                            ? "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:scale-105"
                            : "opacity-50 cursor-not-allowed"
                          }
                        `}
                        onClick={() => handleEnterTeam(team.id)}
                      >
                        <CardContent className="p-3 flex flex-col items-center gap-2">
                          {/* Logo box */}
                          <div className="relative w-14 h-14 bg-white border-2 border-black flex items-center justify-center p-1.5 overflow-hidden group">
                            <Image
                              src={`/logos/${team.id}.png`}
                              alt={team.name}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full z-10 relative"
                            />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                              initial={{ x: "-100%", rotate: 20 }}
                              whileHover={{ x: "150%", transition: { duration: 0.5 } }}
                              style={{ width: "60%", top: 0, bottom: 0 }}
                            />
                          </div>

                          {/* Country name */}
                          <p className="text-center font-black text-foreground leading-tight"
                            style={{ fontSize: "0.6rem" }}>
                            {team.name}
                          </p>

                          {/* Status */}
                          {hasFanToken ? (
                            <div className="w-full bg-main text-black text-center border border-border font-black py-0.5"
                              style={{ fontSize: "0.55rem" }}>
                              <Unlock className="w-2 h-2 inline mr-0.5" />
                              ENTER
                            </div>
                          ) : (
                            <div className="w-full bg-red-500 text-white text-center border border-border font-black py-0.5"
                              style={{ fontSize: "0.55rem" }}>
                              <Lock className="w-2 h-2 inline mr-0.5" />
                              LOCKED
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-center"
        >
          <p className="text-xs font-bold text-gray-500">
            POWERED BY FANVAS · WORLD CUP 2026 · ON X LAYER
          </p>
        </motion.div>
      </div>
    </div>
  );
}
