/** Unique id for a new or copied block. */
export function createBlockId() {
    return Date.now() + Math.random()
}
