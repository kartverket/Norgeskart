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

  const currentLanguage = (i18n.language || 'nb').split('-')[0];

  const collection = createListCollection({
    items: languageOptions.map((opt) => ({ key: opt.value, ...opt })),
  });

  return (
    <SelectRoot
      collection={collection}
      value={[currentLanguage]}
      onValueChange={(details) => {
        const next = details.value?.[0];
        if (next) i18n.changeLanguage(next);
      }}
    >
      <Heading size="md">{t('languageSelector.chooseLanguage')}</Heading>

      <SelectTrigger>
        <SelectValueText placeholder={t('languageSelector.chooseLanguage')} />
      </SelectTrigger>

      <SelectContent style={{ zIndex: 9999 }}>
        {collection.items.map((item) => (
          <SelectItem key={item.key} item={item}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default LanguageSwitcher;
