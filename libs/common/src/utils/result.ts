export type Result<T, E = string[]> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function resultOk<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function resultErr<E = string[]>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok === true;
}

export function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return r.ok === false;
}
