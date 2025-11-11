interface PdfStatusResponse {
  status: string;
  downloadURL?: string;
}

const BASE_API_URL = "https://ws.geonorge.no";

export const requestPdfGeneration = async (payload: any): Promise<{ statusURL: string }> => {
  const response = await fetch(`${BASE_API_URL}/print/kv/report.pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  return await response.json();
};


export const pollPdfStatus = async (
  statusURL: string,
  maxAttempts = 10,
  interval = 2000,
  baseURL = BASE_API_URL
): Promise<string | null> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseURL}/${statusURL}`);
      if (!response.ok) throw new Error(`Polling failed: ${response.status} ${response.statusText}`);

      const data: PdfStatusResponse = await response.json();

      if (data.status === "finished" && data.downloadURL) {
        // Return the full download URL instead of opening window here
        return `${baseURL}/${data.downloadURL}`;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  console.warn("Polling exceeded maximum attempts");
  return null;
};
