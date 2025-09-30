import {
  Box,
  Center,
  Checkbox,
  Flex,
  IconButton,
  Text,
  VStack,
} from '@kvib/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMessage } from '../api/messageApi';
import { getEnvName } from '../env';
import { useIsMobileScreen } from '../shared/hooks';
import { getArrayFromLocalStorage } from '../shared/utils/localStorage';
import { createHash } from '../shared/utils/stringUtils';

export const MessageBox = () => {
  const [showMessageBox, setShowMessageBox] = useState(true);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const envName = getEnvName();
  const { data, error, isLoading } = useQuery({
    queryKey: ['message', envName, currentLanguage],
    queryFn: () => getMessage(envName, currentLanguage),
  });

  const isMobile = useIsMobileScreen();
  const textboxWidth = isMobile ? '90vw' : '400px';

  if (!showMessageBox || isLoading || error || !data) {
    return null;
  }
  const dataHash = createHash(data);
  const hiddenMessages = getArrayFromLocalStorage<number>('hiddenMessages');
  if (hiddenMessages.includes(dataHash)) {
    return null;
  }

  return (
    <Box position={'absolute'} width={'100vw'}>
      <Center>
        <Flex
          zIndex={'overlay'}
          backgroundColor={'white'}
          p={2}
          borderRadius={8}
        >
          <VStack>
            <Text
              maxW={textboxWidth}
              whiteSpace="pre-line"
              wordBreak={'break-word'}
              p={2}
            >
              {data}
            </Text>
            <Checkbox
              checked={doNotShowAgain}
              onCheckedChange={(e) => {
                setDoNotShowAgain(e.checked.valueOf() as boolean);
              }}
            >
              Ikke vis denne igjen
            </Checkbox>
          </VStack>
          <IconButton
            icon={'close'}
            onClick={() => {
              if (doNotShowAgain) {
                hiddenMessages.push(dataHash);
                localStorage.setItem(
                  'hiddenMessages',
                  JSON.stringify(hiddenMessages),
                );
              }
              setShowMessageBox(false);
            }}
          />
        </Flex>
      </Center>
    </Box>
  );
};
