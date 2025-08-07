'use client';

import { useQuery } from '@apollo/client';
import { GetCountriesDocument } from '@/gql/graphql';
import { client } from '@/lib/apollo-client';
import { ApolloProvider } from '@apollo/client';

export default function CountriesPage() {
  return (
    <ApolloProvider client={client}>
      <CountriesList />
    </ApolloProvider>
  );
}

function CountriesList() {
  const { data, loading, error } = useQuery(GetCountriesDocument);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.countries.map((country: any) => (// fix type
        <li key={country.code}>{country.name} ({country.code})</li>
      ))}
    </ul>
  );
}