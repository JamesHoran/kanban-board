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

export const cache = new InMemoryCache({
  typePolicies: {
    Subscription: {
      fields: {
        boards: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    labels: {
      keyFields: ["id"],
    },
    card_labels: {
      keyFields: ["card_id"],
    },
    cards: {
      keyFields: ["id"],
      fields: {
        card_labels: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    boards: {
      keyFields: ["id"],
      fields: {
        labels: {
          merge(
            existing: { id: string; name: string; color: string }[] = [],
            incoming: { id: string; name: string; color: string }[],
            { readField }
          ) {
            const merged = [...existing];

            incoming.forEach(label => {
              const id = readField("id", label);
              const index = merged.findIndex(l => readField("id", l) === id);
              if (index > -1) {
                // Replace existing label with updated data
                merged[index] = label;
              } else {
                // Add new label
                merged.push(label);
              }
            });

            return merged;
          },
        },
      },
    },
    columns: {
      keyFields: ["id"],
      fields: {
        cards: {
          merge(
            existing: {
              id: string;
              position: number;
              title: string;
              description?: string | null;
              card_labels: { card_id: string; label: { id: string; name: string; color: string } };
            }[] = [],
            incoming: {
              id: string;
              position: number;
              title: string;
              description?: string | null;
              card_labels: { card_id: string; label: { id: string; name: string; color: string } };
            }[],
            { readField }
          ) {
            const merged = [...existing];

            incoming.forEach(card => {
              const id = readField("id", card);
              const index = merged.findIndex(c => readField("id", c) === id);

              if (index > -1) {
                // Update existing card
                merged[index] = card;
              } else {
                // Add new card
                merged.push(card);
              }
            });

            return merged;
          },
        },
      },
    },
  },
});

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
  // cache: new InMemoryCache(),
  cache: cache,
});
