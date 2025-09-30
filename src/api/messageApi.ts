//Replace with api if that ever works
const baseMessageUrl =
  'https://raw.githubusercontent.com/kartverket/nk3config/refs/heads/master/messages/';

export const getMessage = async (
  env: string,
  languageCode: string,
): Promise<string | null> => {
  const response = await fetch(`${baseMessageUrl}${env}.${languageCode}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    console.error('Error fetching message:', response.statusText);
    return null;
  }
  const message = await response.text();
  return message;
};
