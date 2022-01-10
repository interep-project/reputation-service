/**
 * Returns a delayer promise.
 * @param duration The delay duration.
 * @returns The delayer promise.
 */
export default function delay(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration))
}
