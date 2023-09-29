import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication, version: string, service: string): void => {
  const configDocument = new DocumentBuilder()
    .setTitle(`${service} APIs`)
    .setDescription(`Swagger Representation APIs using in`)
    .setVersion(version)
    .addBearerAuth({
      type: `http`,
      scheme: `bearer`,
      bearerFormat: `JWT`,
      name: `authorization`,
      description: `Please enter refreshToken in following format: Bearer <JWT>`,
      in: `header`,
    })
    .build()
  const document = SwaggerModule.createDocument(app, configDocument)
  SwaggerModule.setup(`api/${version}/docs`, app, document, {
    swaggerOptions: {
      displayOperationId: true,
      displayRequestDuration: true,
    },
  })
}
