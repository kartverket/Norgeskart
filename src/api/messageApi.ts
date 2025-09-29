//Replace with api if that ever works
const baseMessageUrl =
  'https://raw.githubusercontent.com/kartverket/nk3config/refs/heads/master/messages/';

export const getMessage = async (): Promise<string | null> => {
  const domain = 'test.no'; //document.location.hostname;
  const response = await fetch(`${baseMessageUrl}${domain}`);
  if (response.status === 404) {
    //console.warn('No message found for domain', domain);
    return null;
  }
  if (!response.ok) {
    console.error('Error fetching message:', response.statusText);
    return null;
  }
  const message = await response.text();
  return message;
};
