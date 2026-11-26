import { Address, Property } from '../../types/searchTypes';
import { getAddresses } from '../searchApi';

const formatAddressPart = (value: string) =>
  value
    .toLocaleLowerCase('nb-NO')
    .replace(
      /(^|[\s-])([a-zæøå])/g,
      (_, separator: string, letter: string) =>
        `${separator}${letter.toLocaleUpperCase('nb-NO')}`,
    );

const normalizeAddress = (value: string) =>
  value.toLocaleLowerCase('nb-NO').trim();

export const getPostalAddress = (address?: Address) => {
  if (!address) {
    return undefined;
  }

  return `${address.postnummer} ${formatAddressPart(address.poststed)} - ${formatAddressPart(address.kommunenavn)}`;
};

export const findPropertyAddress = async (
  property: Property,
): Promise<Address | undefined> => {
  const addressQuery = property.VEGADRESSE?.[0];
  if (!addressQuery) {
    return undefined;
  }

  const response = await getAddresses(addressQuery);
  const municipalityAddresses = response.adresser.filter(
    (address) => address.kommunenummer === property.KOMMUNENR,
  );
  const exactAddress = municipalityAddresses.filter(
    (address) =>
      normalizeAddress(address.adressetekst) === normalizeAddress(addressQuery),
  );

  return (
    exactAddress.find(
      (address) =>
        address.gardsnummer.toString() === property.GARDSNR &&
        address.bruksnummer.toString() === property.BRUKSNR,
    ) ??
    exactAddress[0] ??
    municipalityAddresses.find(
      (address) =>
        address.gardsnummer.toString() === property.GARDSNR &&
        address.bruksnummer.toString() === property.BRUKSNR,
    )
  );
};
