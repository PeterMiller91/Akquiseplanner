import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type TokenPayload } from "./jwt";

export async function withAuth(
  handler: (
    req: NextRequest,
    context: { userId: string }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const token = request.cookies.get("auth_token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);

      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }

      return handler(request, { userId: decoded.userId });
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
