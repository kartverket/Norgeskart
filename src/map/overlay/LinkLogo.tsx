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
      <Image
        src="/logos/KV_logo_staa_color.svg"
        alt="Logo"
        height={{ base: '42px', md: '64px' }}
      />
    </Link>
  );
};
