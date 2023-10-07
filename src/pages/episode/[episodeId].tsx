import { env } from "@/env.mjs";
import { EpisodeDocument, type EpisodeQuery } from "@/generated/graphql";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { Avatar } from "@nextui-org/react";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import OpenAI from "openai";
import Link from "next/link";

export const getServerSideProps = (async (context) => {
  const { episodeId } = context.query;
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

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

  const episodeSummary = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: false,
    messages: [
      {
        role: "user",
        content: `Summarize the Rick & Morty episode ${episodeData?.name}. Write a short paragraph summarizing the episode. There shouldn't be any fomatting or special characters. Return it as a simple string`,
      },
    ],
  });

  const episodeCharacters = episodeData?.characters
    .filter(Boolean)
    .map((character) => ({
      id: character.id ?? "",
      name: character?.name ?? "",
      image: character?.image ?? "",
    }));

  return {
    props: {
      air_date: episodeData?.air_date ?? "",
      characters: episodeCharacters ?? [],
      episode: episodeData?.episode ?? "",
      name: episodeData?.name ?? "",
      summary: episodeSummary.choices[0]?.message.content ?? "",
    },
  };
}) satisfies GetServerSideProps<{
  air_date: string;
  characters: Array<{ id: string; name: string; image: string }>;
  episode: string;
  name: string;
  summary: string;
}>;

export default function Episode({
  summary,
  air_date,
  characters,
  episode,
  name,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Mortypedia - {name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-foreground flex min-h-screen w-full flex-col items-center justify-center">
        <div className="flex h-full w-full flex-grow flex-col items-start justify-center gap-[1rem] px-[1rem] py-[4rem] lg:w-[80%]">
          <h1 className="text-center text-5xl font-bold">{name}</h1>
          <div className="flex flex-row gap-[1rem]">
            <p className="text-center text-lg">{air_date}</p>
            <p className="text-center text-lg">{episode}</p>
          </div>
          <p className="text-start text-lg">{summary}</p>
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
