import {
  Box,
  Flex,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kvib/react';
import { useState } from 'react';
import { getEnvName } from '../env';
import { useDrawActions } from '../settings/draw/drawActions/drawActionsHooks';

export const Debug = () => {
  const hideDebug = localStorage.getItem('hideDebug') === 'true';
  const [_showStuff, setShowStuff] = useState(true);
  const { drawActions } = useDrawActions();
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
        <Tabs>
          <TabsList>
            <TabsTrigger value="actions">Draw Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="actions">
            {drawActions.map((action, index) => (
              <Box key={index}>
                {action.featureId} - {action.type}
              </Box>
            ))}
          </TabsContent>
        </Tabs>
        Debuginfo
      </Box>
    );
  }
};
