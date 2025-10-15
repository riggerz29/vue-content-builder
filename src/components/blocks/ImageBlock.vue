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

        <div class="image-block" :style="containerStyle">
            <a v-if="block.properties.link" :href="block.properties.link">
                <img
                    :src="block.properties.url"
                    :alt="block.properties.alt"
                    :style="imageStyle"
                    class="image-block__img"
                />
            </a>
            <img
                v-else
                :src="block.properties.url"
                :alt="block.properties.alt"
                :style="imageStyle"
                class="image-block__img"
            />
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

export default {
    name: 'ImageBlock',
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

        const imageStyle = computed(() => ({
            width: props.block.properties.width,
            height: props.block.properties.height,
            display: 'block',
            maxWidth: '100%'
        }))

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            containerStyle,
            imageStyle,
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

.image-block {
    padding: 10px;
}

.image-block__img {
    margin: 0 auto;
}

.image-block a {
    display: inline-block;
}
</style>
