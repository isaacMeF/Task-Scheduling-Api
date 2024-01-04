import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  const config = new DocumentBuilder()
  .setTitle('Task Scheduling API')
  .setDescription('Created by Isaac Mejia F to learn task scheduling with NestJS')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http' }, 'user')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Task Scheduling API',
    customCss: fs.readFileSync('src/customSwagger/css/swagger-dark-theme.css', 'utf8'),
  });


  await app.listen(process.env.PORT);
}
bootstrap();
