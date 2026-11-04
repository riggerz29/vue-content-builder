import { describe, expect, it } from 'vitest'
import { BLOCK_TYPES, CONTENT_BLOCKS, LAYOUT_PRESETS, createBlock } from './index'
import { CONTENT_BLOCK_TYPES } from './contentBlocks'

describe('block registry', () => {
    it('defines a canvas component, properties panel and defaults for every type', () => {
        expect(Object.keys(BLOCK_TYPES)).toEqual([...CONTENT_BLOCKS.map(b => b.type), 'row'])

        for (const definition of Object.values(BLOCK_TYPES)) {
            expect(definition.component, definition.type).toBeTruthy()
            expect(definition.properties, definition.type).toBeTruthy()
            expect(typeof definition.defaults, definition.type).toBe('function')
        }
    })

    it('gives content blocks a sidebar label and icon, and keeps rows out of columns', () => {
        for (const block of CONTENT_BLOCKS) {
            expect(block.label).toBeTruthy()
            expect(block.icon).toBeTruthy()
        }
        expect(CONTENT_BLOCK_TYPES.row).toBeUndefined()
    })

    it('creates blocks with fresh, unshared default properties', () => {
        const a = createBlock({ type: 'social' })
        const b = createBlock({ type: 'social' })

        expect(a.id).not.toBe(b.id)
        expect(a.properties).toEqual(b.properties)
        a.properties.icons.push({ platform: 'github', url: '#' })
        a.properties.margin.top = 99
        expect(b.properties.icons).toHaveLength(4)
        expect(createBlock({ type: 'social' }).properties.margin.top).toBe(10)
    })

    it('creates rows from layout presets with empty columns', () => {
        const preset = LAYOUT_PRESETS.find(p => p.label === '2 Columns 33/67')
        const row = createBlock(preset)

        expect(Object.keys(row)).toEqual(['id', 'type', 'columns', 'properties'])
        expect(row.columns).toEqual([{ width: 33.33, blocks: [] }, { width: 66.67, blocks: [] }])
        expect(row.properties).toEqual({ backgroundColor: 'transparent', padding: { top: 10, right: 0, bottom: 10, left: 0 } })
        expect(row.columns[0]).not.toBe(preset.columns[0])
    })

    it('has unique labels for layout presets', () => {
        const labels = LAYOUT_PRESETS.map(p => p.label)
        expect(new Set(labels).size).toBe(labels.length)
    })
})
