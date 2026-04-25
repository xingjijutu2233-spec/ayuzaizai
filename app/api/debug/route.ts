import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

export async function GET(req: NextRequest) {
  const apiKey = serverConfig.apiKey || "";
  const baseUrl = serverConfig.baseUrl || "";

  // try a real request to the relay
  const testUrl = `${baseUrl}/v1/chat/completions`;
  const authHeader = `Bearer ${apiKey}`;

  let testResult: any = {};
  try {
    const res = await fetch(testUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        model: "[An2￥0.2/次]claude-opus-4-6",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 5,
      }),
    });
    const text = await res.text();
    testResult = {
      status: res.status,
      body: text.substring(0, 200),
    };
  } catch (e: any) {
    testResult = { error: e.message };
  }

  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : "NOT SET",
    apiKeyLength: apiKey.length,
    baseUrl: baseUrl || "NOT SET",
    authHeaderSent: authHeader.substring(0, 15) + "...",
    testUrl,
    testResult,
  });
}

export const runtime = "nodejs";
