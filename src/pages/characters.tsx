import { EntityCard, EntityCardSkeleton } from "@/components";
import { CharactersDocument } from "@/generated/graphql";
import { useQuery } from "@apollo/client";
import { Input, Select, SelectItem } from "@nextui-org/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

export default function Characters() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { data, loading, fetchMore } = useQuery(CharactersDocument, {
    variables: {
      filter: {
        name,
        status,
        species,
        gender,
      },
    },
  });
  const characters = data?.characters?.results?.map((character) => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    });

    return schema.parse(character);
  });

  const intersectionRef = useRef<HTMLDivElement>(null);

  const handleFetchMore = async () => {
    setIsFetchingMore(true);
    await fetchMore({
      variables: {
        page: page + 1,
        filter: {
          name,
          status,
          species,
          gender,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          characters: {
            results: [
              ...(prev.characters?.results ?? []),
              ...(fetchMoreResult.characters?.results ?? []),
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
        <title>Mortypedia - Characters</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-foreground flex min-h-screen w-full flex-col items-center">
        <div className="flex h-full w-full flex-grow flex-col items-center gap-[2rem] px-[1rem] py-[4rem] lg:w-[80%] lg:justify-center">
          <h1 className="text-center text-5xl">Characters</h1>
          <div className="flex w-full flex-col items-center gap-[1rem] md:flex-row">
            <Input
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[240px]"
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-[240px]"
            >
              <SelectItem key={"alive"} value={"alive"}>
                Alive
              </SelectItem>
              <SelectItem key={"dead"} value={"dead"}>
                Dead
              </SelectItem>
              <SelectItem key={"unkown"} value={"unkown"}>
                Unkown
              </SelectItem>
            </Select>
            <Input
              type="text"
              label="Species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-[240px]"
            />
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-[240px]"
            >
              <SelectItem key={"female"} value={"female"}>
                Female
              </SelectItem>
              <SelectItem key={"male"} value={"male"}>
                Male
              </SelectItem>
              <SelectItem key={"genderless"} value={"genderless"}>
                Genderless
              </SelectItem>
              <SelectItem key={"unkown"} value={"unkown"}>
                Unkown
              </SelectItem>
            </Select>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-[3rem]">
            {characters && (
              <>
                {characters.map((character, i) => (
                  <EntityCard
                    ref={i === characters.length - 1 ? intersectionRef : null}
                    key={`${character?.id}/${character?.name}`}
                    id={character?.id}
                    name={character?.name}
                    type="character"
                    image={character.image}
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
            {characters?.length === 0 && (
              <p className="text-center text-2xl">No characters found</p>
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
