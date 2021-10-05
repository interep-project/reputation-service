export default function capitalize(s: string) {
    return s.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
}
