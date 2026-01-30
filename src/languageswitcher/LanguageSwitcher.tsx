import {
  IconButton,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
  useSelectContext,
} from '@kvib/react';
import { useTranslation } from 'react-i18next';

type LanguageSwitcherVariant = 'text' | 'icon';

const TextTrigger = () => {
  const { t } = useTranslation();
  return (
    <SelectTrigger>
      <SelectValueText placeholder={t('languageSelector.chooseLanguage')} />
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
}: {
  variant?: LanguageSwitcherVariant;
}) => {
  const { i18n } = useTranslation();

  const languageOptions = [
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

  return (
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
      width={variant === 'text' ? 'auto' : 'fit-content'}
    >
      {variant === 'text' ? <TextTrigger /> : <IconTrigger />}
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
  );
};

export default LanguageSwitcher;
