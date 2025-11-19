export const addGA = () => {
  removeGA();
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.src = '/ga.js';
  script.async = true;
  document.head.appendChild(script);
};

export const removeGA = () => {
  document.getElementById('ga-script')?.remove();
};
