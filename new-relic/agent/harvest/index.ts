import { NrEvent } from "./models/event"
import { NrLog } from "./models/log"
import { NrCountMetric, NrGaugeMetric, NrMetric, NrSummaryMetric } from "./models/metric"
import { NrEventBufferSerializer } from './serializers/event-ser'
import { NrLogBufferSerializer } from './serializers/log-ser'
import { NrMetricBufferSerializer } from './serializers/metric-ser'
import { NrHarvestWorker, NrEndpoint } from "./worker"
import {
    DEFAULT_HARVEST_TIME, DEFAULT_BUFFER_SIZE,
    MIN_HARVEST_TIME, MAX_HARVEST_TIME
} from './constants'
import { KeplerProperties } from '../kepler/properties'
import { ValidVal } from '../types'

/** Data recording and harvesting system */
export class NrHarvest {
    private eventWorker: NrHarvestWorker<NrEvent>
    private logWorker: NrHarvestWorker<NrLog>
    private metricWorker: NrHarvestWorker<NrMetric>
    private customAttributes: Record<string, ValidVal>

    constructor(apiKey: string, accountId: string, endpoint: NrEndpoint) {
        this.customAttributes = {}

        this.eventWorker = new NrHarvestWorker(
            apiKey,
            accountId,
            endpoint,
            DEFAULT_HARVEST_TIME,
            DEFAULT_BUFFER_SIZE,
            new NrEventBufferSerializer(),
            (endpoint, accountId) => {
                if (endpoint == NrEndpoint.US) {
                    return `https://insights-collector.newrelic.com/v1/accounts/${accountId}/events`
                } else {
                    return `https://insights-collector.eu01.nr-data.net/v1/accounts/${accountId}/events`
                }
            }
        )

        this.logWorker = new NrHarvestWorker(
            apiKey,
            null,
            endpoint,
            DEFAULT_HARVEST_TIME,
            DEFAULT_BUFFER_SIZE,
            new NrLogBufferSerializer(),
            (endpoint, _) => {
                if (endpoint == NrEndpoint.US) {
                    return "https://log-api.newrelic.com/log/v1"
                } else {
                    return "https://log-api.eu.newrelic.com/log/v1"
                }
            }
        )

        this.metricWorker = new NrHarvestWorker(
            apiKey,
            null,
            endpoint,
            DEFAULT_HARVEST_TIME,
            DEFAULT_BUFFER_SIZE,
            new NrMetricBufferSerializer(),
            (endpoint, _) => {
                if (endpoint == NrEndpoint.US) {
                    return "https://metric-api.newrelic.com/metric/v1"
                } else {
                    return "https://metric-api.eu.newrelic.com/metric/v1"
                }
            }
        )
    }

    /**
     * Set harvest time. Restarts the timer.
     * 
     * @param seconds Harvest time in seconds.
     * @returns Changed or not.
     */
    setHarvestTime(seconds: number): boolean {
        if (seconds >= MIN_HARVEST_TIME && seconds <= MAX_HARVEST_TIME) {
            this.eventWorker.setHarvestTime(seconds)
            this.logWorker.setHarvestTime(seconds)
            this.metricWorker.setHarvestTime(seconds)
            return true
        } else {
            return false
        }
    }

    /**
     * Harvest immediately. Also resets the harvest timer.
     */
    harvestNow() {
        this.eventWorker.harvestNow()
        this.logWorker.harvestNow()
        this.metricWorker.harvestNow()
    }

    /**
     * Record event.
     * 
     * @param eventType New Relic event type.
     * @param attributes (optional) Event attributes.
     * @returns True if added, false otherwise.
     */
    recordEvent(eventType: string, attributes?: Record<string, any>): boolean {
        let attr = this.generateAttributes(attributes)
        let event = new NrEvent(eventType, attr)
        return this.eventWorker.buffer.put(event)
    }

    /**
     * Record log.
     * 
     * @param message Log message.
     * @param attributes (optional) Log attributes.
     * @returns True if added, false otherwise.
     */
    recordLog(message: string, attributes?: Record<string, any>): boolean {
        let attr = this.generateAttributes(attributes)
        let log = new NrLog(message, attr)
        return this.logWorker.buffer.put(log)
    }

    /**
     * Record gauge metric.
     * 
     * @param name Metric name.
     * @param value Metric value.
     * @param attributes (optional) Metric attributes.
     * @returns True if added, false otherwise.
     */
    recordGaugeMetric(name: string, value: number, attributes?: Record<string, any>): boolean {
        let attr = this.generateAttributes(attributes)
        let metric = new NrGaugeMetric(name, value, attr)
        return this.metricWorker.buffer.put(metric)
    }

    /**
     * Record count metric.
     * 
     * @param name Metric name.
     * @param value Metric value.
     * @param interval Metric interval.
     * @param attributes (optional) Metric attributes.
     * @returns True if added, false otherwise.
     */
    recordCountMetric(name: string, value: number, interval: number, attributes?: Record<string, any>): boolean {
        let attr = this.generateAttributes(attributes)
        let metric = new NrCountMetric(name, value, interval, attr)
        return this.metricWorker.buffer.put(metric)
    }

    /**
     * Record summary metric.
     * 
     * @param name Metric name.
     * @param count Metric count.
     * @param max Metric max.
     * @param min Metric min.
     * @param sum Metric sum.
     * @param interval Metric interval.
     * @param attributes (optional) Metric attributes.
     * @returns True if added, false otherwise.
     */
    recordSummaryMetric(name: string, count: number, max: number, min: number, sum: number, interval: number, attributes?: Record<string, any>) {
        let attrs = this.generateAttributes(attributes)
        let metric = new NrSummaryMetric(name, count, max, min, sum, interval, attrs)
        return this.metricWorker.buffer.put(metric)
    }

    /**
     * Set attribute. If already exists, overwrites it and returns previous value.
     * 
     * @param name Attribute name.
     * @param value Attribute value.
     */
    setAttribute(name: string, value: ValidVal): ValidVal | undefined {
        if (name in this.customAttributes) {
            let prev_val = this.customAttributes[name]
            this.customAttributes[name] = value
            return prev_val
        } else {
            this.customAttributes[name] = value
            return undefined
        }
    }

    /**
     * Remove attribute. If exists, returns previous value.
     * 
     * @param name Attribute name.
     */
    removeAttribute(name: string): ValidVal | undefined {
        if (name in this.customAttributes) {
            let prev_val = this.customAttributes[name]
            delete this.customAttributes[name]
            return prev_val
        } else {
            return undefined
        }
    }

    /**
     * Remove custom attributes.
     */
    removeAllAttributes() {
        this.customAttributes = {}
    }

    /**
     * Append custom attributes to the set of sample attributes.
     * 
     * @param attr Set of attributes.
     */
    private appendCustomAttributes(attr: Record<string, any>) {
        for (const key of Object.keys(this.customAttributes)) {
            attr[key] = this.customAttributes[key]
        }
    }

    /**
     * Generate the set of attributes for events, logs and metrics.
     * @param attributes Base attributes.
     * @returns Full set of attributes.
     */
    private generateAttributes(attributes?: Record<string, any>): Record<string, any> {
        let attr: {[index: string]:any} = {}
        if (attributes != undefined) {
            attr = attributes
        }
        this.appendCustomAttributes(attr)
        attr = {
            ...KeplerProperties.build(),
            ...attr
        }
        return attr
    }
}