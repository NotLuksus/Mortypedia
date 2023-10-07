import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://rickandmortyapi.com/graphql",
  documents: "./**/*.gql",
  generates: {
    "src/generated/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
