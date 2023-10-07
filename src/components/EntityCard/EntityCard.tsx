import { Card, CardFooter, Image, Skeleton } from "@nextui-org/react";
import { forwardRef, type ForwardedRef } from "react";
import NextImage from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";

interface EntityCardProps {
  id: string;
  type: string;
  name: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  image?: string;
  className?: string;
}

export const EntityCard = forwardRef(function ForwaredEntityCard(
  { id, type, name, image, isLiked, onToggleLike, className }: EntityCardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { data: session } = useSession();
  return (
    <Card
      isFooterBlurred
      /* as={Link}
      href={`/${type}/${id}`} */
      className={cn("relative aspect-square h-[250px]", className)}
      ref={ref}
    >
      <Link href={`/${type}/${id}`}>
        <Image
          isZoomed
          removeWrapper
          as={NextImage}
          alt={name}
          className="cursor-pointer object-cover"
          src={image}
          fill
        />
      </Link>
      <CardFooter
        className={cn(
          "absolute bottom-2 left-0 right-0 z-10 mx-auto w-[calc(100%_-_8px)] justify-center overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small",
          {
            "justify-between": session,
          },
        )}
      >
        <p className="text-small text-black lg:text-large">{name}</p>
        {session && (
          <Heart
            className="cursor-pointer transition-all hover:scale-105"
            onClick={onToggleLike}
            color="black"
            fill={isLiked ? "red" : "transparent"}
          />
        )}
      </CardFooter>
    </Card>
  );
});

export const EntityCardSkeleton = () => {
  return (
    <Card className="relative aspect-square h-[250px] cursor-pointer">
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-2 left-0 right-0 z-10 mx-auto h-[2rem] w-[calc(100%_-_8px)] justify-center overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-lg">
        <Skeleton />
      </div>
    </Card>
  );
};
