import { NrSample, NrSampleType } from "./sample"

/** New Relic event model */
export class NrEvent implements NrSample {
    private eventType: string
    private attributes: Record<string, any>
    private timestamp: number
    
    /**
     * Construct NrEvent from event type and optional attributes.
     * 
     * @param eventType Event type.
     * @param attributes (optional) Event attributes.
     */
    constructor(eventType: string, attributes?: Record<string, any>) {
        this.timestamp = new Date().getTime()
        this.eventType = eventType
        if (attributes) {
            this.attributes = attributes
        } else {
            this.attributes = {}
        }
    }

    /**
     * Get event type.
     * 
     * @returns Event type.
     */
    getEventType(): string {
        return this.eventType
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
        return NrSampleType.Event
    }

    /**
     * Generates the NR model representation of this sample.
     * 
     * @returns Event model representation.
     */
    repr(): Record<string, any> {
        // NOTE: this.attributes is modified to avoid deep-copying the dictionary.
        let attr = this.attributes
        attr["eventType"] = this.eventType
        attr["timestamp"] = this.timestamp
        return attr
    }
}