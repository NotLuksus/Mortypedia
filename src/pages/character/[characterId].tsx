import { env } from "@/env.mjs";
import { CharacterDocument, type CharacterQuery } from "@/generated/graphql";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import OpenAI from "openai";
import Link from "next/link";
import NextImage from "next/image";
import { Image } from "@nextui-org/react";
import { z } from "zod";

const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().optional(),
  status: z.string().optional(),
  species: z.string().optional(),
  gender: z.string().optional(),
});

export const getServerSideProps = (async (context) => {
  const { characterId } = context.query;
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  const apolloClient = new ApolloClient({
    ssrMode: true,
    uri: "https://rickandmortyapi.com/graphql",
    cache: new InMemoryCache(),
  });

  const { data } = await apolloClient.query<CharacterQuery>({
    query: CharacterDocument,
    variables: {
      id: characterId,
    },
  });

  const characterData = data.character;
  const character = characterSchema.parse(characterData);

  const characterProfile = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: false,
    messages: [
      {
        role: "user",
        content: `Write a short profile about the character ${character.name} from the series Rick and Morty. There shouldn't be any fomatting or special characters. Return it as a simple string`,
      },
    ],
  });

  const characterEpisodes = characterData?.episode
    .filter(Boolean)
    .map((episode) => ({
      id: episode.id ?? "",
      name: episode?.name ?? "",
    }));

  return {
    props: {
      ...character,
      episodes: characterEpisodes ?? [],
      profile: characterProfile.choices[0]?.message.content ?? "",
    },
  };
}) satisfies GetServerSideProps<{
  id: string;
  name: string;
  image?: string;
  status?: string;
  species?: string;
  gender?: string;
  episodes: Array<{ id: string; name: string }>;
  profile: string;
}>;

export default function Episode({
  name,
  image,
  status,
  species,
  gender,
  episodes,
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Mortypedia - {name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-foreground flex min-h-screen w-full flex-col items-center justify-center">
        <div className="flex h-full w-full flex-grow flex-col items-start justify-center gap-[1rem] px-[1rem] py-[4rem] lg:w-[80%]">
          <div className="flex w-full flex-col-reverse items-center justify-between gap-[4rem] md:flex-row">
            <div className="flex w-full flex-col md:w-[60%]">
              <h1 className="text-start text-5xl font-bold">{name}</h1>
              <div className="flex flex-row gap-[1rem]">
                <p className="text-center text-lg">{species}</p>
                <p className="text-center text-lg">{gender}</p>
                <p className="text-center text-lg">{status}</p>
              </div>
              <p className="mt-[1rem] text-start text-lg">{profile}</p>
            </div>
            <div className="relative h-[300px] w-[300px]">
              <Image as={NextImage} removeWrapper fill src={image} alt={name} />
            </div>
          </div>

          <p className="text-start text-xl font-bold">Appears in: </p>
          <ul className="flex w-full flex-row flex-wrap gap-[2.5rem] p-[1rem]">
            {episodes.map((episode) => (
              <Link href={`/episode/${episode.id}`} key={episode.id}>
                <li className="inline-flex w-fit min-w-[125px] cursor-pointer flex-col items-start justify-between gap-[1rem] text-blue-600">
                  {episode.name}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
