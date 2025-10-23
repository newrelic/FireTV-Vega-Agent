import { SerializableBuffer } from "../buffer";
import { NrEvent } from "../models/event";

/** NrEvent buffer serielizer */
export class NrEventBufferSerializer extends SerializableBuffer<NrEvent> {
    /** Build a New Relic Event API model */
    serialize(): string {
        let event_arr = this.map((item) => item.repr())
        return JSON.stringify(event_arr)
    }
}