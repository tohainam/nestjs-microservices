import {
  Observable,
  TimeoutError,
  catchError,
  retry,
  throwError,
  timeout,
} from 'rxjs';

export function withGrpcResilience<T>(
  source$: Observable<T>,
  ms = 3000,
  retries = 2,
): Observable<T> {
  return source$.pipe(
    timeout(ms),
    retry({ count: retries, delay: 300 }),
    catchError((err: unknown) => {
      if (err instanceof TimeoutError) {
        return throwError(() => new Error('gRPC request timed out'));
      }
      const error = err instanceof Error ? err : new Error(String(err));
      return throwError(() => error);
    }),
  );
}
