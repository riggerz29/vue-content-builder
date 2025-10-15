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

    <div class="social-block" :style="containerStyle">
      <div class="social-block__icons" :style="iconsContainerStyle">
        <a
          v-for="(icon, index) in block.properties.icons"
          :key="index"
          :href="icon.url"
          class="social-block__icon"
          :style="iconStyle"
          :title="icon.platform"
        >
          <span class="social-icon" :class="`social-icon--${icon.platform}`">
            {{ getPlatformIcon(icon.platform) }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'SocialBlock',
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

    const iconsContainerStyle = computed(() => ({
      display: 'flex',
      justifyContent: props.block.properties.align === 'left' ? 'flex-start' : props.block.properties.align === 'right' ? 'flex-end' : 'center',
      gap: `${props.block.properties.iconSpacing}px`
    }))

    const iconStyle = computed(() => ({
      width: `${props.block.properties.iconSize}px`,
      height: `${props.block.properties.iconSize}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${props.block.properties.iconSize * 0.6}px`
    }))

    const getPlatformIcon = (platform) => {
      const icons = {
        facebook: 'f',
        twitter: 't',
        instagram: 'i',
        linkedin: 'in',
        youtube: 'yt',
        pinterest: 'p'
      }
      return icons[platform] || '?'
    }

    const handleDrop = (event) => {
      emit('drop', event, props.index)
    }

    return {
      containerStyle,
      iconsContainerStyle,
      iconStyle,
      getPlatformIcon,
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

.social-block {
  padding: 10px;
}

.social-block__icons {
  padding: 10px 0;
}

.social-block__icon {
  text-decoration: none;
  transition: transform 0.2s;
}

.social-block__icon:hover {
  transform: scale(1.1);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
}

.social-icon--facebook {
  background: #1877f2;
}

.social-icon--twitter {
  background: #1da1f2;
}

.social-icon--instagram {
  background: #e4405f;
}

.social-icon--linkedin {
  background: #0077b5;
}

.social-icon--youtube {
  background: #ff0000;
}

.social-icon--pinterest {
  background: #bd081c;
}
</style>
