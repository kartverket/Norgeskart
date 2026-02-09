import { SimpleGrid } from '@kvib/react';

import LanguageSwitcher from '../languageswitcher/LanguageSwitcher';

export const SettingsDrawer = () => {
  return (
    <SimpleGrid columns={1} gap="6">
      <LanguageSwitcher />
    </SimpleGrid>
  );
};
