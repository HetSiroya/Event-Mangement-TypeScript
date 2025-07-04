export function checkRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): string | null {
  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null) {
      return `Field '${String(field)}' is required.`;
    }

    if (typeof obj[field] === "string" && obj[field].trim() === "") {
      return `Field '${String(field)}' cannot be empty.`;
    }
  }
  return null;
}
