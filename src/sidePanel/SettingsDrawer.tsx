import { Heading, SimpleGrid } from '@kvib/react';

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';

export const SettingsDrawer = () => {
  const { t } = useTranslation();
  return (
    <SimpleGrid columns={1} gap="6">
      <Heading size="md">{t('languageSelector.chooseLanguage')}</Heading>
      <LanguageSwitcher />
    </SimpleGrid>
  );
};
