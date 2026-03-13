import { Box, Heading, VStack } from '@kvib/react';
import { Feature } from 'ol';
import { useTranslation } from 'react-i18next';
import { countFeatureTypes } from './utls';

export const ImportContentDetails = ({
  features,
}: {
  features: Feature[] | null;
}) => {
  const { t } = useTranslation();
  if (!features) {
    return null;
  }

  const details = countFeatureTypes(features);

  return (
    <Box>
      <Heading size={'md'}>{t('importDialog.body.details.heading')}</Heading>
      <VStack alignItems={'flex-start'} gap={1}>
        {Object.keys(details).map((k) => {
          return (
            <Box>
              {t('shared.geometry.types.' + k.toLowerCase())}: {details[k]}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};
