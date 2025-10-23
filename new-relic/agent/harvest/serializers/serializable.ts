/** Serializable object. Can be converted into a NR API compatible JSON */
export interface Serializable {
    /**
     * Convert model into NR API ready map representation.
     */
    repr(): Record<string, any>
}

/** Serializable array of serializable objects. */
export interface ArraySerializable {
    /**
     * Convert an array of serializable objects into a into NR API compatible JSON.
     */
    serialize(): string
}