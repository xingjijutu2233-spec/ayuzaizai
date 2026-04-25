import { NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";

export async function GET() {
  const serverConfig = getServerSideConfig();
  const apiKey = serverConfig.apiKey || "";
  const baseUrl = serverConfig.baseUrl || "";

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : "NOT SET",
    apiKeyLength: apiKey.length,
    baseUrl: baseUrl || "NOT SET",
    hideUserApiKey: serverConfig.hideUserApiKey,
    needCode: serverConfig.needCode,
  });
}

export const runtime = "nodejs";
