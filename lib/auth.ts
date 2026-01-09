import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import AppleProvider from "next-auth/providers/apple";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { sign } from "crypto";
import { prisma } from "@/lib/prisma";

const providers = [];
const APPLE_AUDIENCE = "https://appleid.apple.com";

const base64UrlEncode = (value: string | Buffer) =>
  Buffer.from(value).toString("base64url");

const createAppleClientSecret = (params: {
  appleId: string;
  teamId: string;
  keyId: string;
  privateKey: string;
}) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60 * 24 * 180;
  const header = { alg: "ES256", kid: params.keyId };
  const payload = {
    iss: params.teamId,
    iat: issuedAt,
    exp: expiresAt,
    aud: APPLE_AUDIENCE,
    sub: params.appleId
  };
  const tokenBody = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(payload)
  )}`;
  const signature = sign("sha256", Buffer.from(tokenBody), {
    key: params.privateKey,
    dsaEncoding: "ieee-p1363"
  });

  return `${tokenBody}.${base64UrlEncode(signature)}`;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET
    })
  );
}

if (process.env.APPLE_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_PRIVATE_KEY && process.env.APPLE_KEY_ID) {
  // Apple requires a JWT client secret; derive it from the key material at runtime.
  const appleClientSecret = createAppleClientSecret({
    appleId: process.env.APPLE_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n")
  });
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: appleClientSecret
    })
  );
}

console.info("[auth] providers", {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  discord: Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
  apple: Boolean(
    process.env.APPLE_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_PRIVATE_KEY &&
      process.env.APPLE_KEY_ID
  ),
  total: providers.length
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  logger: {
    error(code, metadata) {
      console.log("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.log("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      console.log("[next-auth][debug]", code, metadata);
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
};
