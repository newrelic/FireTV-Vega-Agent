import { NrSample, NrSampleType } from "./sample"

/** New Relic metric model base class */
export abstract class NrMetric implements NrSample {
    protected metricName: string
    protected attributes: Record<string, any>
    protected timestamp: number

    /**
     * Construct NrMetric.
     * 
     * @param name Metric name.
     * @param attributes (optional) Metric attributes.
     */
    constructor(name: string, attributes?: Record<string, any>) {
        this.timestamp = new Date().getTime()
        this.metricName = name
        if (attributes) {
            this.attributes = attributes
        } else {
            this.attributes = {}
        }
    }

    /**
     * Get metric name.
     * 
     * @returns Metric name.
     */
    getName(): string {
        return this.metricName
    }

    /**
     * Get attributes.
     * 
     * @returns Event attributes.
     */
    getAttributes(): Record<string, any> {
        return this.attributes
    }

    /**
     * Set attribute.
     * 
     * @param key Attribute key.
     * @param val Attribute value.
     */
    setAttribute(key: string, val: any) {
        this.attributes[key] = val
    }

    // ---- NrSample interface implementation ----

    /**
     * Get sample timestamp.
     * 
     * @returns Timestamp.
     */
    getTimestamp(): number {
        return this.timestamp
    }

    /**
     * Set sample timestamp.
     * 
     * @param timestamp Timestamp.
     */
    setTimestamp(timestamp: number) {
        this.timestamp = timestamp
    }

    /**
     * Get sample type.
     * 
     * @returns Type.
     */
    getType(): NrSampleType {
        return NrSampleType.Metric
    }

    /**
     * Generates the NR model representation of this sample.
     * 
     * @returns Metric model representation.
     */
    abstract repr(): Record<string, any>
}

/** New Relic gauge metric model */
export class NrGaugeMetric extends NrMetric {
    private metricValue: number

    /**
     * Construct gage metric.
     * 
     * @param name Metric name.
     * @param value Metric value.
     * @param attributes (optional) Metric attributes.
     */
    constructor(name: string, value: number, attributes?: Record<string, any>) {
        super(name, attributes)
        this.metricValue = value
    }

    /**
     * Get metric value.
     * 
     * @returns Metric value.
     */
    getValue(): number {
        return this.metricValue
    }

    /**
     * Generates the NR model representation of this sample.
     * 
     * @returns Metric model representation.
     */
    repr(): Record<string, any> {
        return {
            "name": this.metricName,
            "type": "gauge",
            "value": this.metricValue,
            "timestamp": this.timestamp,
            "attributes": this.attributes
        }
    }
}

/** New Relic count metric model */
export class NrCountMetric extends NrMetric {
    private metricValue: number
    private metricInterval: number

    /**
     * Construct count metric.
     * 
     * @param name Metric name.
     * @param value Metric value.
     * @param interval Metric interval.
     */
    constructor(name: string, value: number, interval: number, attributes?: Record<string, any>) {
        super(name, attributes)
        this.metricValue = value
        this.metricInterval = interval
    }

    /**
     * Get metric value.
     * 
     * @returns Metric value.
     */
    getValue(): number {
        return this.metricValue
    }

    /**
     * Get metric interval.
     * 
     * @returns Metric interval.
     */
    getInterval(): number {
        return this.metricInterval
    }

    /**
     * Generates the NR model representation of this sample.
     * 
     * @returns Metric model representation.
     */
    repr(): Record<string, any> {
        return {
            "name": this.metricName,
            "type": "count",
            "value": this.metricValue,
            "interval.ms": this.metricInterval,
            "timestamp": this.timestamp,
            "attributes": this.attributes
        }
    }
}

/** New Relic summary metric model */
export class NrSummaryMetric extends NrMetric {
    private metricCount: number
    private metricMax: number
    private metricMin: number
    private metricSum: number
    private metricInterval: number

    /**
     * Construct summary metric.
     * 
     * @param name Metric name.
     * @param count Metric count.
     * @param max Metric max.
     * @param min Metric min.
     * @param sum Metric sum.
     * @param interval Metric interval.
     * @param attributes (optional) Metric attributes.
     */
    constructor(name: string, count: number, max: number, min: number, sum: number, interval: number, attributes?: Record<string, any>) {
        super(name, attributes)
        this.metricCount = count
        this.metricMax = max
        this.metricMin = min
        this.metricSum = sum
        this.metricInterval = interval
    }

    /**
     * Get metric count.
     * 
     * @returns Metric count.
     */
    getCount(): number {
        return this.metricCount
    }

    /**
     * Get metric max.
     * 
     * @returns Metric max.
     */
    getMax(): number {
        return this.metricMax
    }

    /**
     * Get metric min.
     * 
     * @returns Metric min.
     */
    getMin(): number {
        return this.metricMin
    }

    /**
     * Get metric sum.
     * 
     * @returns Metric sum.
     */
    getSum(): number {
        return this.metricSum
    }

    /**
     * Get metric interval.
     * 
     * @returns Metric interval.
     */
    getInterval(): number {
        return this.metricInterval
    }

    /**
     * Generates the NR model representation of this sample.
     * 
     * @returns Metric model representation.
     */
    repr(): Record<string, any> {
        return {
            "name": this.metricName,
            "type": "summary",
            "value": {
                "count": this.metricCount,
                "sum": this.metricSum,
                "min": this.metricMin,
                "max": this.metricMax,
            },
            "interval.ms": this.metricInterval,
            "timestamp": this.timestamp,
            "attributes": this.attributes
        }
    }
}
