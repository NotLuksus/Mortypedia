import { useState, type FC } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import NextLink from "next/link";
import {
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Link,
  Navbar as NextUiNavbar,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { useRouter } from "next/router";

const Navbar: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <NextUiNavbar onMenuOpenChange={setOpen}>
      <NavbarBrand>
        <NavbarMenuToggle
          aria-label={open ? "Close menu" : "Open menu"}
          className="mr-[1rem] sm:hidden"
        />
        <Link as={NextLink} href="/">
          <p className="font-bold text-black">Mortypedia</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        <NavbarItem isActive={router.pathname === "/characters"}>
          <Link as={NextLink} color="foreground" href="/characters">
            Characters
          </Link>
        </NavbarItem>
        <NavbarItem isActive={router.pathname === "/episodes"}>
          <Link
            as={NextLink}
            color="foreground"
            href="/episodes"
            aria-current="page"
          >
            Episodes
          </Link>
        </NavbarItem>
        <NavbarItem isActive={router.pathname === "/locations"}>
          <Link as={NextLink} color="foreground" href="/locations">
            Locations
          </Link>
        </NavbarItem>
        {session && (
          <NavbarItem isActive={router.pathname === "/likes"}>
            <Link as={NextLink} color="foreground" href="/likes">
              My Likes
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => (session ? signOut() : signIn())}
            variant="flat"
          >
            {session ? "Logout" : "Login"}
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        <NavbarMenuItem>
          <Link as={NextLink} href="/characters">
            Characters
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link as={NextLink} href="/episodes">
            Episodes
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link as={NextLink} href="/locations">
            Locations
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUiNavbar>
  );
};

export default Navbar;
