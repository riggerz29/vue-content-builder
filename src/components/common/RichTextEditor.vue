<template>
    <div class="rich-text-editor">
        <div ref="editorContainer" class="quill-editor"></div>
    </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { createQuill, FULL_TOOLBAR } from '../../utils/quill'

export default {
    name: 'RichTextEditor',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        toolbar: {
            type: Array,
            default: () => FULL_TOOLBAR
        },
        styles: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const editorContainer = ref(null)
        let quill = null

        const applyStyles = () => {
            if (quill && quill.root) {
                const s = { ...props.styles }
                if (s.fontSize && !isNaN(s.fontSize)) {
                    s.fontSize = `${s.fontSize}px`
                }
                Object.assign(quill.root.style, s)
            }
        }

        onMounted(() => {
            quill = createQuill(editorContainer.value, props.toolbar)

            quill.root.innerHTML = props.modelValue
            applyStyles()

            quill.on('text-change', () => {
                const html = quill.root.innerHTML
                if (html !== props.modelValue) {
                    emit('update:modelValue', html)
                }
            })
        })

        watch(() => props.modelValue, (newVal) => {
            if (quill && newVal !== quill.root.innerHTML) {
                quill.root.innerHTML = newVal
            }
        })

        watch(() => props.styles, () => {
            applyStyles()
        }, { deep: true })

        return {
            editorContainer
        }
    }
}
</script>

<style>
.rich-text-editor .ql-container {
    font-family: inherit;
    font-size: inherit;
}
.rich-text-editor .ql-editor {
    min-height: 100px;
}

/* Fix for Quill inline sizes in toolbar */
:deep(.ql-snow .ql-picker.ql-size .ql-picker-label::before),
:deep(.ql-snow .ql-picker.ql-size .ql-picker-item::before) {
    content: attr(data-value) !important;
}

:deep(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value]::before) {
    content: attr(data-value) !important;
}
</style>
