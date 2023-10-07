import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { NextUIProvider } from "@nextui-org/react";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Navbar } from "@/components";

const apolloClient = new ApolloClient({
  uri: "https://rickandmortyapi.com/graphql",
  cache: new InMemoryCache(),
});

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ApolloProvider client={apolloClient}>
      <NextUIProvider>
        <SessionProvider session={session}>
          <Navbar />
          <Component {...pageProps} />
        </SessionProvider>
      </NextUIProvider>
    </ApolloProvider>
  );
};

export default api.withTRPC(App);
