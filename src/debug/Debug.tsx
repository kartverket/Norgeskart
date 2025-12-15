/* eslint-disable */

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
import { DrawLayer } from './DrawLayer';
import { Layers } from './Layers';
import { Selected } from './Selected';

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
        position="absolute"
        width={500}
        backgroundColor="hotpink"
        bottom={20}
        left={20}
        zIndex={999999}
        style={{ cursor: 'move' }}
        // Draggable logic below
        ref={(boxRef) => {
          if (!boxRef) return;
          let isDragging = false;
          let startX = 0;
          let startY = 0;
          let origLeft = 0;
          let origBottom = 0;

          const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            // @ts-ignore
            origLeft = parseInt(boxRef.style.left, 10) || 20;
            // @ts-ignore
            origBottom = parseInt(boxRef.style.bottom, 10) || 20;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          };

          const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            // @ts-ignore
            boxRef.style.left = `${origLeft + dx}px`;
            // @ts-ignore
            boxRef.style.bottom = `${origBottom - dy}px`;
          };

          const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          // Only add once
          if (!(boxRef as any)._draggableAttached) {
            boxRef.addEventListener('mousedown', onMouseDown);
            (boxRef as any)._draggableAttached = true;
          }
        }}
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
            <TabsTrigger value="selected">Selected</TabsTrigger>
            <TabsTrigger value="drawLayer">Draw Layer</TabsTrigger>
            <TabsTrigger value="themeLayers">Theme Layers</TabsTrigger>
          </TabsList>
          <TabsContent value="actions">
            <Actions />
          </TabsContent>
          <TabsContent value="selected">
            <Selected />
          </TabsContent>
          <TabsContent value="drawLayer">
            <DrawLayer />
          </TabsContent>
          <TabsContent value="themeLayers">
            <Layers />
          </TabsContent>
        </Tabs>
      </Box>
    );
  }
};
