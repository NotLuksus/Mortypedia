import { EntityCard, EntityCardSkeleton } from "@/components";
import { LikesPageDocument } from "@/generated/graphql";
import { useQuery } from "@apollo/client";
import Head from "next/head";
import { z } from "zod";
import { api } from "@/utils/api";

export default function Likes() {
  const { data: likes, isLoading } = api.user.getLikes.useQuery();

  const characterIds = likes
    ?.filter((l) => l.entityType === "character")
    .map((like) => String(like.entityId));
  const episodeIds = likes
    ?.filter((l) => l.entityType === "episode")
    .map((like) => String(like.entityId));
  const locationIds = likes
    ?.filter((l) => l.entityType === "location")
    .map((like) => String(like.entityId));

  const { data, loading } = useQuery(LikesPageDocument, {
    variables: {
      characterIds: characterIds ?? "",
      episodeIds: episodeIds ?? "",
      locationIds: locationIds ?? "",
    },
    skip: !likes,
  });
  const trpcContext = api.useContext();
  const { mutate } = api.user.toggleLike.useMutation();

  const handleLike = (
    id: number,
    type: "character" | "episode" | "location",
  ) => {
    mutate(
      { entityId: id, entityType: type },
      {
        async onSuccess() {
          await trpcContext.user.getLikes.refetch();
        },
      },
    );
  };

  const entitySchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["character", "episode", "location"]),
    image: z.string().optional(),
  });
  const characters =
    data?.charactersByIds?.map((character) =>
      entitySchema.parse({
        ...character,
        type: "character",
      }),
    ) ?? [];

  const episodes =
    data?.episodesByIds?.map((episode) =>
      entitySchema.parse({
        ...episode,
        type: "episode",
        image: "/episodes.webp",
      }),
    ) ?? [];

  const locations =
    data?.locationsByIds?.map((location) =>
      entitySchema.parse({
        ...location,
        type: "location",
        image: "/locations.webp",
      }),
    ) ?? [];

  const entities = [...characters, ...episodes, ...locations];

  return (
    <>
      <Head>
        <title>Mortypedia - Characters</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center text-foreground">
        <div className="flex h-full w-full flex-grow flex-col items-center gap-[2rem] px-[1rem] py-[4rem] lg:w-[80%] lg:justify-center">
          <h1 className="text-center text-5xl">My Likes</h1>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-[3rem]">
            {characters && (
              <>
                {entities.map((entity) => (
                  <EntityCard
                    key={`${entity?.id}/${entity?.name}`}
                    id={entity?.id}
                    name={entity?.name}
                    type={entity?.type}
                    image={entity?.image}
                    isLiked={likes?.some(
                      (l) =>
                        l.entityId === Number(entity?.id) &&
                        l.entityType === entity?.type,
                    )}
                    onToggleLike={() =>
                      handleLike(Number(entity?.id), entity?.type)
                    }
                  />
                ))}
              </>
            )}
            {(loading || isLoading) && (
              <>
                {Array.from({ length: 20 }).map((_, i) => (
                  <EntityCardSkeleton key={i} />
                ))}
              </>
            )}
            {characters?.length === 0 && (
              <p className="text-center text-2xl">No characters found</p>
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
