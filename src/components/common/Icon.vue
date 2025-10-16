<template>
  <component :is="iconComponent" :size="size" :stroke-width="strokeWidth" :class="className" v-bind="$attrs" />
</template>

<script>
import {
  Download,
  Code2,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  Square,
  Minus,
  Type,
  AlignLeft,
  Image,
  Video,
  Users,
  Table,
  X,
  Layout,
  Upload
} from 'lucide-vue-next'

export default {
  name: 'Icon',
  components: {
    Download,
    Code2,
    Copy,
    ArrowUp,
    ArrowDown,
    Trash2,
    Square,
    Minus,
    Type,
    AlignLeft,
    Image,
    Video,
    Users,
    Table,
    X,
    Layout,
    Upload
  },
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 20
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    className: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconComponent() {
      // Map icon names to components
      const iconMap = {
        download: 'Download',
        code: 'Code2',
        copy: 'Copy',
        arrowUp: 'ArrowUp',
        arrowDown: 'ArrowDown',
        trash: 'Trash2',
        square: 'Square',
        minus: 'Minus',
        type: 'Type',
        alignLeft: 'AlignLeft',
        image: 'Image',
        video: 'Video',
        users: 'Users',
        table: 'Table',
        x: 'X',
        layout: 'Layout',
        upload: 'Upload'
      }

      return iconMap[this.name] || 'Square'
    }
  }
}
</script>

<style scoped>
/* Icon styles inherited from parent */
</style>
