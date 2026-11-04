import RowBlock from '../components/blocks/RowBlock.vue'
import RowProperties from '../components/properties/RowProperties.vue'
import { CONTENT_BLOCKS, CONTENT_BLOCK_TYPES } from './contentBlocks'
import { createBlockId } from '../utils/blockId'

export { CONTENT_BLOCKS, CONTENT_BLOCK_TYPES, createBlockId }

export const ROW_BLOCK = {
    type: 'row',
    component: RowBlock,
    properties: RowProperties,
    defaults: () => ({
        backgroundColor: 'transparent',
        padding: { top: 10, right: 0, bottom: 10, left: 0 }
    })
}

/** Column layouts offered in the Blocks tab. */
export const LAYOUT_PRESETS = [
    { type: 'row', label: '1 Column', columns: [{ width: 100 }] },
    { type: 'row', label: '2 Columns 50/50', columns: [{ width: 50 }, { width: 50 }] },
    { type: 'row', label: '3 Columns 33/33/33', columns: [{ width: 33.33 }, { width: 33.33 }, { width: 33.34 }] },
    { type: 'row', label: '4 Columns 25/25/25/25', columns: [{ width: 25 }, { width: 25 }, { width: 25 }, { width: 25 }] },
    { type: 'row', label: '2 Columns 33/67', columns: [{ width: 33.33 }, { width: 66.67 }] },
    { type: 'row', label: '2 Columns 67/33', columns: [{ width: 66.67 }, { width: 33.33 }] },
    { type: 'row', label: '4 Columns 17/33/17/33', columns: [{ width: 17 }, { width: 33 }, { width: 17 }, { width: 33 }] },
    { type: 'row', label: '4 Columns 33/17/33/17', columns: [{ width: 33 }, { width: 17 }, { width: 33 }, { width: 17 }] }
]

/** Every block type, keyed by `type`. */
export const BLOCK_TYPES = { ...CONTENT_BLOCK_TYPES, row: ROW_BLOCK }

/**
 * Create a new block from a sidebar item: a content block definition (`{ type }`) or a layout
 * preset (`{ type: 'row', columns: [{ width }] }`).
 */
export function createBlock(template) {
    const definition = BLOCK_TYPES[template.type]
    const id = createBlockId()
    const properties = definition ? definition.defaults() : {}

    // key order matches the JSON the builder has always produced
    if (template.type === 'row') {
        const columns = template.columns.map(column => ({ width: column.width, blocks: [] }))
        return { id, type: 'row', columns, properties }
    }

    return { id, type: template.type, properties }
}
