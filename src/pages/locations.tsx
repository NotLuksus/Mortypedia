import { EntityCard, EntityCardSkeleton } from "@/components";
import { LocationsDocument } from "@/generated/graphql";
import { useQuery } from "@apollo/client";
import { Input } from "@nextui-org/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

export default function Location() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [dimension, setDimension] = useState("");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { data, loading, fetchMore } = useQuery(LocationsDocument, {
    variables: {
      filter: {
        name,
        type,
        dimension,
      },
    },
  });
  const locations = data?.locations?.results?.map((location) => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
    });

    return schema.parse(location);
  });

  const intersectionRef = useRef<HTMLDivElement>(null);

  const handleFetchMore = async () => {
    setIsFetchingMore(true);
    await fetchMore({
      variables: {
        page: page + 1,
        filter: {
          name,
          type,
          dimension,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          locations: {
            results: [
              ...(prev.locations?.results ?? []),
              ...(fetchMoreResult.locations?.results ?? []),
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
        <title>Mortypedia - Locations</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="text-foreground flex min-h-screen w-full flex-col items-center">
        <div className="flex h-full w-full flex-grow flex-col items-center gap-[2rem] px-[1rem] py-[4rem] lg:w-[80%] lg:justify-center">
          <h1 className="text-center text-5xl">Locations</h1>
          <div className="flex w-full flex-col items-center gap-[1rem] md:flex-row">
            <Input
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-[240px]"
            />
            <Input
              type="text"
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-[240px]"
            />
            <Input
              type="text"
              label="Dimension"
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-[240px]"
            />
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-[3rem]">
            {locations && (
              <>
                {locations.map((location, i) => (
                  <EntityCard
                    ref={i === locations.length - 1 ? intersectionRef : null}
                    key={`${location?.id}/${location?.name}`}
                    id={location?.id}
                    name={location?.name}
                    type="location"
                    image={"/locations.webp"}
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
            {locations?.length === 0 && (
              <p className="text-center text-2xl">No location found</p>
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
