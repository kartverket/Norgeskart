export const downloadStringAsFile = (
  fileContent: string,
  fileName: string,
  type: string,
) => {
  const blob = new Blob([fileContent], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
