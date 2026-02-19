import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino Logger
  app.useLogger(app.get(Logger));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Project Manager API')
    .setDescription(
      'NexusFlow Automation Engine & Project Management API Documentation',
    )
    .setVersion('1.0')
    .addTag('projects', 'Project lifecycle management')
    .addTag('stories', 'User stories and task hierarchy')
    .addTag('workflows', 'Automation rules and triggers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application listening on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
