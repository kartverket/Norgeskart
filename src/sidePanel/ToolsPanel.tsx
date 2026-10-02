import { Button, Icon, Text, VStack } from '@kvib/react';
import { useSetAtom } from 'jotai';
import { measureTypeAtom } from '../measure/atoms';
import { mapToolAtom } from '../map/overlay/atoms';

export const ToolsPanel = () => {
	const setMapTool = useSetAtom(mapToolAtom);
	const setMeasureType = useSetAtom(measureTypeAtom);

	const handleMeasure = () => {
		setMapTool('measure');
		setMeasureType('length');
	};

	return (
		<VStack alignItems="stretch" gap={2}>
			<Text fontWeight="bold">Verktøy</Text>
			<Button
				variant="ghost"
				justifyContent="flex-start"
				gap={2}
				onClick={handleMeasure}
			>
				<Icon icon="straighten" />
				<Text>Måle</Text>
			</Button>
			<Button
				variant="ghost"
				justifyContent="flex-start"
				gap={2}
				onClick={() => setMapTool('print')}
			>
				<Icon icon="edit_document" />
				<Text>Skriv ut</Text>
			</Button>
			<Button variant="ghost" justifyContent="flex-start" gap={2}>
				<Icon icon="elevation" />
				<Text>Tegn høydeprofil</Text>
			</Button>
		</VStack>
	);
};
