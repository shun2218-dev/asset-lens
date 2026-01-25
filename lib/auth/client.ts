import { passkeyClient } from "@better-auth/passkey/client";
import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react";

import { authClient as mockClient } from "./client.mock";

const client = createAuthClient({
  plugins: [
    passkeyClient(),
    emailOTPClient()
  ],
});

export const authClient = process.env.STORYBOOK === "true" ? mockClient : client;

export const { signIn, signUp, signOut, passkey, useSession, getSession } =
  authClient;
