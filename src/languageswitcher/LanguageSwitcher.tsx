import {
  Heading,
  SelectContent,
  SelectItem,
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
    <SelectRoot collection={languageOptionCollection} value={[currentLanguage]}>
      <Heading size="md">{t('languageSelector.chooseLanguage')}</Heading>
      <SelectTrigger>
        <SelectValueText placeholder={t('languageSelector.chooseLanguage')} />
      </SelectTrigger>
      <SelectContent style={{ zIndex: 9999 }}>
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
