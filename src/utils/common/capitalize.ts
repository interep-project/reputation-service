/**
 * Capitalizes a string.
 * @param string The string to capitalize.
 * @returns The capitalized string.
 */
export default function capitalize(string: string) {
    return string.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
}
