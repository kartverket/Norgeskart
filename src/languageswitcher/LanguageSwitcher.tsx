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
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const languageOptions = [
    { value: 'nb', label: t('languageSelector.norwegianBokmaal') },
    { value: 'nn', label: t('languageSelector.norwegianNynorsk') },
    { value: 'en', label: t('languageSelector.english') },
  ];

  const currentLanguage = i18n.language;
  const languageOptionCollection = createListCollection({
    items: languageOptions.map((opt) => ({
      key: opt.value,
      ...opt,
    })),
  });

  return (
    <Box p={{ base: 0, md: 3 }} py={3}>
      <SelectRoot
        collection={languageOptionCollection}
        value={[currentLanguage]}
      >
        <SelectLabel>{t('languageSelector.chooseLanguage')}</SelectLabel>
        <SelectTrigger>
          <SelectValueText placeholder={t('languageSelector.chooseLanguage')} />
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
