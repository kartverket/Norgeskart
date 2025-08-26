import { Box, Flex, IconButton } from '@kvib/react';
import { useState } from 'react';
import { getEnvName } from '../env';

export const Debug = () => {
  const hideDebug = localStorage.getItem('hideDebug') === 'true';
  const [_showStuff, setShowStuff] = useState(true);
  if (hideDebug) {
    return null;
  }
  const envName = getEnvName();
  if (envName !== 'local') {
    console.log('sike', envName);
    return null;
  } else {
    return (
      <Box
        position={'absolute'}
        width={200}
        height={100}
        backgroundColor="hotpink"
        bottom={20}
        left={20}
        zIndex={999999}
      >
        <Flex justifyContent="flex-end">
          <IconButton
            variant="ghost"
            icon="close"
            onClick={() => {
              localStorage.setItem('hideDebug', 'true');
              setShowStuff(false);
            }}
          />
        </Flex>
        Debuginfo
      </Box>
    );
  }
};
