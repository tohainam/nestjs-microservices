import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

interface RequestWithUser {
  user?: {
    userId: string;
  };
}

interface ResponseWithData {
  data?: unknown;
}

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<string>('PORT');

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Biz FSEAI API Gateway')
    .setDescription('API Gateway for the Biz FSEAI Microservices')
    .setVersion('1.0.0')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Health', 'Service health monitoring endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for @ApiBearerAuth() decorator
    )
    .addServer(`http://localhost:${port}`, 'Local Development')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    deepScanRoutes: true,
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });

  if (document.paths) {
    const pathsWithPrefix: Record<string, any> = {};
    Object.keys(document.paths).forEach((path) => {
      const newPath = `/v1${path}`;
      pathsWithPrefix[newPath] = document.paths[path];
    });
    document.paths = pathsWithPrefix;
  }

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
      requestInterceptor: (req: RequestWithUser): RequestWithUser => {
        // Add any custom request interceptor logic here
        return req;
      },
      responseInterceptor: (res: ResponseWithData): ResponseWithData => {
        // Add any custom response interceptor logic here
        return res;
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.1em; }
      .swagger-ui .scheme-container { margin: 20px 0; }
      .swagger-ui .auth-wrapper { margin: 20px 0; }
    `,
    customSiteTitle: 'Authentication API Documentation',
    customfavIcon: '/favicon.ico',
  });

  // Global prefix for all routes
  app.setGlobalPrefix('v1');

  await app.listen(port);

  console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger documentation available at: http://localhost:${port}/docs`,
  );
  console.log(
    `🔍 Health check available at: http://localhost:${port}/v1/health`,
  );
}
void bootstrap();
