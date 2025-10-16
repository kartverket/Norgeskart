import { Box, Flex, IconButton, Tooltip, toaster } from '@kvib/react';
import { useTranslation } from 'react-i18next';
import PrintWindow from './PrintWindow';

// const PrintWindow = () => {
//   const { t } = useTranslation();
//   return <div>{t('You just clicked.')}</div>;
// }
interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const ShareOrPrintMap = ({ isOpen, onToggle }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      {isOpen && <PrintWindow onClose={onToggle} />}
      <Box p={{ base: 0, md: 3 }} py={3}>
        <Flex>
          <Tooltip content={t('search.actions.shareMap.tooltip')}>
            <IconButton
              colorPalette="green"
              icon="share"
              size="md"
              variant="ghost"
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
            <IconButton
              colorPalette="green"
              icon="print"
              size="md"
              variant="ghost"
              onClick={onToggle}
            />
          </Tooltip>
        </Flex>
      </Box>
    </>
  );
};

export default ShareOrPrintMap;
