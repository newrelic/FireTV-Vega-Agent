import { NrSample, NrSampleType } from "./sample"

/** New Relic log model */
export class NrLog implements NrSample {
    private message: string
    private attributes: Record<string, any>
    private timestamp: number
    
    /**
     * Construct NrLog from message and optional attributes.
     * 
     * @param message Log message.
     * @param attributes (optional) Log attributes.
     */
    constructor(message: string, attributes?: Record<string, any>) {
        this.timestamp = new Date().getTime()
        this.message = message
        if (attributes) {
            this.attributes = attributes
        } else {
            this.attributes = {}
        }
    }

    /**
     * Get message.
     * 
     * @returns Message.
     */
    getMessage(): string {
        return this.message
    }

    /**
     * Get attributes.
     * 
     * @returns Log attributes.
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
        return NrSampleType.Log
    }
    
    /**
     * Generates the NR model representation of this sample.
     * 
     * @returns Log model representation.
     */
    repr(): Record<string, any> {
        return {
            "message": this.message,
            "timestamp": this.timestamp,
            "attributes": this.attributes
        }
    }
}