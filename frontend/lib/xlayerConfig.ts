export const X_LAYER_TESTNET = {
  chainId: 1952,
  chainIdHex: "0x7A0",
  chainName: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: ["https://testrpc.xlayer.tech"],
  blockExplorerUrls: ["https://www.oklink.com/xlayer-test"],
} as const;

export const FAN_TOKEN_ADDRESSES = {
  ARG: process.env.NEXT_PUBLIC_ARG_TOKEN_ADDRESS || "",
  BRA: process.env.NEXT_PUBLIC_BRA_TOKEN_ADDRESS || "",
  FRA: process.env.NEXT_PUBLIC_FRA_TOKEN_ADDRESS || "",
} as const;

export const FAN_TOKEN_ORDER: Array<keyof typeof FAN_TOKEN_ADDRESSES> = ["ARG", "BRA", "FRA"];

export type FanTokenSymbol = keyof typeof FAN_TOKEN_ADDRESSES;
