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
                <div class="editing-actions">
                    <button @click.stop="$emit('delete', block.id)" class="btn-delete">
                        <Trash2 size="16" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, nextTick, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import BlockActions from "../common/BlockActions.vue";
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// Configure Quill to use inline styles for alignment
const AlignStyle = Quill.import('attributors/style/align')
Quill.register(AlignStyle, true)

// Configure Quill to use inline styles for font size
const SizeStyle = Quill.import('attributors/style/size')
SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '32px', '36px', '48px', '64px', '72px', '96px']
Quill.register(SizeStyle, true)

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
        const isEditing = ref(false)
        const quillEditor = ref(null)
        let quill = null
        const editingContainer = ref(null)
        const localProps = ref({ ...props.block.properties })

        const initQuill = () => {
            if (!quillEditor.value) return

            quill = new Quill(quillEditor.value, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'color': [] }, { 'background': [] }],
                        ['clean']
                    ]
                }
            })

            quill.root.innerHTML = localProps.value.text

            // Apply button styles to the editor root
            const s = { ...buttonStyle.value }
            if (s.fontSize && !isNaN(parseInt(s.fontSize))) {
                s.fontSize = `${parseInt(s.fontSize)}px`
            }
            Object.assign(quill.root.style, s)

            quill.on('text-change', () => {
                localProps.value.text = quill.root.innerHTML
            })

            quill.focus()

            const handleGlobalClick = (e) => {
                if (editingContainer.value && !editingContainer.value.contains(e.target)) {
                    finishEditing()
                    document.removeEventListener('mousedown', handleGlobalClick)
                }
            }
            document.addEventListener('mousedown', handleGlobalClick)
        }

        watch(isEditing, (newVal) => {
            if (newVal) {
                nextTick(() => {
                    initQuill()
                })
            }
        })

        const buttonContainerStyle = computed(() => ({
            textAlign: props.block.properties.align,
            margin: `${props.block.properties.margin.top}px ${props.block.properties.margin.right}px ${props.block.properties.margin.bottom}px ${props.block.properties.margin.left}px`
        }))

        const buttonStyle = computed(() => {
            const props = localProps.value
            return {
                display: 'inline-block',
                backgroundColor: props.backgroundColor,
                color: props.textColor,
                fontSize: `${props.fontSize}px`,
                fontFamily: props.fontFamily,
                fontWeight: props.fontWeight,
                textDecoration: props.textDecoration,
                borderRadius: `${props.borderRadius}px`,
                padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                width: props.fullWidth ? '100%' : 'auto'
            }
        })

        const startEditing = () => {
            isEditing.value = true
            localProps.value = { ...props.block.properties }
        }

        const finishEditing = () => {
            emit('update', props.block.id, localProps.value)
            isEditing.value = false
        }

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            isEditing,
            quillEditor,
            editingContainer,
            localProps,
            buttonContainerStyle,
            buttonStyle,
            startEditing,
            finishEditing,
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
