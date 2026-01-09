import {
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    createListCollection,
    RadioGroup,
    Stack,
    Radio,
    Box,
    Text,
    Button,
    HStack
} from '@kvib/react';
import { useAtom } from 'jotai';
import { printFormatAtom, printOrientationAtom } from './atoms';

export const PrintExtentTab = () => {
    const [format, setFormat] = useAtom(printFormatAtom);
    const [orientation, setOrientation] = useAtom(printOrientationAtom);
    const formatOptions = [
        { value: 'A4', label: 'A4' },
        { value: 'A3', label: 'A3' },
    ];

    return (
        <>
            <SelectRoot
                collection={createListCollection({ items: formatOptions })}
                value={[format]}
                width="180px"
                onValueChange={(details) => {
                    if (details.value.length > 0) {
                        setFormat(details.value[0] as 'A4' | 'A3');
                    }
                }}
            >
                <SelectLabel>Velg format</SelectLabel>
                <SelectTrigger>
                    <SelectValueText />
                </SelectTrigger>
                <SelectContent>
                    {formatOptions.map((format) => (
                        <SelectItem
                            key={format.value}
                            item={format.value}
                        >
                            {format.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </SelectRoot>
            <Box mt={4} mb={6}>
                <RadioGroup
                    value={orientation}
                    onValueChange={details => {
                        if (details.value !== null) {
                            setOrientation(details.value as "portrait" | "landscape");
                        }
                    }}
                >
                    <Stack gap={4}>
                        <Radio value="portrait">Stående</Radio>
                        <Radio value="landscape">Liggende</Radio>
                    </Stack>
                </RadioGroup>
            </Box>
            <Text mt={4}>Plasser det oransje feltet i området du vil skrive ut</Text>
            <HStack mt={4}>
                <Button>Hent kartet</Button>
                <Button variant="outline">Avbryt</Button>
            </HStack>
        </>

    );
};
