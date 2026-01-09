import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function tokenFromRequest(request?: NextRequest) {
  const authHeader = request?.headers.get("authorization") ?? headers().get("authorization");
  if (!authHeader) {
    return null;
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}

export async function requireSession(request?: NextRequest) {
  const token = tokenFromRequest(request);
  if (token) {
    const appSession = await prisma.appSession.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });
    if (!appSession) {
      return null;
    }
    return {
      user: {
        id: appSession.userId,
        email: appSession.user.email ?? null,
        name: appSession.user.name ?? null,
        image: appSession.user.image ?? null
      }
    };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
