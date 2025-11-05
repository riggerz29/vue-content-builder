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

        <p
            v-if="!isEditing"
            class="paragraph-block"
            :style="paragraphStyle"
            @dblclick="startEditing"
        >
            {{ block.properties.text }}
        </p>

        <div v-else class="paragraph-block-editing" ref="editingContainer" @focusout="onFocusOut">
            <div class="inline-toolbar">
                <select v-model="localProps.fontFamily" class="toolbar-select">
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
                <input v-model.number="localProps.fontSize" type="number" class="toolbar-input" style="width: 50px" />
                <input v-model="localProps.color" type="color" class="toolbar-color" title="Text Color" />
                <button @click="toggleBold" :class="{ active: localProps.fontWeight === 'bold' }" title="Bold">B</button>
                <button @click="toggleItalic" :class="{ active: localProps.fontStyle === 'italic' }" title="Italic">I</button>
                <button @click="toggleUnderline" :class="{ active: localProps.textDecoration === 'underline' }" title="Underline">U</button>
                <button @click="setAlign('left')" :class="{ active: localProps.align === 'left' }" title="Align Left">⬅</button>
                <button @click="setAlign('center')" :class="{ active: localProps.align === 'center' }" title="Align Center">↔</button>
                <button @click="setAlign('right')" :class="{ active: localProps.align === 'right' }" title="Align Right">➡</button>
                <div class="toolbar__vars" v-if="variablesList.length">
                    <select v-model="selectedVarIdx" class="toolbar-select small">
                        <option v-for="(v, i) in variablesList" :key="i" :value="i">{{ v.name }}</option>
                    </select>
                    <button @click="insertSelectedVariable" title="Insert variable">+</button>
                </div>
                <button @click.stop="$emit('delete', block.id)" class="btn-delete">
                    <Trash2 size="16" />
                </button>
            </div>
            <textarea
                ref="editInput"
                v-model="localProps.text"
                :style="paragraphEditStyle"
                class="paragraph-block__textarea"
                rows="4"
                @keydown="onKeydown"
            />
        </div>
    </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import BlockActions from "../common/BlockActions.vue";

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
        const editInput = ref(null)
        const editingContainer = ref(null)
        const localProps = ref({ ...props.block.properties })

        // normalize variables to an array of { name, format }
        const variablesList = computed(() => {
            const vars = props.variables || []
            if (Array.isArray(vars)) return vars.filter(v => v && (v.name || v.label) && v.format).map(v => ({ name: v.name || v.label, format: v.format }))
            // object/dictionary case
            return Object.values(vars).filter(v => v && (v.name || v.label) && v.format).map(v => ({ name: v.name || v.label, format: v.format }))
        })
        const selectedVarIdx = ref(0)

        function insertAtCursor(textarea, text) {
            if (!textarea) return
            const start = textarea.selectionStart ?? textarea.value.length
            const end = textarea.selectionEnd ?? textarea.value.length
            const before = textarea.value.slice(0, start)
            const after = textarea.value.slice(end)
            const newVal = before + text + after
            const newPos = start + text.length
            textarea.value = newVal
            // also update v-model
            localProps.value.text = newVal
            nextTick(() => {
                textarea.focus()
                textarea.setSelectionRange(newPos, newPos)
            })
        }

        const insertSelectedVariable = () => {
            const v = variablesList.value[selectedVarIdx.value]
            if (!v) return
            insertAtCursor(editInput.value, v.format)
        }

        const onKeydown = (e) => {
            if (e.key === '@' && variablesList.value.length) {
                // simple UX: prevent default to avoid inserting '@' and instead insert the first var format after popup in future
                // For now, just allow typing '@' and do nothing, or we could show picker in future
                // no-op placeholder for future popup
            }
        }

        const paragraphStyle = computed(() => ({
            fontSize: `${props.block.properties.fontSize}px`,
            fontFamily: props.block.properties.fontFamily,
            fontWeight: props.block.properties.fontWeight,
            fontStyle: props.block.properties.fontStyle || 'normal',
            textDecoration: props.block.properties.textDecoration || 'none',
            color: props.block.properties.color,
            lineHeight: props.block.properties.lineHeight,
            letterSpacing: `${props.block.properties.letterSpacing}px`,
            textAlign: props.block.properties.align,
            margin: `${props.block.properties.margin.top}px ${props.block.properties.margin.right}px ${props.block.properties.margin.bottom}px ${props.block.properties.margin.left}px`,
            padding: `${props.block.properties.padding.top}px ${props.block.properties.padding.right}px ${props.block.properties.padding.bottom}px ${props.block.properties.padding.left}px`
        }))

        const paragraphEditStyle = computed(() => ({
            fontSize: `${localProps.value.fontSize}px`,
            fontFamily: localProps.value.fontFamily,
            fontWeight: localProps.value.fontWeight,
            fontStyle: localProps.value.fontStyle || 'normal',
            textDecoration: localProps.value.textDecoration || 'none',
            color: localProps.value.color,
            lineHeight: localProps.value.lineHeight,
            letterSpacing: `${localProps.value.letterSpacing}px`,
            textAlign: localProps.value.align
        }))

        const startEditing = () => {
            isEditing.value = true
            localProps.value = { ...props.block.properties }
            setTimeout(() => {
                if (editInput.value) {
                    editInput.value.focus()
                }
            }, 10)
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

        return {
            isEditing,
            editInput,
            editingContainer,
            localProps,
            variablesList,
            selectedVarIdx,
            insertSelectedVariable,
            onKeydown,
            paragraphStyle,
            paragraphEditStyle,
            startEditing,
            finishEditing,
            toggleBold,
            toggleItalic,
            toggleUnderline,
            setAlign,
            handleDrop,
            onFocusOut
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
}

.paragraph-block__textarea {
    width: 100%;
    border: 2px dashed #2f4574;
    padding: 8px;
    resize: vertical;
    font-family: inherit;
}

.inline-toolbar {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    padding: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    flex-wrap: wrap;
}

.toolbar-select,
.toolbar-input,
.toolbar-color {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    font-size: 12px;
}

.toolbar-color {
    width: 40px;
    padding: 2px;
}

.inline-toolbar button {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
}

.inline-toolbar button:hover {
    background: #f3f4f6;
}

.inline-toolbar button.active {
    background: #2f4574;
    color: white;
    border-color: #2f4574;
}

.inline-toolbar button.btn-check {
    background: #10b981;
    color: white;
    border-color: #10b981;
}

.inline-toolbar button.btn-delete {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
}
</style>
