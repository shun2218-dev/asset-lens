import { headers } from "next/headers";
import { auth } from "./auth";

export const passkeys = await auth.api.listPasskeys({
  headers: await headers(),
});
