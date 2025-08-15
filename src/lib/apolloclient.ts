import { ApolloClient, InMemoryCache, makeVar, split } from "@apollo/client";
import { createHttpLink } from "@apollo/client/link/http";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Determine if the app is running in a local environment
const isLocal = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN === "local";

// Set the base URL based on the environment
const subdomain = isLocal ? "local" : process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
const region = isLocal ? "local" : process.env.NEXT_PUBLIC_NHOST_REGION;

const httpUrl = `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;
const wsUrl = `wss://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;

const httpLink = createHttpLink({
  uri: httpUrl,
});

// A small change here to pass the auth token.
const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    connectionParams: async () => {
      const token = authTokenVar();
      return {
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const authTokenVar = makeVar<string | undefined>(undefined);

const authLink = setContext(async (_, { headers }) => {
  const token = authTokenVar();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  // Use the authLink and the splitLink together
  link: authLink.concat(splitLink),
  cache: new InMemoryCache(),
});
