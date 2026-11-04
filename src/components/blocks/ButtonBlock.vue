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
            class="button-block"
            :style="buttonContainerStyle"
            @dblclick="startEditing"
        >
            <a
                :href="block.properties.url"
                :style="buttonStyle"
                class="button-block__link"
                v-html="block.properties.text"
            >
            </a>
        </div>

        <div v-else class="button-block" :style="buttonContainerStyle">
            <div class="button-editing-container" ref="editingContainer">
                <div ref="quillEditor" class="quill-editor"></div>
                <div class="editing-actions" data-builder-chrome>
                    <button @click.stop="$emit('delete', block.id)" class="btn-delete">
                        <Trash2 size="16" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import BlockActions from '../common/BlockActions.vue'
import { BASIC_TOOLBAR } from '../../utils/quill'
import { useInlineEditor } from '../../composables/useInlineEditor'

export default {
    name: 'ButtonBlock',
    components: {
        BlockActions,
        Trash2
    },
    props: {
        block: { type: Object, required: true },
        isSelected: { type: Boolean, default: false },
        index: { type: Number, required: true }
    },
    emits: ['select', 'update', 'delete', 'copy', 'move-up', 'move-down', 'drop'],
    setup(props, { emit }) {
        const editor = useInlineEditor(props, emit, {
            toolbar: BASIC_TOOLBAR,
            editorStyle: () => {
                const s = { ...buttonStyle.value }
                if (s.fontSize && !isNaN(parseInt(s.fontSize))) {
                    s.fontSize = `${parseInt(s.fontSize)}px`
                }
                return s
            }
        })
        const { localProps } = editor

        const buttonContainerStyle = computed(() => ({
            textAlign: props.block.properties.align,
            margin: `${props.block.properties.margin.top}px ${props.block.properties.margin.right}px ${props.block.properties.margin.bottom}px ${props.block.properties.margin.left}px`
        }))

        const buttonStyle = computed(() => {
            const p = localProps.value
            return {
                display: 'inline-block',
                backgroundColor: p.backgroundColor,
                color: p.textColor,
                fontSize: `${p.fontSize}px`,
                fontFamily: p.fontFamily,
                fontWeight: p.fontWeight,
                textDecoration: p.textDecoration,
                borderRadius: `${p.borderRadius}px`,
                padding: `${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px`,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                width: p.fullWidth ? '100%' : 'auto'
            }
        })

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            ...editor,
            buttonContainerStyle,
            buttonStyle,
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

.button-block {
    padding: 10px;
}

.button-block__link {
    text-decoration: none;
}

.button-editing-container {
    padding: 10px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quill-editor {
    min-height: 40px;
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
    justify-content: flex-end;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
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
