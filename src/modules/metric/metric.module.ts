import { Module } from '@nestjs/common'
import { PrometheusModule } from '@willsoto/nestjs-prometheus'

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        app: 'Nest Monolith',
      },
    }),
  ],
})
export class MetricModule {}
