export default function groupBy(array: any[], parameter: string, values: any[]): [any, any[]][] {
    const map = new Map<any, any[]>()

    for (const element of array) {
        if (values.includes(element[parameter])) {
            map.set(element[parameter], [...(map.get(element[parameter]) || []), element])
        }
    }

    return Array.from(map.entries())
}
