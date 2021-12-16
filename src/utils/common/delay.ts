export default function delay(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration))
}
