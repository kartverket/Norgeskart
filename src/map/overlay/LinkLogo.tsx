import { Image, Link } from '@kvib/react';

export const LinkLogo: React.FC = () => {
  return (
    <Link
      pointerEvents={'auto'}
      href="https://www.kartverket.no"
      target="_blank"
      rel="noopener noreferrer"
      outline="none"
    >
      <Image src="/logos/KV_logo_staa.svg" alt="Logo" style={{ height: 64 }} />
    </Link>
  );
};
