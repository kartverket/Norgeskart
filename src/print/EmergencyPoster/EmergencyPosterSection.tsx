import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { isPrintDialogOpenAtom } from '../atoms';
import { Disclaimer } from './Disclaimer';
import { InputForm } from './InputForm';

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
  return <InputForm />;
};
