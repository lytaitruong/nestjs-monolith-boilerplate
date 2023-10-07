import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

export const HEADERS = {
  USER_AGENT: 'user-agent',
  CONTENT_TYPE: 'content-type',
  CONTENT_ENCODING: 'content-encoding',
  CONTENT_DISPOSITION: 'content-disposition',
  AUTHORIZATION: 'authorization',
} as const

export const TTL: Record<'ONE_MINUTE' | 'ONE_HOUR' | 'ONE_DAY' | 'ONE_WEEK' | 'ONE_MONTH', number> = {
  ONE_MINUTE: 60,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
} as const

export const CORS = (origin: string[] | '*' = '*') =>
  ({
    origin,
    methods: ['HEAD', 'GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: [HEADERS.CONTENT_DISPOSITION],
    allowedHeaders: [HEADERS.CONTENT_TYPE, HEADERS.CONTENT_ENCODING, HEADERS.AUTHORIZATION],
  }) as CorsOptions
