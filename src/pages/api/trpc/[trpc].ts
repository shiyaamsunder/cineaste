import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@cineaste/env.mjs";
import { createTRPCContext } from "@cineaste/server/api/trpc";
import { appRouter } from "@cineaste/server/api/root";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});
