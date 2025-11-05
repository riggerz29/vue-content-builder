<template>
    <div class="properties-panel">
        <div class="properties__group">
            <label>Image URL</label>
            <input v-model="localProps.url" @input="emitUpdate" type="url" placeholder="https://example.com/image.jpg" />
        </div>

        <div class="properties__group" v-if="onUpload">
            <button class="upload-button" @click="handleUpload">Upload Image</button>
        </div>

        <div class="properties__group">
            <label>Alt Text</label>
            <input v-model="localProps.alt" @input="emitUpdate" placeholder="Description of image" />
        </div>

        <div class="properties__group">
            <label>Width</label>
            <input v-model="localProps.width" @input="emitUpdate" placeholder="600px or 100%" />
        </div>

        <div class="properties__group">
            <label>Height</label>
            <input v-model="localProps.height" @input="emitUpdate" placeholder="auto or 400px" />
        </div>

        <div class="properties__group">
            <label>Link URL</label>
            <input v-model="localProps.link" @input="emitUpdate" type="url" placeholder="https://example.com" />
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
                    <input v-model="localProps.margin.top" @input="emitUpdate" placeholder="0px" />
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
    name: 'ImageProperties',
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
            url: '',
            alt: '',
            width: '600px',
            height: 'auto',
            link: '',
            align: 'center',
            margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
            meta: {}, // maybe store raw upload metadata here etc
            ...props.block.properties
        })

        const emitUpdate = () => {
            emit('update', { ...localProps.value })
        }

        const handleUpload = async () => {
            if (props.onUpload) {
                const result = await props.onUpload({
                    blockId: props.block.id,
                    blockType: props.block.type,
                })
                if (result) {
                    if (result?.url) {
                        localProps.value.url = result.url
                    }
                    if (result?.meta) {
                        localProps.value.meta = result.meta
                    }
                    emitUpdate()
                }
            }
        }

        watch(() => props.block.properties, (newProps) => {
            localProps.value = {
                url: '',
                alt: '',
                width: '600px',
                height: 'auto',
                link: '',
                align: 'center',
                margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
                ...newProps
            }
        }, { deep: true })

        return { localProps, emitUpdate, handleUpload }
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

.upload-button {
    width: 100%;
    padding: 10px;
    background-color: #2f4574;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.upload-button:hover {
    background-color: #2563eb;
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
