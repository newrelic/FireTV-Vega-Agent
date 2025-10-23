import { Serializable } from "../serializers/serializable";

/** Sample type */
export enum NrSampleType {
    /** Event */
    Event,
    /** Metric */
    Metric,
    /** Log */
    Log,
    /** Trace */
    Trace
}

/** New Relic sample, interface for all models (events, metrics, logs and traces). */
export interface NrSample extends Serializable {
    /**
     * Get sample timestamp.
     * 
     * @returns Timestamp.
     */
    getTimestamp(): number;

    /**
     * Set sample timestamp.
     * 
     * @param timestamp Timestamp.
     */
    setTimestamp(timestamp: number): void;

    /**
     * Get sample type.
     * 
     * @returns Type.
     */
    getType(): NrSampleType;
}
