import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { context, trace } from '@opentelemetry/api'

declare global {
  interface Window {
    __OTEL_CLIENT_INIT__?: boolean
  }
}

function safeStringify(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function buildMessage(args: unknown[]): string {
  return args.map(safeStringify).join(' ')
}

function parseRegexList(raw: string | undefined): RegExp[] {
  if (!raw) return [/.*/]
  const list = raw.split(',').map((item) => item.trim()).filter(Boolean)
  if (list.length === 0) return [/.*/]
  return list.map((item) => {
    try {
      return new RegExp(item)
    } catch {
      return new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    }
  })
}

export function initClientTelemetry() {
  if (typeof window === 'undefined') return
  if (window.__OTEL_CLIENT_INIT__) return
  window.__OTEL_CLIENT_INIT__ = true

  const serviceName = process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'strukt-frontend'
  const traceEndpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces'
  const logEndpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || 'http://localhost:4318/v1/logs'
  const headerPattern = process.env.NEXT_PUBLIC_OTEL_TRACE_HEADER_URLS
  const propagateTraceHeaderCorsUrls = parseRegexList(headerPattern)

  const traceExporter = new OTLPTraceExporter({
    url: traceEndpoint,
  })

  const tracerProvider = new WebTracerProvider({
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
  })

  tracerProvider.register({
    contextManager: new ZoneContextManager(),
  })

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({ propagateTraceHeaderCorsUrls }),
      new XMLHttpRequestInstrumentation({ propagateTraceHeaderCorsUrls }),
      new UserInteractionInstrumentation({
        eventNames: ['click', 'input', 'submit'],
      }),
    ],
  })

  const logExporter = new OTLPLogExporter({
    url: logEndpoint,
  })

  const loggerProvider = new LoggerProvider()
  loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter))
  logs.setGlobalLoggerProvider(loggerProvider)

  const logger = logs.getLogger('frontend-console')
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }

  const emit = (severity: SeverityNumber, body: string, attributes: Record<string, unknown>) => {
    const span = trace.getSpan(context.active())
    logger.emit({
      severityNumber: severity,
      body,
      attributes: {
        ...attributes,
        'trace.id': span?.spanContext().traceId,
        'span.id': span?.spanContext().spanId,
      },
    })
  }

  console.log = (...args: unknown[]) => {
    emit(SeverityNumber.INFO, buildMessage(args), { 'log.source': 'console.log' })
    original.log(...args)
  }
  console.info = (...args: unknown[]) => {
    emit(SeverityNumber.INFO, buildMessage(args), { 'log.source': 'console.info' })
    original.info(...args)
  }
  console.warn = (...args: unknown[]) => {
    emit(SeverityNumber.WARN, buildMessage(args), { 'log.source': 'console.warn' })
    original.warn(...args)
  }
  console.error = (...args: unknown[]) => {
    emit(SeverityNumber.ERROR, buildMessage(args), { 'log.source': 'console.error' })
    original.error(...args)
  }
  console.debug = (...args: unknown[]) => {
    emit(SeverityNumber.DEBUG, buildMessage(args), { 'log.source': 'console.debug' })
    original.debug(...args)
  }

  window.addEventListener('error', (event) => {
    emit(SeverityNumber.ERROR, event.message || 'window.error', {
      'log.source': 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event.reason instanceof Error ? event.reason.stack : safeStringify(event.reason)) || 'unhandledrejection'
    emit(SeverityNumber.ERROR, reason, { 'log.source': 'window.unhandledrejection' })
  })
}
