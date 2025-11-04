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

        <component
            v-if="!isEditing"
            :is="block.properties.level"
            class="heading-block"
            :style="headingStyle"
            @dblclick="startEditing"
        >
            {{ block.properties.text }}
        </component>

        <div v-else class="heading-block-editing">
            <div class="inline-toolbar">
                <select v-model="localProps.level" class="toolbar-select">
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                </select>
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
                <button @click="finishEditing" class="btn-check">✓</button>
                <button @click.stop="$emit('delete', block.id)" class="btn-delete">🗑</button>
            </div>
            <textarea
                ref="editInput"
                v-model="localProps.text"
                :style="headingEditStyle"
                class="heading-block__textarea"
                @blur="finishEditing"
                rows="2"
            />
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import BlockActions from "../common/BlockActions.vue";

export default {
    name: 'HeadingBlock',
    components: {BlockActions},
    props: {
        block: { type: Object, required: true },
        isSelected: { type: Boolean, default: false },
        index: { type: Number, required: true }
    },
    emits: ['select', 'update', 'delete', 'copy', 'move-up', 'move-down', 'drop'],
    setup(props, { emit }) {
        const isEditing = ref(false)
        const editInput = ref(null)
        const localProps = ref({ ...props.block.properties })

        const headingStyle = computed(() => ({
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

        const headingEditStyle = computed(() => ({
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

        return {
            isEditing,
            editInput,
            localProps,
            headingStyle,
            headingEditStyle,
            startEditing,
            finishEditing,
            toggleBold,
            toggleItalic,
            toggleUnderline,
            setAlign,
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

.heading-block {
    padding: 10px;
    cursor: text;
    word-wrap: break-word;
}

.heading-block-editing {
    padding: 10px;
}

.heading-block__textarea {
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
