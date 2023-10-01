import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication, version: string, service: string): void => {
  const configDocument = new DocumentBuilder()
    .setTitle(`${service} APIs`)
    .setDescription(
      `Restful APIs\t
      Following [Richardson Maturity Model Level 3](https://martinfowler.com/articles/richardsonMaturityModel.html)\t
    `,
    )
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
      persistAuthorization: true,
      displayOperationId: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,
    },
  })
}
