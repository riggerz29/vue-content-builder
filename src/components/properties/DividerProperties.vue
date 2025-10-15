<template>
  <div class="properties-panel">
    <div class="properties__group">
      <label>Width (%)</label>
      <input v-model="localProps.width" @input="emitUpdate" type="number" min="1" max="100" placeholder="100" />
    </div>

    <div class="properties__group">
      <label>Height (px)</label>
      <input v-model="localProps.height" @input="emitUpdate" placeholder="1px" />
    </div>

    <div class="properties__group">
      <label>Color</label>
      <input v-model="localProps.color" @input="emitUpdate" type="color" />
    </div>

    <div class="properties__group">
      <label>Align</label>
      <select v-model="localProps.align" @change="emitUpdate">
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>
    </div>

    <div class="properties__section">
      <h4>Margin</h4>
      <div class="properties__grid">
        <div class="properties__group">
          <label>Top</label>
          <input v-model="localProps.margin.top" @input="emitUpdate" placeholder="16px" />
        </div>
        <div class="properties__group">
          <label>Right</label>
          <input v-model="localProps.margin.right" @input="emitUpdate" placeholder="0px" />
        </div>
        <div class="properties__group">
          <label>Bottom</label>
          <input v-model="localProps.margin.bottom" @input="emitUpdate" placeholder="16px" />
        </div>
        <div class="properties__group">
          <label>Left</label>
          <input v-model="localProps.margin.left" @input="emitUpdate" placeholder="0px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'DividerProperties',
  props: {
    block: {
      type: Object,
      required: true
    },
    onUpload: {
      type: Function,
      default: null
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localProps = ref({
      width: '100',
      height: '1px',
      color: '#e5e7eb',
      align: 'center',
      margin: { top: '16px', right: '0px', bottom: '16px', left: '0px' },
      ...props.block.properties
    })

    const emitUpdate = () => {
      emit('update', { ...localProps.value })
    }

    watch(() => props.block.properties, (newProps) => {
      localProps.value = {
        width: '100',
        height: '1px',
        color: '#e5e7eb',
        align: 'center',
        margin: { top: '16px', right: '0px', bottom: '16px', left: '0px' },
        ...newProps
      }
    }, { deep: true })

    return { localProps, emitUpdate }
  }
}
</script>

<style scoped>
.properties-panel {
  padding: 16px;
}

.properties__group {
  margin-bottom: 16px;
}

.properties__group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.properties__group input,
.properties__group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
}

.properties__group input[type="color"] {
  height: 40px;
  padding: 4px;
}

.properties__section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.properties__section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.properties__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
