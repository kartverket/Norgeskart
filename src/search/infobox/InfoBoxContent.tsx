import {
	AccordionRoot,
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
} from '@kvib/react';
import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	isRettIKartetDialogOpenAtom,
	rettIKartetCoordinatesAtom,
} from '../../map/menu/dialogs/atoms';
import { searchCoordinatesAtom, selectedResultAtom } from '../atoms';
import { InfoboxAccordionContent } from './InfoboxAccordionContent';
import { InfoBoxPreamble } from './InfoBoxPreamble';

interface InfoBoxContentProps {
	showMinimizeButton?: boolean;
	showReportButton?: boolean;
	showCloseButton?: boolean;
}

export const InfoBoxContent = ({
	showMinimizeButton = false,
	showReportButton = true,
	showCloseButton = true,
}: InfoBoxContentProps) => {
	const [selectedResult, setSelectedResult] = useAtom(selectedResultAtom);
	const setClickedCoordinate = useSetAtom(searchCoordinatesAtom);
	const { t } = useTranslation();
	const setRettIKartetDialogOpen = useSetAtom(isRettIKartetDialogOpenAtom);
	const setRettIKartetCoordinates = useSetAtom(rettIKartetCoordinatesAtom);
	const [isMinimized, setIsMinimized] = useState(false);

	const onClose = useCallback(() => {
		setSelectedResult(null);
		setClickedCoordinate(null);
	}, [setSelectedResult, setClickedCoordinate]);

	if (selectedResult === null) {
		return null;
	}

	const showHeading =
		selectedResult.type !== 'Coordinate' && selectedResult.name && !isMinimized;

	return (
		<>
			<Flex justifyContent="flex-end" alignItems="center" gap={1}>
				{showMinimizeButton && (
					<Button
						onClick={() => setIsMinimized((prev) => !prev)}
						variant="ghost"
						leftIcon={
							isMinimized ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
						}
						size="sm"
						p={1}
					>
						{isMinimized ? t('infoBox.showContent') : t('infoBox.hideContent')}
					</Button>
				)}
				{showCloseButton && (
					<IconButton
						onClick={onClose}
						icon="close"
						colorPalette="red"
						size="sm"
						variant="ghost"
						alignSelf="flex-end"
					/>
				)}
			</Flex>
			{showHeading && (
				<Heading fontWeight="bold" size="lg">
					{selectedResult.name}
				</Heading>
			)}
			<Box
				overflowY={showCloseButton ? 'auto' : 'visible'}
				overflowX={showCloseButton ? 'auto' : 'visible'}
				display={isMinimized ? 'none' : 'block'}
			>
				<InfoBoxPreamble result={selectedResult} />
			</Box>
			<Box display={isMinimized ? 'none' : 'block'}>
				<AccordionRoot
					key={`${selectedResult.type}-${selectedResult.lon}-${selectedResult.lat}`}
					collapsible
					multiple
					defaultValue={['propertyInfo']}
				>
					<InfoboxAccordionContent />
				</AccordionRoot>
			</Box>
			{showReportButton && (
				<Button
					display={isMinimized ? 'none ' : 'flex'}
					variant="plain"
					size="sm"
					onClick={() => {
						setRettIKartetCoordinates([selectedResult.lon, selectedResult.lat]);
						setRettIKartetDialogOpen(true);
					}}
				>
					{t('toolbar.reportError.label')}
				</Button>
			)}
		</>
	);
};
