import { IconButton, Tooltip, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';

const ShareOrPrintMap = () => {
  const { t } = useTranslation();
  return (
    <>
      <Tooltip content={t('search.actions.shareMap.tooltip')}>
        <IconButton
          colorPalette="green"
          icon="share"
          size="md"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
              toaster.create({
                title: t('search.actions.shareMap.success'),
                duration: 2000,
              });
            });
          }}
        />
      </Tooltip>
      <Tooltip content={t('search.actions.print')}>
        <IconButton colorPalette="green" icon="print" size="md" />
      </Tooltip>
    </>
  );
};

export default ShareOrPrintMap;
