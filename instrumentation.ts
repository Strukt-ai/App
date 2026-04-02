import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { registerOTel, OTLPHttpJsonTraceExporter } from '@vercel/otel'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)

export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME || 'strukt-frontend',
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: process.env.SIGNOZ_INGESTION_KEY
        ? { 'signoz-ingestion-key': process.env.SIGNOZ_INGESTION_KEY }
        : undefined,
    }),
  })
}
