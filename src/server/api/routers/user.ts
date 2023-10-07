import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { likes } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getLikes: protectedProcedure
    .input(z.enum(["character", "episode", "location"]).optional())
    .query(({ input, ctx }) => {
      return ctx.db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.userId, ctx.session.user.id),
            input ? eq(likes.entityType, input) : undefined,
          ),
        )
        .execute();
    }),
  toggleLike: protectedProcedure
    .input(
      z.object({
        entityId: z.number(),
        entityType: z.enum(["character", "episode", "location"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const like = await ctx.db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.userId, ctx.session.user.id),
            eq(likes.entityId, input.entityId),
            eq(likes.entityType, input.entityType),
          ),
        )
        .limit(1)
        .execute();

      if (like.length > 0) {
        await ctx.db
          .delete(likes)
          .where(
            and(
              eq(likes.userId, ctx.session.user.id),
              eq(likes.entityId, input.entityId),
              eq(likes.entityType, input.entityType),
            ),
          )
          .execute();
      } else {
        await ctx.db
          .insert(likes)
          .values({
            userId: ctx.session.user.id,
            entityId: input.entityId,
            entityType: input.entityType,
          })
          .execute();
      }
      return {
        success: true,
      };
    }),
});
