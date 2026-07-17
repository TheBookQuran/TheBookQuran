export function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/gi, ($1) =>
    $1.toUpperCase().replace("-", "").replace("_", "")
  );
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function camelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelizeKeys(v));
  } else if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    const n: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      n[snakeToCamel(k)] = camelizeKeys(v);
    }
    return n;
  }
  return obj;
}

export function decamelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => decamelizeKeys(v));
  } else if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    const n: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      n[camelToSnake(k)] = decamelizeKeys(v);
    }
    return n;
  }
  return obj;
}
