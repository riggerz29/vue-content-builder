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
      <button @click.stop="$emit('delete', block.id)" title="Delete">🗑</button>
    </div>

    <div class="video-block" :style="containerStyle">
      <a v-if="block.properties.url" :href="block.properties.url" class="video-block__link">
        <img
          :src="block.properties.thumbnailUrl"
          alt="Video Thumbnail"
          :style="videoStyle"
          class="video-block__thumbnail"
        />
        <div class="video-block__play-icon">▶</div>
      </a>
      <div v-else class="video-block__placeholder">
        <img
          :src="block.properties.thumbnailUrl"
          alt="Video Thumbnail"
          :style="videoStyle"
          class="video-block__thumbnail"
        />
        <div class="video-block__play-icon">▶</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'VideoBlock',
  props: {
    block: { type: Object, required: true },
    isSelected: { type: Boolean, default: false },
    index: { type: Number, required: true }
  },
  emits: ['select', 'update', 'delete', 'copy', 'move-up', 'move-down', 'drop'],
  setup(props, { emit }) {
    const containerStyle = computed(() => ({
      textAlign: props.block.properties.align,
      margin: `${props.block.properties.margin.top}px ${props.block.properties.margin.right}px ${props.block.properties.margin.bottom}px ${props.block.properties.margin.left}px`
    }))

    const videoStyle = computed(() => ({
      width: props.block.properties.width,
      display: 'block',
      maxWidth: '100%'
    }))

    const handleDrop = (event) => {
      emit('drop', event, props.index)
    }

    return {
      containerStyle,
      videoStyle,
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

.video-block {
  padding: 10px;
}

.video-block__link,
.video-block__placeholder {
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

.video-block__thumbnail {
  display: block;
  margin: 0 auto;
}

.video-block__play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  padding-left: 4px;
}

.video-block__link:hover .video-block__play-icon {
  background: rgba(0, 0, 0, 0.9);
}
</style>
