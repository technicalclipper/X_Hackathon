import { NextResponse } from "next/server";

export async function GET() {
  const hasJwt = !!process.env.PINATA_JWT;
  const hasGateway = !!process.env.PINATA_GATEWAY_URL;
  const jwtLength = process.env.PINATA_JWT?.length || 0;
  
  return NextResponse.json({
    hasJwt,
    hasGateway,
    jwtLength,
    jwtPreview: process.env.PINATA_JWT ? `${process.env.PINATA_JWT.substring(0, 20)}...` : 'Not set'
  });
} 