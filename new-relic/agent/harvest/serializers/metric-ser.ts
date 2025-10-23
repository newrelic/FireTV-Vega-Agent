import { SerializableBuffer } from "../buffer";
import { NrMetric } from "../models/metric";

/** NrMetric buffer serielizer */
export class NrMetricBufferSerializer extends SerializableBuffer<NrMetric> {
    /** Build a New Relic Metric API model */
    serialize(): string {
        let metric_arr = this.map((item) => item.repr())
        let metric_obj = [{
            "common": {},
            "metrics": metric_arr
        }]
        return JSON.stringify(metric_obj)
    }
}