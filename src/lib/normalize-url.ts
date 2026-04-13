export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) throw new Error("URL is required");
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  // Validate it's actually parseable
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }
  return url;
}
