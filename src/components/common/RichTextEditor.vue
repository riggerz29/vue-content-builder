<template>
    <div class="rich-text-editor">
        <div ref="editorContainer" class="quill-editor"></div>
    </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
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
    name: 'RichTextEditor',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        toolbar: {
            type: Array,
            default: () => [
                [{ 'font': [] }, { 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '32px', '36px', '48px', '64px', '72px', '96px'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['clean']
            ]
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
            quill = new Quill(editorContainer.value, {
                theme: 'snow',
                modules: {
                    toolbar: props.toolbar
                }
            })

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
