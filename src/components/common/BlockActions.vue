<template>
    <div class="block-actions" v-if="isSelected">
        <slot name="common">
            <button @click.stop="$emit('copy')" title="Copy">
                <Icon name="copy" :size="14" />
            </button>
            <button @click.stop="$emit('move-up')" title="Move Up">
                <Icon name="arrowUp" :size="14" />
            </button>
            <button @click.stop="$emit('move-down')" title="Move Down">
                <Icon name="arrowDown" :size="14" />
            </button>
            <button @click.stop="$emit('delete')" title="Delete">
                <Icon name="trash" :size="14" />
            </button>
        </slot>
    </div>
</template>

<script>

import Icon from "./Icon.vue";

export default {
    name: "BlockActions",
    components: {Icon},
    props: {
        isSelected: { type: Boolean, default: false },
    },
    emits: ['select', 'update', 'delete', 'copy', 'move-up', 'move-down', ],
    setup(props, { emit }) {
    }
}

</script>

<style scoped>
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
</style>