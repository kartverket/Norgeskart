import { useAtom } from 'jotai';
import { LineStyle, lineStyleAtom } from '../settings/draw/atoms';
import { Box, Heading, HStack, Text, VStack, Button } from '@kvib/react';

export const LineStyleControl = () => {
    const [lineStyle, setLineStyle] = useAtom(lineStyleAtom)

    return (
        <VStack align="stretch">
            <Heading size={{ base: 'xs', md: 'sm' }}>Linjetype</Heading>
            <HStack>
                <Button size="xs" variant="outline" onClick={() => setLineStyle('solid')}>____</Button>
                <Button size="xs" variant="outline" onClick={() => setLineStyle('dashed')}>_ _ _</Button>
                <Button size="xs" variant="outline" onClick={() => setLineStyle('dotted')}>. . . . . </Button>
            </HStack>
        </VStack>

    )
}