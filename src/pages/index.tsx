import { LandingCard } from "@/components";
import Head from "next/head";
export default function Home() {
  return (
    <>
      <Head>
        <title>Mortypedia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-foreground flex min-h-screen flex-col items-center ">
        <div className="flex h-full w-full flex-grow flex-col items-center gap-[2rem] px-[2rem] py-[4rem] lg:justify-center">
          <h1 className="text-center text-5xl">Welcome to Mortypedia</h1>
          <p className="text-center text-lg">
            Explore the Rick & Morty Universe
          </p>
          <div className="flex w-full flex-col items-center gap-[2rem] lg:w-[80%] lg:flex-row lg:justify-center">
            <LandingCard
              title="Characters"
              imageAlt="An overview image of characters in Rick & Morty"
              image="/characters.jpeg"
              href="/characters"
            />
            <LandingCard
              title="Episodes"
              imageAlt="An example thumbnail of an episode in Rick & Morty"
              image="/episodes.webp"
              href="/episodes"
            />
            <LandingCard
              title="Locations"
              imageAlt="An example image of a location in Rick & Morty"
              image="/locations.webp"
              href="/locations"
            />
          </div>
        </div>
      </main>
    </>
  );
}
