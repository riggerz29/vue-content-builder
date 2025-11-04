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
import BlockActions from "../common/BlockActions.vue";

export default {
    name: 'VideoBlock',
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
    outline: 2px solid #2f4574;
    outline-offset: 2px;
}

.block-wrapper:hover {
    background: rgba(59, 130, 246, 0.05);
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
