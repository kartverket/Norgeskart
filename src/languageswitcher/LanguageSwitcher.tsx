import {
  Box,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  createListCollection,
} from '@kvib/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const languageOptions = [
    { value: 'nb', label: t('languageSelector.norwegianBokmaal') || 'Bokmål' },
    { value: 'nn', label: t('languageSelector.norwegianNynorsk') || 'Nynorsk' },
    { value: 'en', label: t('languageSelector.english') || 'English' },
  ];

  return (
    <Box width="150px">
      <SelectRoot
        collection={createListCollection({
          items: languageOptions.map((opt) => ({
            key: opt.value,
            ...opt,
          })),
        })}
      >
        <SelectLabel>
          {t('languageSelector.chooseLanguage') || 'Velg språk'}
        </SelectLabel>
        <SelectTrigger>
          <SelectValueText placeholder="Velg språk" />
        </SelectTrigger>
        <SelectContent>
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
  );
};

export default LanguageSwitcher;
