import { EpisodeDocument, type EpisodeQuery } from "@/generated/graphql";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { Avatar, Button, Spinner } from "@nextui-org/react";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Heart } from "lucide-react";
import { useGenerateAIMessage } from "@/hooks/useGenerateAIMessage";
import { useEffect, useState } from "react";

const episodesSchema = z.object({
  id: z.string(),
  air_date: z.string(),
  characters: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string(),
    }),
  ),
  episode: z.string(),
  name: z.string(),
});

export const getServerSideProps = (async (context) => {
  const { episodeId } = context.query;

  const apolloClient = new ApolloClient({
    ssrMode: true,
    uri: "https://rickandmortyapi.com/graphql",
    cache: new InMemoryCache(),
  });

  const { data } = await apolloClient.query<EpisodeQuery>({
    query: EpisodeDocument,
    variables: {
      id: episodeId,
    },
  });

  const episodeData = data.episode;
  const episode = episodesSchema.parse(episodeData);

  return {
    props: {
      ...episode,
    },
  };
}) satisfies GetServerSideProps<{
  air_date: string;
  characters: Array<{ id: string; name: string; image: string }>;
  episode: string;
  name: string;
}>;

export default function Episode({
  id,
  air_date,
  characters,
  episode,
  name,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const { data: isLiked } = api.user.isLiked.useQuery({
    entityId: Number(id),
    entityType: "episode",
  });
  const trpcContext = api.useContext();
  const { mutate } = api.user.toggleLike.useMutation();

  const [summary, setSummary] = useState("");

  const { submitPrompt, loading } = useGenerateAIMessage();

  useEffect(() => {
    const handleGenMessage = async () => {
      const summary = await submitPrompt(
        `Summarize the Rick & Morty episode ${name}. Write a short paragraph summarizing the episode. There shouldn't be any fomatting or special characters. Return it as a simple string`,
      );
      setSummary(summary);
    };

    handleGenMessage().catch(console.error);
  }, []);

  const handleLike = () => {
    mutate(
      { entityId: Number(id), entityType: "episode" },
      {
        async onSuccess() {
          await trpcContext.user.isLiked.refetch();
        },
      },
    );
  };
  return (
    <>
      <Head>
        <title>Mortypedia - {name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center justify-center text-foreground">
        <div className="flex h-full w-full flex-grow flex-col items-start justify-center gap-[1rem] px-[1rem] py-[4rem] lg:w-[80%]">
          <h1 className="text-center text-5xl font-bold">{name}</h1>
          <div className="flex flex-row items-center gap-[1rem]">
            <p className="text-center text-lg">{air_date}</p>
            <p className="text-center text-lg">{episode}</p>
            {session && (
              <Button
                color="danger"
                onClick={handleLike}
                endContent={
                  <Heart
                    color="white"
                    fill={isLiked ? "white" : "transparent"}
                  />
                }
              >
                {isLiked ? "Liked" : "Like"}
              </Button>
            )}
          </div>
          {loading ? (
            <Spinner className="mt-[1rem]" size="lg" />
          ) : (
            <p className="mt-[1rem] text-start text-lg">{summary}</p>
          )}
          <p className="text-start text-xl font-bold">In this episode: </p>
          <div className="flex w-full flex-row flex-wrap gap-[2.5rem] p-[1rem]">
            {characters.map((character) => (
              <div
                key={character.id}
                className="inline-flex w-fit min-w-[125px] flex-col items-center justify-between gap-[1rem]"
              >
                <Avatar
                  size="lg"
                  href={`/character/${character.id}`}
                  as={Link}
                  src={character.image}
                />
                <p>{character.name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
