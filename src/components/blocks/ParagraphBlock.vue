<template>
  <div
    class="block-wrapper"
    :class="{ 'block-wrapper--selected': isSelected }"
    @click.stop="$emit('select')"
    @drop.stop="handleDrop"
    @dragover.prevent
  >
    <div class="block-actions" v-if="isSelected">
      <button @click.stop="$emit('copy', block.id)" title="Copy">📋</button>
      <button @click.stop="$emit('move-up', block.id)" title="Move Up">↑</button>
      <button @click.stop="$emit('move-down', block.id)" title="Move Down">↓</button>
      <button @click.stop="$emit('delete', block.id)" title="Delete">🗑</button>
    </div>

    <p
      v-if="!isEditing"
      class="paragraph-block"
      :style="paragraphStyle"
      @dblclick="startEditing"
    >
      {{ block.properties.text }}
    </p>

    <div v-else class="paragraph-block-editing">
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
        <button @click="finishEditing" class="btn-check">✓</button>
        <button @click.stop="$emit('delete', block.id)" class="btn-delete">🗑</button>
      </div>
      <textarea
        ref="editInput"
        v-model="localProps.text"
        :style="paragraphEditStyle"
        class="paragraph-block__textarea"
        @blur="finishEditing"
        rows="4"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ParagraphBlock',
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

    return {
      isEditing,
      editInput,
      localProps,
      paragraphStyle,
      paragraphEditStyle,
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
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.block-wrapper:hover {
  background: rgba(59, 130, 246, 0.05);
}

.block-actions {
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.block-actions button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.block-actions button:hover {
  background: #e5e7eb;
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
  border: 2px dashed #3b82f6;
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
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
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
