import { Card, CardFooter, Image, Skeleton } from "@nextui-org/react";
import { forwardRef, type ForwardedRef } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface EntityCardProps {
  id: string;
  type: string;
  name: string;
  image?: string;
  className?: string;
}

export const EntityCard = forwardRef(function ForwaredEntityCard(
  { id, type, name, image, className }: EntityCardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <Card
      isFooterBlurred
      isPressable
      as={Link}
      href={`/${type}/${id}`}
      className={cn(
        "relative aspect-square h-[250px] cursor-pointer",
        className,
      )}
      ref={ref}
    >
      <Image
        isZoomed
        removeWrapper
        as={NextImage}
        alt={name}
        className="object-cover"
        src={image}
        fill
      />
      <CardFooter className="border-1 rounded-large shadow-small absolute bottom-2 left-0 right-0 z-10 mx-auto w-[calc(100%_-_8px)] justify-center overflow-hidden border-white/20 py-1">
        <p className="text-small lg:text-large text-black">{name}</p>
      </CardFooter>
    </Card>
  );
});

export const EntityCardSkeleton = () => {
  return (
    <Card className="relative aspect-square h-[250px] cursor-pointer">
      <Skeleton className="h-full w-full" />
      <div className="border-1 rounded-large absolute bottom-2 left-0 right-0 z-10 mx-auto h-[2rem] w-[calc(100%_-_8px)] justify-center overflow-hidden border-white/20 py-1 shadow-lg">
        <Skeleton />
      </div>
    </Card>
  );
};
