<template>
    <div
        class="block-wrapper"
        :class="{ 'block-wrapper--selected': isSelected }"
        @click.stop="$emit('select')"
        @drop.stop="handleDrop"
        @dragover.prevent
    >
        <BlockActions
            :is-selected="isSelected"
            @copy="$emit('copy', block.id)"
            @move-up="$emit('move-up', block.id)"
            @move-down="$emit('move-down', block.id)"
            @delete="$emit('delete', block.id)"
        />

        <div class="row-block" :style="rowStyle">
            <div
                v-for="(column, columnIndex) in block.columns"
                :key="columnIndex"
                class="row-block__column"
                :style="getColumnStyle(column)"
                @drop.stop="handleColumnDrop($event, columnIndex)"
                @dragover.prevent
            >
                <div v-if="column.blocks.length === 0" class="column__placeholder">
                    Drop content here
                </div>

                <component
                    v-for="(childBlock, childIndex) in column.blocks"
                    :key="childBlock.id"
                    :is="getBlockComponent(childBlock.type)"
                    :block="childBlock"
                    :index="childIndex"
                    :is-selected="selectedBlockId === childBlock.id"
                    @select="$emit('child-select', childBlock)"
                    @update="handleChildUpdate"
                    @delete="handleChildDelete"
                    @copy="handleChildCopy"
                    @move-up="handleChildMoveUp"
                    @move-down="handleChildMoveDown"
                    @drop="handleNestedDrop($event, columnIndex, childIndex)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import ButtonBlock from './ButtonBlock.vue'
import DividerBlock from './DividerBlock.vue'
import HeadingBlock from './HeadingBlock.vue'
import ParagraphBlock from './ParagraphBlock.vue'
import ImageBlock from './ImageBlock.vue'
import VideoBlock from './VideoBlock.vue'
import SocialBlock from './SocialBlock.vue'
import TableBlock from './TableBlock.vue'
import BlockActions from "../common/BlockActions.vue";

export default {
    name: 'RowBlock',
    components: {
        BlockActions,
        ButtonBlock,
        DividerBlock,
        HeadingBlock,
        ParagraphBlock,
        ImageBlock,
        VideoBlock,
        SocialBlock,
        TableBlock
    },
    props: {
        block: { type: Object, required: true },
        isSelected: { type: Boolean, default: false },
        index: { type: Number, required: true },
        selectedBlockId: { type: [Number, String], default: null }
    },
    emits: ['select', 'child-select', 'update', 'delete', 'copy', 'move-up', 'move-down', 'drop', 'column-drop'],
    setup(props, { emit }) {
        const rowStyle = computed(() => ({
            display: 'flex',
            backgroundColor: props.block.properties.backgroundColor,
            padding: `${props.block.properties.padding.top}px ${props.block.properties.padding.right}px ${props.block.properties.padding.bottom}px ${props.block.properties.padding.left}px`
        }))

        const getColumnStyle = (column) => {
            return {
                width: `${column.width}%`,
                minHeight: '100px',
                border: '2px dashed #d1d5db',
                padding: '10px',
                backgroundColor: 'rgba(249, 250, 251, 0.5)',
                transition: 'all 0.2s'
            }
        }

        const getBlockComponent = (type) => {
            const components = {
                button: 'ButtonBlock',
                divider: 'DividerBlock',
                heading: 'HeadingBlock',
                paragraph: 'ParagraphBlock',
                image: 'ImageBlock',
                video: 'VideoBlock',
                social: 'SocialBlock',
                table: 'TableBlock'
            }
            return components[type] || 'div'
        }

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        const handleColumnDrop = (event, columnIndex) => {
            event.stopPropagation()
            const dragData = event.dataTransfer.getData('block-dropped')
            if (dragData) {
                emit('column-drop', {
                    blockId: props.block.id,
                    columnIndex,
                    insertIndex: null
                })
            }
        }

        const handleNestedDrop = (event, columnIndex, insertIndex) => {
            event.stopPropagation()
            emit('column-drop', {
                blockId: props.block.id,
                columnIndex,
                insertIndex
            })
        }

        const handleChildUpdate = (childId, properties) => {
            const updatedBlock = { ...props.block }
            for (const column of updatedBlock.columns) {
                const childBlock = column.blocks.find(b => b.id === childId)
                if (childBlock) {
                    childBlock.properties = { ...childBlock.properties, ...properties }
                    emit('update', props.block.id, updatedBlock)
                    break
                }
            }
        }

        const handleChildDelete = (childId) => {
            const updatedBlock = { ...props.block }
            for (const column of updatedBlock.columns) {
                const index = column.blocks.findIndex(b => b.id === childId)
                if (index !== -1) {
                    column.blocks.splice(index, 1)
                    emit('update', props.block.id, updatedBlock)
                    break
                }
            }
        }

        const handleChildCopy = (childId) => {
            const updatedBlock = { ...props.block }
            for (const column of updatedBlock.columns) {
                const index = column.blocks.findIndex(b => b.id === childId)
                if (index !== -1) {
                    const copied = JSON.parse(JSON.stringify(column.blocks[index]))
                    copied.id = Date.now() + Math.random()
                    column.blocks.splice(index + 1, 0, copied)
                    emit('update', props.block.id, updatedBlock)
                    break
                }
            }
        }

        const handleChildMoveUp = (childId) => {
            const updatedBlock = { ...props.block }
            for (const column of updatedBlock.columns) {
                const index = column.blocks.findIndex(b => b.id === childId)
                if (index > 0) {
                    const temp = column.blocks[index]
                    column.blocks[index] = column.blocks[index - 1]
                    column.blocks[index - 1] = temp
                    emit('update', props.block.id, updatedBlock)
                    break
                }
            }
        }

        const handleChildMoveDown = (childId) => {
            const updatedBlock = { ...props.block }
            for (const column of updatedBlock.columns) {
                const index = column.blocks.findIndex(b => b.id === childId)
                if (index < column.blocks.length - 1) {
                    const temp = column.blocks[index]
                    column.blocks[index] = column.blocks[index + 1]
                    column.blocks[index + 1] = temp
                    emit('update', props.block.id, updatedBlock)
                    break
                }
            }
        }

        return {
            rowStyle,
            getColumnStyle,
            getBlockComponent,
            handleDrop,
            handleColumnDrop,
            handleNestedDrop,
            handleChildUpdate,
            handleChildDelete,
            handleChildCopy,
            handleChildMoveUp,
            handleChildMoveDown,
        }
    }
}
</script>

<style scoped>
.block-wrapper {
    position: relative;
    padding: 4px;
    margin: 2px 0;
    transition: all 0.2s;
}

.block-wrapper--selected {
    outline: 2px solid #2f4574;
    outline-offset: 2px;
}

.block-wrapper:hover {
    background: rgba(59, 130, 246, 0.05);
}

.row-block {
    min-height: 50px;
}

.row-block__column {
    position: relative;
    box-sizing: border-box;
}

.row-block__column:hover {
    border-color: #2f4574;
}

.column__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 80px;
    color: #9ca3af;
    font-size: 14px;
    text-align: center;
}
</style>
