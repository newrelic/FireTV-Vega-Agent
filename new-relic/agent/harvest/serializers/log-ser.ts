import { SerializableBuffer } from "../buffer";
import { NrLog } from "../models/log";

/** NrLog buffer serielizer */
export class NrLogBufferSerializer extends SerializableBuffer<NrLog> {
    /** Build a New Relic Log API model */
    serialize(): string {
        let log_arr = this.map((item) => item.repr())
        let logs_obj = [{
            "common": {},
            "logs": log_arr
        }]
        return JSON.stringify(logs_obj)
    }
}