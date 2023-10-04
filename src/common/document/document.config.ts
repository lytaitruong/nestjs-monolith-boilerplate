import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { FastifyRequest, HookHandlerDoneFunction, RawReplyDefaultExpression } from 'fastify'

export interface ISwaggerSecurity {
  enable: boolean
  name: string
  pass: string
}
export const setupSwagger = (app: INestApplication, version: string, service: string, security: ISwaggerSecurity) => {
  const configDocument = new DocumentBuilder()
    .setTitle(`${service} APIs`)
    .setVersion(version)
    .setDescription(
      `Restful APIs\t
      Following [Richardson Maturity Model Level 3](https://martinfowler.com/articles/richardsonMaturityModel.html)\t
    `,
    )
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

  if (security.enable) {
    const adapter = app.getHttpAdapter()
    adapter.use(
      `/api/v1/docs`,
      (req: FastifyRequest, res: RawReplyDefaultExpression, next: HookHandlerDoneFunction) => {
        if (!req.headers.authorization) return unauthorizedResponse(res, next)

        const credentials = parseAuth(req.headers.authorization)

        if (credentials?.name !== security.name || credentials?.pass !== security.pass) {
          return unauthorizedResponse(res, next)
        }

        next()
      },
    )
  }

  SwaggerModule.setup(`api/${version}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,
      withCredentials: true,
    },
  })
}

const parseAuth = (input: string): Omit<ISwaggerSecurity, 'enable'> => {
  const [, encodedPart] = input.split(' ')

  const text = Buffer.from(encodedPart, 'base64').toString('ascii')
  const [name, pass] = text.split(':')

  return { name, pass }
}

const unauthorizedResponse = (res: RawReplyDefaultExpression, next: HookHandlerDoneFunction): void => {
  res.statusCode = 401
  res.setHeader('WWW-Authenticate', 'Basic')

  next()
}
