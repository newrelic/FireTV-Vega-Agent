import { NrSample } from "./models/sample"
import { ArraySerializable } from "./serializers/serializable"

/** Base class for serializable buffers */
export abstract class SerializableBuffer<T extends NrSample> extends Array<T> implements ArraySerializable {
    /** Abstract implementation of ArraySerializable interface */
    abstract serialize(): string
}

/** Sample buffer with reservoir sampling. */
export class NrBuffer<T extends NrSample> {
    private buffer: SerializableBuffer<T>
    private size: number
    private samplingIndex: number

    /**
     * Construct buffer with size.
     * 
     * @param size Buffer size.
     * @param serBuff Serializable buffer instance.
     */
    constructor(size: number, serBuff: SerializableBuffer<T>) {
        this.size = size
        this.buffer = serBuff
        this.samplingIndex = 0
    }

    /**
     * Put sample using Algorithm R (reservoir buffering).
     * 
     * @param sample New Relic sample instance.
     * @returns True if added, false otherwise.
     */
    put(sample: T): boolean {
        if (this.remaining() > 0) {
            // Fill the buffer
            this.buffer.push(sample)
            this.samplingIndex += 1
            return true
        } else {
            // Buffer is full, start random sampling
            let j = Math.floor(Math.random() * this.samplingIndex)
            this.samplingIndex += 1
            if (j < this.size) {
                this.buffer[j] = sample
                return true
            } else {
                return false
            }
        }
    }

    /**
     * Resample reservoir with a new (smaller) size. If new size is equal or greater to current, it does nothing.
     * @param size New size of buffer.
     */
    resample(size: number) {
        if (size < this.size) {
            this.size = size
            this.samplingIndex = 0
            let buff = []
            // Empty buffer
            while (this.buffer.length > 0) {
                let d = this.buffer.pop()
                if (d != undefined) {
                    buff.push(d)
                }
            }
            // Refill buffer
            while (buff.length > 0) {
                let d = buff.pop()
                // Just to make the typescript checker happy (result of pop() can be undefined)
                if (d != undefined) {
                    this.put(d)
                }
            }
        }
    }

    /**
     * Increment buffer size.
     * @param delta Buffer size delta.
     */
    incrementSize(delta: number) {
        this.size += delta
    }

    /**
     * Get remaining space in the buffer.
     * 
     * @returns Remaining space.
     */
    remaining(): number {
        return this.size - this.buffer.length
    }

    /**
     * Get reservoir size.
     * @returns Reservoir size.
     */
    getSize(): number {
        return this.size
    }

    /**
     * Get buffer length.
     * 
     * @returns Buffer length.
     */
    length(): number {
        return this.buffer.length
    }

    /**
     * Get buffer.
     * 
     * @returns Sample buffer.
     */
    getBuffer(): SerializableBuffer<T> {
        return this.buffer
    }

    /**
     * Serialize buffer into a New Relic API compatible JSON.
     * 
     * @returns JSON string.
     */
    buildNrApiModel(): string {
        let result = this.buffer.serialize()
        return result
    }

    /**
     * Clear the buffer. It doesn't create a new instance of the buffer, just clears the contents inplace.
     */
    clear() {
        this.buffer.length = 0
    }
}