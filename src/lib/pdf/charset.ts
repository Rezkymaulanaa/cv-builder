// The built-in PDF fonts only cover Windows-1252, the characters outside the
// Latin-1 range below being its extra punctuation and symbols.
const EXTRA_WINDOWS_1252 = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

function isSupported(char: string) {
  const code = char.codePointAt(0)!;
  return (
    code === 0x0a ||
    code === 0x0d ||
    code === 0x09 ||
    (code >= 0x20 && code <= 0x7e) ||
    (code >= 0xa0 && code <= 0xff) ||
    EXTRA_WINDOWS_1252.includes(char)
  );
}

function collectStrings(value: unknown, into: string[]) {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, into));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, into));
}

export function findUnsupportedChars(content: unknown): string[] {
  const strings: string[] = [];
  collectStrings(content, strings);
  const found = new Set<string>();
  for (const value of strings) {
    for (const char of value) {
      if (!isSupported(char)) found.add(char);
    }
  }
  return [...found];
}
