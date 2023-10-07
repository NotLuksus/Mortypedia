/* eslint-disable react-hooks/exhaustive-deps */
import { EntityCard, EntityCardSkeleton } from "@/components";
import { EpisodesDocument } from "@/generated/graphql";
import { api } from "@/utils/api";
import { useQuery } from "@apollo/client";
import { Input } from "@nextui-org/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

export default function Episodes() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const trpcContext = api.useContext();
  const { data, loading, fetchMore } = useQuery(EpisodesDocument, {
    variables: {
      filter: {
        name,
      },
    },
  });
  const episodes = data?.episodes?.results?.map((episode) => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
    });

    return schema.parse(episode);
  });

  const { data: likes } = api.user.getLikes.useQuery("episode");
  const { mutate } = api.user.toggleLike.useMutation();

  const handleLike = (id: number) => {
    mutate(
      { entityId: id, entityType: "episode" },
      {
        async onSuccess() {
          await trpcContext.user.getLikes.refetch();
        },
      },
    );
  };

  const intersectionRef = useRef<HTMLDivElement>(null);

  const handleFetchMore = async () => {
    setIsFetchingMore(true);
    await fetchMore({
      variables: {
        page: page + 1,
        filter: {
          name,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          episodes: {
            results: [
              ...(prev.episodes?.results ?? []),
              ...(fetchMoreResult.episodes?.results ?? []),
            ],
          },
        };
      },
    });
    setIsFetchingMore(false);
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry) return;
        if (firstEntry.isIntersecting) {
          handleFetchMore().catch(console.error);
        }
      },
      { threshold: 1.0 },
    );

    if (intersectionRef.current) {
      observer.observe(intersectionRef.current);
    }

    return () => {
      if (intersectionRef.current) {
        observer.unobserve(intersectionRef.current);
      }
    };
  }, [data]);
  return (
    <>
      <Head>
        <title>Mortypedia - Episodes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center text-foreground">
        <div className="flex h-full w-full flex-grow flex-col items-center gap-[2rem] px-[1rem] py-[4rem] lg:w-[80%] lg:justify-center">
          <h1 className="text-center text-5xl">Episodes</h1>
          <div className="flex w-full flex-col items-center gap-[1rem] md:flex-row">
            <Input
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[240px]"
            />
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-[3rem]">
            {episodes && (
              <>
                {episodes.map((episode, i) => (
                  <EntityCard
                    ref={i === episodes.length - 1 ? intersectionRef : null}
                    key={`${episode?.id}/${episode?.name}`}
                    id={episode?.id}
                    name={episode?.name}
                    type="episode"
                    image={"/episodes.webp"}
                    isLiked={likes?.some(
                      (l) => l.entityId === Number(episode?.id),
                    )}
                    onToggleLike={() => handleLike(Number(episode?.id))}
                  />
                ))}
              </>
            )}
            {(loading || isFetchingMore) && (
              <>
                {Array.from({ length: 20 }).map((_, i) => (
                  <EntityCardSkeleton key={i} />
                ))}
              </>
            )}
            {episodes?.length === 0 && (
              <p className="text-center text-2xl">No episode found</p>
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
