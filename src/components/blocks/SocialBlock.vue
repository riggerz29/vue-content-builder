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

        <div class="social-block" :style="containerStyle">
            <div class="social-block__icons" :style="iconsContainerStyle">
                <a
                    v-for="(icon, index) in block.properties.icons"
                    :key="index"
                    :href="icon.url"
                    class="social-block__icon"
                    :style="iconLinkStyle"
                    :title="icon.platform"
                >
                    <img
                        :src="getIconUrl(icon.platform)"
                        :alt="icon.platform"
                        :style="iconImageStyle"
                        class="social-icon-img"
                    />
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import BlockActions from "../common/BlockActions.vue";

export default {
    name: 'SocialBlock',
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

        const iconsContainerStyle = computed(() => ({
            display: 'flex',
            justifyContent: props.block.properties.align === 'left' ? 'flex-start' : props.block.properties.align === 'right' ? 'flex-end' : 'center',
            gap: `${props.block.properties.iconSpacing}px`
        }))

        const iconLinkStyle = computed(() => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
        }))

        const iconImageStyle = computed(() => ({
            width: `${props.block.properties.iconSize}px`,
            height: `${props.block.properties.iconSize}px`,
            display: 'block'
        }))

        const socialIcons = {
            facebook: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
            twitter: 'https://cdn-icons-png.flaticon.com/512/12107/12107611.png',
            x: 'https://cdn-icons-png.flaticon.com/512/12107/12107611.png',
            instagram: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
            linkedin: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
            youtube: 'https://cdn-icons-png.flaticon.com/512/174/174883.png',
            pinterest: 'https://cdn-icons-png.flaticon.com/512/174/174863.png',
            tiktok: 'https://cdn-icons-png.flaticon.com/512/3116/3116491.png',
            github: 'https://cdn-icons-png.flaticon.com/512/733/733553.png'
        }

        const getIconUrl = (platform) => {
            return socialIcons[platform] || socialIcons.facebook
        }

        const handleDrop = (event) => {
            emit('drop', event, props.index)
        }

        return {
            containerStyle,
            iconsContainerStyle,
            iconLinkStyle,
            iconImageStyle,
            getIconUrl,
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

.social-block {
    padding: 10px;
}

.social-block__icons {
    padding: 10px 0;
}

.social-block__icon {
    text-decoration: none;
    transition: transform 0.2s, opacity 0.2s;
}

.social-block__icon:hover {
    transform: scale(1.1);
    opacity: 0.8;
}

.social-icon-img {
    object-fit: contain;
}
</style>
