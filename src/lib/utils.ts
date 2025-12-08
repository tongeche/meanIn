export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function generateSlug() {
  const random = Math.random().toString(36).slice(2, 10);
  return random;
}

export function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || generateSlug();
}
