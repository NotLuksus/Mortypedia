import { env } from "@/env.mjs";
import { LocationDocument, type LocationQuery } from "@/generated/graphql";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { Avatar } from "@nextui-org/react";
import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import OpenAI from "openai";
import Link from "next/link";
import { z } from "zod";

const locationSchema = z.object({
  name: z.string(),
  type: z.string(),
  dimension: z.string(),
  residents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string(),
    }),
  ),
});

export const getServerSideProps = (async (context) => {
  const { locationId } = context.query;
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  const apolloClient = new ApolloClient({
    ssrMode: true,
    uri: "https://rickandmortyapi.com/graphql",
    cache: new InMemoryCache(),
  });

  const { data } = await apolloClient.query<LocationQuery>({
    query: LocationDocument,
    variables: {
      id: locationId,
    },
  });

  const locationData = data.location;
  const location = locationSchema.parse(locationData);

  const locationDescription = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    stream: false,
    messages: [
      {
        role: "user",
        content: `Write a small text about the ${location.name} location from the Rick & Morty series. Write a short paragraph describing the location. There shouldn't be any fomatting or special characters. Return it as a simple string`,
      },
    ],
  });

  return {
    props: {
      ...location,
      description: locationDescription.choices[0]?.message.content ?? "",
    },
  };
}) satisfies GetServerSideProps<{
  name: string;
  type: string;
  dimension: string;
  residents: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  description: string;
}>;

export default function Episode({
  name,
  type,
  dimension,
  residents,
  description,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Mortypedia - {name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen w-full flex-col items-center justify-center text-foreground">
        <div className="flex h-full w-full flex-grow flex-col items-start justify-center gap-[1rem] px-[1rem] py-[4rem] lg:w-[80%]">
          <h1 className="text-center text-5xl font-bold">{name}</h1>
          <div className="flex flex-row gap-[1rem]">
            <p className="text-center text-lg">{type}</p>
            <p className="text-center text-lg">{dimension}</p>
          </div>
          <p className="text-start text-lg">{description}</p>
          <p className="text-start text-xl font-bold">Residents: </p>
          <div className="flex w-full flex-row flex-wrap gap-[2.5rem] p-[1rem]">
            {residents.map((character) => (
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
