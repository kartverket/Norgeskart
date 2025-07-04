import { Link } from '@kvib/react';

const PrivacyPolicy = () => {
  return (
    <Link
      colorPalette="green"
      external
      target="_blank"
      rel="noopener noreferrer"
      href="https://www.kartverket.no/en/about-kartverket"
      size="md"
      variant="underline"
      p={3}
    >
      Personvernerklæring
    </Link>
  );
};

export default PrivacyPolicy;
