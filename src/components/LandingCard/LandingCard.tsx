import { cn } from "@/utils/cn";
import { Card, CardFooter, Image } from "@nextui-org/react";
import NextImage from "next/image";
import { type FC } from "react";
import Link from "next/link";

interface LandingCardProps {
  image: string;
  imageAlt: string;
  title: string;
  href: string;
  className?: string;
}

const LandingCard: FC<LandingCardProps> = ({
  image,
  imageAlt,
  title,
  href,
  className,
}) => {
  return (
    <Card
      as={Link}
      isFooterBlurred
      radius="lg"
      className={cn(
        "relative aspect-square w-[80%] max-w-[350px] cursor-pointer border-none",
        className,
      )}
      href={href}
    >
      <Image
        isZoomed
        removeWrapper
        as={NextImage}
        alt={imageAlt}
        className="object-cover"
        src={image}
        fill
      />
      <CardFooter className="border-1 rounded-large shadow-small absolute bottom-2 left-0 right-0 z-10 mx-auto w-[calc(100%_-_8px)] justify-center overflow-hidden border-white/20 py-1">
        <p className="text-small lg:text-large text-white">{title}</p>
      </CardFooter>
    </Card>
  );
};

export default LandingCard;
