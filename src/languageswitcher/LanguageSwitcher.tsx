import { Box } from '@kvib/react'; // Kan også bruke <div> hvis du ønsker helt native
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'nb' | 'nn' | 'en';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    if (i18n.language.startsWith('nn')) return 'nn';
    if (i18n.language.startsWith('en')) return 'en';
    return 'nb';
  });

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  return (
    <Box width="200px">
      <label
        htmlFor="language-select"
        style={{ display: 'block', marginBottom: '0.5rem' }}
      >
        {t('chooseLanguage') || 'Velg språk'}
      </label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value as Language)}
        style={{
          width: '100%',
          padding: '0.5rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      >
        <option value="nb">{t('norwegianBokmaal')}</option>
        <option value="nn">{t('norwegianNynorsk')}</option>
        <option value="en">{t('english')}</option>
      </select>
    </Box>
  );
};

export default LanguageSwitcher;
