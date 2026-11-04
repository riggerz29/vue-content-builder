import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { createQuill, insertAtCursor, FULL_TOOLBAR } from '../utils/quill'
import { normalizeVariables } from '../utils/variables'

/**
 * Double-click-to-edit behaviour shared by the rich-text blocks (heading, paragraph, button).
 *
 * The block renders `quillEditor` inside `editingContainer` while `isEditing` is true. Edits go to
 * `localProps` and are emitted as one `update` when the user clicks outside the container.
 *
 * @param {object} props        the block component's props (`block`, optional `variables`)
 * @param {Function} emit       the block component's emit
 * @param {object} options
 * @param {Array} [options.toolbar]        Quill toolbar config
 * @param {Function} [options.editorStyle] returns inline styles for the editor root
 */
export function useInlineEditor(props, emit, { toolbar = FULL_TOOLBAR, editorStyle = () => ({}) } = {}) {
    const isEditing = ref(false)
    const quillEditor = ref(null)
    const editingContainer = ref(null)
    const localProps = ref({ ...props.block.properties })
    let quill = null

    const onDocumentMousedown = (event) => {
        if (editingContainer.value && !editingContainer.value.contains(event.target)) {
            finishEditing()
        }
    }

    const stopListening = () => document.removeEventListener('mousedown', onDocumentMousedown)

    const startEditing = () => {
        localProps.value = { ...props.block.properties }
        isEditing.value = true
    }

    const finishEditing = () => {
        if (!isEditing.value) return
        stopListening()
        quill = null
        isEditing.value = false
        emit('update', props.block.id, localProps.value)
    }

    watch(isEditing, async (editing) => {
        if (!editing) return
        await nextTick()
        if (!quillEditor.value) return

        quill = createQuill(quillEditor.value, toolbar)
        quill.root.innerHTML = localProps.value.text
        Object.assign(quill.root.style, editorStyle())
        quill.on('text-change', () => {
            localProps.value.text = quill.root.innerHTML
        })
        quill.focus()

        document.addEventListener('mousedown', onDocumentMousedown)
    })

    // A block deleted or unmounted mid-edit must not leave a listener that later fires into it
    onBeforeUnmount(stopListening)

    // Variable picker (only rendered by blocks that accept `variables`)
    const variablesList = computed(() => normalizeVariables(props.variables))
    const selectedVarIdx = ref(0)

    const insertSelectedVariable = () => {
        const variable = variablesList.value[selectedVarIdx.value]
        if (variable && quill) insertAtCursor(quill, variable.format)
    }

    return {
        isEditing,
        quillEditor,
        editingContainer,
        localProps,
        startEditing,
        finishEditing,
        variablesList,
        selectedVarIdx,
        insertSelectedVariable
    }
}
