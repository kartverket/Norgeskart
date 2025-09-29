export function getArrayFromLocalStorage<T>(key: string): T[] {
  const item = localStorage.getItem(key);
  if (!item) return [];
  try {
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function appendToArrayInLocalStorage<T>(key: string, value: T): void {
  const currentArray = getArrayFromLocalStorage<T>(key);
  currentArray.push(value);
  localStorage.setItem(key, JSON.stringify(currentArray));
}
