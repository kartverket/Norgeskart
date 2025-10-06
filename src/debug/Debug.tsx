import {
  Box,
  Flex,
  IconButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@kvib/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { getEnvName } from '../env';
import { drawActionsAtom } from '../settings/draw/drawActions/atoms';
import { Actions } from './Actions';

export const Debug = () => {
  const hideDebug = localStorage.getItem('hideDebug') === 'true';
  const initialTab = localStorage.getItem('openDebugTab') || 'actions';
  const [_, setShowStuff] = useState(true);
  const drawActions = useAtomValue(drawActionsAtom);
  if (hideDebug) {
    return null;
  }
  const envName = getEnvName();
  if (envName !== 'local') {
    return null;
  } else {
    return (
      <Box
        position={'absolute'}
        width={500}
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
        <Tabs
          defaultValue={initialTab}
          onValueChange={(val) => {
            localStorage.setItem('openDebugTab', val.value);
          }}
        >
          <TabsList>
            <TabsTrigger value="actions">
              Draw Actions [{drawActions.length}]
            </TabsTrigger>
          </TabsList>
          <TabsContent value="actions">
            <Actions />
          </TabsContent>
        </Tabs>
      </Box>
    );
  }
};
