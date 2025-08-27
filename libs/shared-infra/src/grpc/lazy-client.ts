import type { ClientGrpc } from '@nestjs/microservices';

export function getOrInitGrpcService<T extends object>(
  current: T | undefined,
  client: ClientGrpc,
  serviceName: string,
  assign: (service: T) => void,
): T {
  if (!current) {
    const service = client.getService<T>(serviceName);
    assign(service);
    return service;
  }
  return current;
}
