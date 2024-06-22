export function mapToObject<K extends string, V>(
    map: Map<K, V>,
): Record<K, unknown> {
    const obj = {} as Record<K, unknown>;
    for (const [key, value] of map) {
        obj[key] =
            value instanceof Map ? mapToObject(value as Map<K, V>) : value;
    }
    return obj;
}
