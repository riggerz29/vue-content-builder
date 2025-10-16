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
            @select="$emit('select', block.id)"
            @update="$emit('update', block.id)"
            @delete="$emit('delete', block.id)"
            @copy="$emit('copy', block.id)"
            @move-up="$emit('move-up', block.id)"
            @move-down="$emit('move-down', block.id)"
        />

        <div class="divider-block" :style="containerStyle">
            <hr :style="dividerStyle" />
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import BlockActions from "../common/BlockActions.vue";

export default {
    name: 'DividerBlock',
    components: {BlockActions},
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

        const dividerStyle = computed(() => ({
            width: `${props.block.properties.width}%`,
            height: `${props.block.properties.height}px`,
            backgroundColor: props.block.properties.color,
            border: 'none',
            margin: '0 auto',
            display: 'block'
        }))

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            containerStyle,
            dividerStyle,
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

.divider-block {
    padding: 10px;
}
</style>
