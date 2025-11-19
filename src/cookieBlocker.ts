// cookieBlocker.ts
let allowCookies = false;

const originalDescriptor =
  Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
  Object.getOwnPropertyDescriptor(document, 'cookie'); // fallback

// Read remains allowed, write is blocked while !allowCookies
Object.defineProperty(document, 'cookie', {
  configurable: true,
  get() {
    return originalDescriptor?.get ? originalDescriptor.get.call(document) : '';
  },
  set(value: string) {
    if (allowCookies) {
      originalDescriptor?.set?.call(document, value);
    }
  },
});

export function enableCookies() {
  allowCookies = true;
}

export function disableCookies() {
  allowCookies = false;
}
