import { Box, HStack, Stack, Text } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import { DEKNINGSSTATUS_ENTRIES } from '../layers/dekningsstatusColors';

export const DekningsstatusLegend = () => {
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      {DEKNINGSSTATUS_ENTRIES.map(({ key, color }) => (
        <HStack key={key} gap={2} alignItems="center">
          <Box
            w={4}
            h={4}
            bg={color}
            borderRadius="sm"
            flexShrink={0}
            border="1px solid"
            borderColor="gray.300"
          />
          <Text fontSize="sm">{t(`legend.dekningsstatus.${key}`)}</Text>
        </HStack>
      ))}
    </Stack>
  );
};
