/**
 * Normalise the `variables` prop (an array or a dictionary of `{ name | label, format }`)
 * into a list of `{ name, format }`, dropping incomplete entries.
 */
export function normalizeVariables(variables) {
    const list = Array.isArray(variables) ? variables : Object.values(variables || {})

    return list
        .filter(v => v && (v.name || v.label) && v.format)
        .map(v => ({ name: v.name || v.label, format: v.format }))
}
