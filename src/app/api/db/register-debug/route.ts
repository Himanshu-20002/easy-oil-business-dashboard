import { NextResponse } from 'next/server';

declare global {
  var registrationDebugLog: {
    lastAttempt?: {
      email?: string;
      companyName?: string;
      gst?: string;
      pan?: string;
      mobile?: string;
      createdAt: string;
    };
    lastResult?: {
      success: boolean;
      message: string;
      status: number;
    };
    lastError?: string;
  } | undefined;
}

export async function GET() {
  const debugLog = global.registrationDebugLog;

  return NextResponse.json({
    success: true,
    message: 'Registration debug status',
    registrationDebugLog: debugLog || null,
    dbConfigured: !!process.env.MONGODB_URI,
    envName: process.env.NODE_ENV || 'unknown'
  });
}
