import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Quiz App API')
    .setDescription(
      'Dies ist die API-Beschreibung für die Quiz-App API. Sie Bestandteil der Projektabgabe im Fach Projekt: Web-Entwicklung',
    )
    .setVersion('1.0')
    .addTag('Beispiele')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('spec', app, document);
  app.enableCors();
  writeFileSync(join(__dirname, 'swagger.json'), JSON.stringify(document));
  await app.listen(3001);
}
bootstrap();
