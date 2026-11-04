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

        <div
            v-if="!isEditing"
            class="paragraph-block"
            :style="combinedStyle"
            @dblclick="startEditing"
            v-html="block.properties.text"
        >
        </div>

        <div v-else class="paragraph-block-editing" :style="layoutStyle" ref="editingContainer">
            <div ref="quillEditor" class="quill-editor"></div>
            <div class="editing-actions" data-builder-chrome>
                <div class="toolbar__vars" v-if="variablesList.length">
                    <select v-model="selectedVarIdx" class="toolbar-select small">
                        <option v-for="(v, i) in variablesList" :key="i" :value="i">{{ v.name }}</option>
                    </select>
                    <button @click="insertSelectedVariable" title="Insert variable" class="btn-var">+</button>
                </div>
                <button @click.stop="$emit('delete', block.id)" class="btn-delete">
                    <Trash2 size="16" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import BlockActions from '../common/BlockActions.vue'
import { useInlineEditor } from '../../composables/useInlineEditor'

/** Text styles for a heading/paragraph's properties (used for the canvas and the inline editor). */
function textStyle(p) {
    return {
        fontSize: `${p.fontSize}px`,
        fontFamily: p.fontFamily,
        fontWeight: p.fontWeight,
        fontStyle: p.fontStyle || 'normal',
        textDecoration: p.textDecoration || 'none',
        color: p.color,
        lineHeight: p.lineHeight,
        letterSpacing: `${p.letterSpacing}px`,
        textAlign: p.align
    }
}

export default {
    name: 'ParagraphBlock',
    components: { BlockActions, Trash2 },
    props: {
        block: { type: Object, required: true },
        isSelected: { type: Boolean, default: false },
        index: { type: Number, required: true },
        variables: { type: [Array, Object], default: () => ([]) }
    },
    emits: ['select', 'update', 'delete', 'copy', 'move-up', 'move-down', 'drop'],
    setup(props, { emit }) {
        const editor = useInlineEditor(props, emit, {
            editorStyle: () => textStyle(editor.localProps.value)
        })

        const layoutStyle = computed(() => ({
            margin: `${props.block.properties.margin.top}px ${props.block.properties.margin.right}px ${props.block.properties.margin.bottom}px ${props.block.properties.margin.left}px`,
            padding: `${props.block.properties.padding.top}px ${props.block.properties.padding.right}px ${props.block.properties.padding.bottom}px ${props.block.properties.padding.left}px`
        }))

        const paragraphStyle = computed(() => textStyle(props.block.properties))

        const combinedStyle = computed(() => ({
            ...layoutStyle.value,
            ...paragraphStyle.value
        }))

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            ...editor,
            layoutStyle,
            paragraphStyle,
            combinedStyle,
            handleDrop
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

.paragraph-block {
    padding: 10px;
    cursor: text;
    word-wrap: break-word;
    margin: 0;
}

.paragraph-block-editing {
    padding: 10px;
    background: white;
}

.quill-editor {
    min-height: 100px;
    margin-bottom: 10px;
}

/* Fix for Quill inline sizes in toolbar */
:deep(.ql-snow .ql-picker.ql-size .ql-picker-label::before),
:deep(.ql-snow .ql-picker.ql-size .ql-picker-item::before) {
    content: attr(data-value) !important;
}

:deep(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value]::before) {
    content: attr(data-value) !important;
}

.editing-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
}

.toolbar-select,
.toolbar-input,
.toolbar-color {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    font-size: 12px;
}

.toolbar__vars {
    display: flex;
    gap: 4px;
}

.btn-var {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
}

.btn-delete {
    background: #ef4444;
    color: white;
    border: 1px solid #ef4444;
    border-radius: 3px;
    padding: 4px 8px;
    cursor: pointer;
}
</style>
