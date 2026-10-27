import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  IconButton,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
  useSelectContext,
} from '@kvib/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationButton } from '../layout/NavigationButton';

type LanguageSwitcherVariant = 'text' | 'icon';

const TextTrigger = ({ compact }: { compact: boolean }) => {
  const { t } = useTranslation();
  return (
    <SelectTrigger
      border="none"
      width={compact ? '84px' : 'auto'}
      px={compact ? 1 : undefined}
      backgroundColor="transparent"
      _hover={{ backgroundColor: 'transparent' }}
    >
      <SelectValueText
        fontSize={compact ? 'xs' : undefined}
        color={compact ? 'green.700' : undefined}
        placeholder={t('languageSelector.chooseLanguage')}
      />
    </SelectTrigger>
  );
};

const IconTrigger = () => {
  const select = useSelectContext();
  return (
    <IconButton
      icon={'language'}
      px="2"
      size="sm"
      w={'40px'}
      {...select.getTriggerProps()}
    />
  );
};

export const LanguageSwitcher = ({
  variant = 'text',
  compact = false,
  isMinimized = false,
}: {
  variant?: LanguageSwitcherVariant;
  compact?: boolean;
  isMinimized?: boolean;
}) => {
  const { i18n } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const languageOptions = compact
    ? [
        { value: 'nb', label: 'Bokmål' },
        { value: 'nn', label: 'Nynorsk' },
        { value: 'en', label: 'English' },
      ]
    : [
        { value: 'nb', label: 'Norsk (bokmål)' },
        { value: 'nn', label: 'Norsk (nynorsk)' },
        { value: 'en', label: 'English' },
      ];

  const currentLanguage = i18n.language;
  const languageOptionCollection = createListCollection({
    items: languageOptions.map((opt) => ({
      key: opt.value,
      ...opt,
    })),
  });

  if (compact) {
    return (
      <>
        <NavigationButton
          icon="language"
          label="Språk"
          isMinimized={isMinimized}
          onClick={() => setDialogOpen(true)}
        />
        <Dialog
          open={dialogOpen}
          onOpenChange={(event) => setDialogOpen(event.open)}
          size="sm"
        >
          <DialogContent
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            <DialogHeader>
              <DialogTitle>Språk</DialogTitle>
            </DialogHeader>
            <DialogBody>
              {languageOptions.map((language) => (
                <Button
                  key={language.value}
                  width="100%"
                  justifyContent="flex-start"
                  variant="ghost"
                  colorPalette="green"
                  backgroundColor={
                    currentLanguage === language.value
                      ? '#D0ECD6'
                      : 'transparent'
                  }
                  onClick={() => {
                    i18n.changeLanguage(language.value);
                    setDialogOpen(false);
                  }}
                >
                  {language.label}
                </Button>
              ))}
            </DialogBody>
            <DialogCloseTrigger />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Box position="relative">
        <SelectRoot
          collection={languageOptionCollection}
          value={[currentLanguage]}
          positioning={
            variant === 'text'
              ? undefined
              : {
                  sameWidth: false,
                }
          }
          width={variant === 'text' && !compact ? 'auto' : 'fit-content'}
        >
          {variant === 'text' ? (
            <TextTrigger compact={compact} />
          ) : (
            <IconTrigger />
          )}
          <SelectContent
            style={{ zIndex: 9999 }}
            width={variant === 'text' ? 'auto' : 'fit-content'}
          >
            {languageOptions.map((lang) => (
              <SelectItem
                key={lang.value}
                item={lang.value}
                onClick={() => i18n.changeLanguage(lang.value)}
              >
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>
    </>
  );
};

export default LanguageSwitcher;
