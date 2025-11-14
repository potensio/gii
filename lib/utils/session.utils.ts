import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

/**
 * Session cookie configuration
 */
export const SESSION_COOKIE_NAME = "session_id";

export const SESSION_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  path: "/",
};

/**
 * Check if a string is in UUID format
 */
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    str
  );
}

/**
 * Get session ID from request cookies or create a new one
 * @param request - Next.js request object
 * @returns Session ID string
 */
export function getSessionId(request: NextRequest): string {
  // Check for existing session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    // If the existing session ID is in UUID format (old format), generate a new one
    // This handles the migration from UUID-based session IDs to nanoid-based ones
    if (isUUID(sessionCookie.value)) {
      return nanoid();
    }
    return sessionCookie.value;
  }

  // Generate new session ID using nanoid (not UUID to distinguish from user IDs)
  const newSessionId = nanoid();

  return newSessionId;
}

/**
 * Set session cookie in response
 * @param response - Next.js response object
 * @param sessionId - Session ID to set
 * @returns Modified response object
 */
export function setSessionCookie(
  response: NextResponse,
  sessionId: string
): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_CONFIG);
  return response;
}

/**
 * Get or create session ID and set cookie if new
 * Convenience function that combines getSessionId and setSessionCookie
 * @param request - Next.js request object
 * @param response - Next.js response object
 * @returns Object with sessionId and isNew flag
 */
export function ensureSession(
  request: NextRequest,
  response: NextResponse
): { sessionId: string; isNew: boolean } {
  const existingSession = request.cookies.get(SESSION_COOKIE_NAME);

  if (existingSession?.value) {
    return {
      sessionId: existingSession.value,
      isNew: false,
    };
  }

  // Create new session using nanoid (not UUID to distinguish from user IDs)
  const newSessionId = nanoid();
  setSessionCookie(response, newSessionId);

  return {
    sessionId: newSessionId,
    isNew: true,
  };
}

/**
 * Clear session cookie from response
 * @param response - Next.js response object
 * @returns Modified response object
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_CONFIG,
    maxAge: 0,
  });
  return response;
}
