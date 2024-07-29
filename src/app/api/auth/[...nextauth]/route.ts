import NextAuth, { type AuthOptions } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { authOptions, authAdapter } from "~/server/auth";
import { randomUUID } from "crypto";
import {
  decode,
  encode,
  type JWTDecodeParams,
  type JWTEncodeParams,
} from "next-auth/jwt";

const fromDate = (time: number, date = Date.now()) => {
  return new Date(date + time * 1000);
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions);
export { handler as GET };

export async function POST(req: NextRequest, res: NextResponse) {
  const options = {
    ...authOptions,
    callbacks: {
      async signIn({ user }) {
        // Check if the request is for auth callback
        if (
          req.nextUrl.href.includes("auth/callback/credentials") &&
          authAdapter.createSession
        ) {
          if (user) {
            const sessionToken = randomUUID();
            const sessionExpires = fromDate(60 * 60 * 24 * 30);

            await authAdapter.createSession({
              sessionToken,
              userId: user.id,
              // Expires in 30 days
              expires: sessionExpires,
            });

            cookies().set("next-auth.session-token", sessionToken, {
              expires: sessionExpires,
            });
          }
        }

        return true;
      },
    },
    jwt: {
      encode: async ({ token, secret, maxAge }: JWTEncodeParams) => {
        if (
          req.nextUrl.href.includes("auth/callback/credentials") &&
          authAdapter.createSession
        ) {
          const cookie = cookies().get("next-auth.session-token");

          if (cookie) return cookie.value;
          else return "";
        }
        // Revert to default behaviour when not in the credentials provider callback flow
        return encode({
          secret,
          token,
          maxAge,
        });
      },
      decode: async ({ token, secret }: JWTDecodeParams) => {
        if (
          req.nextUrl.href.includes("auth/callback/credentials") &&
          authAdapter.createSession
        ) {
          return null;
        }

        // Revert to default behaviour when not in the credentials provider callback flow
        return decode({ token, secret });
      },
    },
  } satisfies AuthOptions;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return NextAuth(
    req as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
    options,
  );
}
