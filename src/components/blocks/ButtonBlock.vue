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
            @select="$emit('select', block)"
            @update="$emit('update', block.id)"
            @delete="$emit('delete', block.id)"
            @copy="$emit('copy', block.id)"
            @move-up="$emit('move-up', index)"
            @move-down="$emit('move-down', index)"
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
            >
                {{ block.properties.text }}
            </a>
        </div>

        <div v-else class="button-block" :style="buttonContainerStyle">
            <div class="inline-toolbar">
                <select v-model="localProps.fontFamily" class="toolbar-select">
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                </select>
                <input v-model.number="localProps.fontSize" type="number" class="toolbar-input" style="width: 50px" />
                <button @click="localProps.fontWeight = localProps.fontWeight === 'bold' ? 'normal' : 'bold'" :class="{ active: localProps.fontWeight === 'bold' }">B</button>
                <button @click="localProps.textDecoration = localProps.textDecoration === 'underline' ? 'none' : 'underline'" :class="{ active: localProps.textDecoration === 'underline' }">U</button>
                <button @click="finishEditing">✓</button>
                <button @click.stop="$emit('delete', block.id)">🗑</button>
            </div>
            <input
                ref="editInput"
                v-model="localProps.text"
                :style="buttonStyle"
                class="button-block__input"
                @blur="finishEditing"
                @keyup.enter="finishEditing"
            />
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import Icon from '../common/Icon.vue'
import BlockActions from "../common/BlockActions.vue";

export default {
    name: 'ButtonBlock',
    components: {
        BlockActions,
        Icon
    },
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

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            isEditing,
            editInput,
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

.button-block__input {
    border: 2px dashed #2f4574;
    text-align: center;
}

.inline-toolbar {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    padding: 8px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
}

.toolbar-select,
.toolbar-input {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    font-size: 12px;
}

.inline-toolbar button {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}

.inline-toolbar button:hover {
    background: #f3f4f6;
}

.inline-toolbar button.active {
    background: #2f4574;
    color: white;
    border-color: #2f4574;
}
</style>
