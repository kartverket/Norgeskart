import { Box, Search } from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Adresser } from '../types/adresseTypes.ts';

export const SearchComponent = () => {
  const [search,setSearch] = useState('')

  const { isPending, error, data } = useQuery({
    queryKey: [search, 'search'],
    queryFn: () =>
       fetch(`https://ws.geonorge.no/adresser/v1/sok?sok=${search}`).then((res) =>
        res.json(),
      ),
    enabled: !!search,
  })



  return (
    <>
      <Search
        backgroundColor="white"
        placeholder="Søk i Norgeskart"
        size="lg"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      ></Search>
      {isPending && <p>Laster...</p>}
      {error && <p>Det oppsto en feil: {error.message}</p>}
      {data && (
        <ul>
          {data.adresser.map((adresse: Adresser) => (
            <li key={adresse.adressekode}>{adresse.adressenavn}</li>
          ))}
        </ul>
      )}


    </>
  );
};
