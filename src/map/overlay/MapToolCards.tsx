import { Box, Card, CardBody, CardHeader } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { DrawSettings } from '../../settings/draw/DrawSettings';
import { MapSettings } from '../../settings/map/MapSettings';
import { MapTool } from './MapOverlay';

export const MapToolCards = ({
  currentMapTool,
}: {
  currentMapTool: MapTool;
}) => {
  const { t } = useTranslation();
  if (currentMapTool === 'draw') {
    return (
      <MapToolCard label={t('draw.tabHeading')}>
        <DrawSettings />
      </MapToolCard>
    );
  }
  if (currentMapTool === 'layers') {
    return (
      <MapToolCard label={t('mapLayers.label')}>
        <MapSettings />
      </MapToolCard>
    );
  }
};

interface MapToolCardProps {
  label: string;
  children: React.ReactNode | React.ReactNode[] | undefined;
}
const MapToolCard = ({ label, children }: MapToolCardProps) => {
  return (
    <Box
      mt={5}
      width="350px"
      boxShadow="lg"
      borderRadius="md"
      position={'absolute'}
      right={0}
    >
      <Card>
        <CardHeader fontWeight="bold">{label}</CardHeader>
        <CardBody>{children}</CardBody>
      </Card>
    </Box>
  );
};
