import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbModule from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  leads: router({
    search: publicProcedure
      .input(
        z.object({
          state: z.string().min(1),
          city: z.string().min(1),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ input }) => {
        const { state, city, startDate, endDate } = input;
        return await dbModule.getLeadsByLocationAndDate(state, city, startDate, endDate);
      }),

    searchWithProgress: publicProcedure
      .input(
        z.object({
          state: z.string().min(1),
          city: z.string().min(1),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ input }) => {
        const { state, city, startDate, endDate } = input;
        const { generateOptimizedQueries, validateSearchParameters } = await import(
          "./enhancedSearchService"
        );

        const validation = validateSearchParameters(city, state, startDate, endDate);
        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        const queries = generateOptimizedQueries(city, state, startDate, endDate);

        return {
          queries: queries.map((q) => ({
            query: q.query,
            description: q.description,
          })),
          totalQueries: queries.length,
          city,
          state,
        };
      }),

    getAll: publicProcedure.query(async () => {
      const db_instance = await dbModule.getDb();
      if (!db_instance) return [];
      const { leads: leadsTable } = await import("../drizzle/schema");
      return await db_instance.select().from(leadsTable);
    }),

    // Endpoint handles both Mock and Real search depending on configuration
    getMockResults: publicProcedure
      .input(
        z.object({
          state: z.string().min(1),
          city: z.string().min(1),
          neighborhood: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        // If Google Keys are present, perform REAL search
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
          console.log("[Search] Using Real Google Search Service");
          const { searchAndMapToLeads } = await import("./realSearchService");
          const results = await searchAndMapToLeads(input.city, input.state, input.neighborhood);
          // Sort by quality if needed
          return results.sort((a, b) => b.quality - a.quality);
        }

        // Fallback to Mock Data
        console.log("[Search] Keys not found, using Mock Data Generator");
        const { generateMockLeads, sortLeadsByQuality } = await import(
          "./mockLeadData"
        );
        const leads = generateMockLeads(input.city, input.neighborhood || "");
        return leads;
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
