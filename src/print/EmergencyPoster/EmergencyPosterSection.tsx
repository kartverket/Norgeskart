import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { isPrintDialogOpenAtom } from '../atoms';
import { ClickWrapper } from './ClickWrapper';
import { Disclaimer } from './Disclaimer';

export const EmergencyPosterSection = () => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const setIsPrintDialogOpen = useSetAtom(isPrintDialogOpenAtom);
  if (!disclaimerAccepted) {
    return (
      <Disclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        onReject={() => setIsPrintDialogOpen(false)}
      />
    );
  }
  return <ClickWrapper />;
};
