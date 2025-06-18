import { Card, CardBody } from '@kvib/react';
import { SearchResult } from '../../types/searchTypes';
interface InfoBoxProps {
  result: SearchResult;
}

export const InfoBox = ({ result }: InfoBoxProps) => {
  console.log('Infobox:', result);
  return (
    <Card>
      <CardBody>{result.name}</CardBody>
    </Card>
  );
};
