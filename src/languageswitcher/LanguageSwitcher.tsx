import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = event.target.value;
    i18n.changeLanguage(selectedLang);
  };

  return (
    <div>
      <label htmlFor="language-select" style={{ marginRight: '0.5rem' }}>
        Språk:
      </label>
      <select
        id="language-select"
        value={i18n.language}
        onChange={handleChange}
      >
        <option value="nb">Norsk (Bokmål)</option>
        <option value="nn">Nynorsk</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
