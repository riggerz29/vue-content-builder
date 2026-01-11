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
            <div class="editing-actions">
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
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import BlockActions from "../common/BlockActions.vue";
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// Configure Quill to use inline styles for alignment
const AlignStyle = Quill.import('attributors/style/align')
Quill.register(AlignStyle, true)

export default {
    name: 'ParagraphBlock',
    components: {BlockActions, Trash2},
    props: {
        block: { type: Object, required: true },
        isSelected: { type: Boolean, default: false },
        index: { type: Number, required: true },
        variables: {type: [Array, Object], default: () => ([])}
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
                        [{ 'font': [] }, { 'size': [] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['clean']
                    ]
                }
            })

            quill.root.innerHTML = localProps.value.text

            // Apply paragraph styles to the editor root
            Object.assign(quill.root.style, paragraphEditStyle.value)

            quill.on('text-change', () => {
                localProps.value.text = quill.root.innerHTML
            })

            // Focus quill editor
            quill.focus()

            // Handle focus out to finish editing
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

        // normalize variables to an array of { name, format }
        const variablesList = computed(() => {
            const vars = props.variables || []
            if (Array.isArray(vars)) return vars.filter(v => v && (v.name || v.label) && v.format).map(v => ({ name: v.name || v.label, format: v.format }))
            // object/dictionary case
            return Object.values(vars).filter(v => v && (v.name || v.label) && v.format).map(v => ({ name: v.name || v.label, format: v.format }))
        })
        const selectedVarIdx = ref(0)

        function insertAtCursor(text) {
            if (!quill) return
            const range = quill.getSelection(true)
            quill.insertText(range.index, text)
            quill.setSelection(range.index + text.length)
        }

        const insertSelectedVariable = () => {
            const v = variablesList.value[selectedVarIdx.value]
            if (!v) return
            insertAtCursor(v.format)
        }

        const onKeydown = (e) => {
            if (e.key === '@' && variablesList.value.length) {
                // simple UX: prevent default to avoid inserting '@' and instead insert the first var format after popup in future
                // For now, just allow typing '@' and do nothing, or we could show picker in future
                // no-op placeholder for future popup
            }
        }

        const layoutStyle = computed(() => ({
            margin: `${props.block.properties.margin.top}px ${props.block.properties.margin.right}px ${props.block.properties.margin.bottom}px ${props.block.properties.margin.left}px`,
            padding: `${props.block.properties.padding.top}px ${props.block.properties.padding.right}px ${props.block.properties.padding.bottom}px ${props.block.properties.padding.left}px`
        }))

        const paragraphStyle = computed(() => ({
            fontSize: `${props.block.properties.fontSize}px`,
            fontFamily: props.block.properties.fontFamily,
            fontWeight: props.block.properties.fontWeight,
            fontStyle: props.block.properties.fontStyle || 'normal',
            textDecoration: props.block.properties.textDecoration || 'none',
            color: props.block.properties.color,
            lineHeight: props.block.properties.lineHeight,
            letterSpacing: `${props.block.properties.letterSpacing}px`,
            textAlign: props.block.properties.align
        }))

        const paragraphEditStyle = computed(() => {
            const s = { ...localProps.value }
            return {
                fontSize: `${s.fontSize}px`,
                fontFamily: s.fontFamily,
                fontWeight: s.fontWeight,
                fontStyle: s.fontStyle || 'normal',
                textDecoration: s.textDecoration || 'none',
                color: s.color,
                lineHeight: s.lineHeight,
                letterSpacing: `${s.letterSpacing}px`,
                textAlign: s.align
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

        const toggleBold = () => {
            localProps.value.fontWeight = localProps.value.fontWeight === 'bold' ? 'normal' : 'bold'
        }

        const toggleItalic = () => {
            localProps.value.fontStyle = localProps.value.fontStyle === 'italic' ? 'normal' : 'italic'
        }

        const toggleUnderline = () => {
            localProps.value.textDecoration = localProps.value.textDecoration === 'underline' ? 'none' : 'underline'
        }

        const setAlign = (align) => {
            localProps.value.align = align
        }

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        const onFocusOut = (e) => {
            const next = e.relatedTarget
            // If focus is moving within the editing container, do not finish editing
            if (editingContainer.value && next && editingContainer.value.contains(next)) {
                return
            }
            finishEditing()
        }

        const combinedStyle = computed(() => ({
            ...layoutStyle.value,
            ...paragraphStyle.value
        }))

        return {
            isEditing,
            quillEditor,
            editingContainer,
            localProps,
            variablesList,
            selectedVarIdx,
            insertSelectedVariable,
            onKeydown,
            layoutStyle,
            paragraphStyle,
            paragraphEditStyle,
            combinedStyle,
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
