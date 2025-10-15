<template>
    <div class="properties-panel">
        <div class="properties__group">
            <label>Icon Size</label>
            <input v-model="localProps.iconSize" @input="emitUpdate" placeholder="32px" />
        </div>

        <div class="properties__group">
            <label>Icon Spacing</label>
            <input v-model="localProps.iconSpacing" @input="emitUpdate" placeholder="12px" />
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
            <h4>Social Icons</h4>
            <div v-for="(icon, index) in localProps.icons" :key="index" class="icon-item">
                <div class="icon-row">
                    <div class="properties__group">
                        <label>Platform</label>
                        <select v-model="icon.platform" @change="emitUpdate">
                            <option value="facebook">Facebook</option>
                            <option value="x">X</option>
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="youtube">YouTube</option>
                            <option value="pinterest">Pinterest</option>
                            <option value="tiktok">TikTok</option>
                            <option value="github">GitHub</option>
                        </select>
                    </div>
                    <div class="properties__group">
                        <label>URL</label>
                        <input v-model="icon.url" @input="emitUpdate" type="url" placeholder="https://..." />
                    </div>
                    <button class="remove-button" @click="removeIcon(index)">Remove</button>
                </div>
            </div>
            <button class="add-button" @click="addIcon">Add Icon</button>
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
    name: 'SocialProperties',
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
            icons: [],
            iconSize: '32px',
            iconSpacing: '12px',
            align: 'center',
            margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
            ...props.block.properties
        })

        const emitUpdate = () => {
            emit('update', { ...localProps.value })
        }

        const addIcon = () => {
            localProps.value.icons.push({ platform: 'facebook', url: '' })
            emitUpdate()
        }

        const removeIcon = (index) => {
            localProps.value.icons.splice(index, 1)
            emitUpdate()
        }

        watch(() => props.block.properties, (newProps) => {
            localProps.value = {
                icons: [],
                iconSize: '32px',
                iconSpacing: '12px',
                align: 'center',
                margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
                ...newProps
            }
        }, { deep: true })

        return { localProps, emitUpdate, addIcon, removeIcon }
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

.icon-item {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 4px;
}

.icon-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.add-button,
.remove-button {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-button {
    background-color: #10b981;
    color: white;
}

.add-button:hover {
    background-color: #059669;
}

.remove-button {
    background-color: #ef4444;
    color: white;
    margin-top: 8px;
}

.remove-button:hover {
    background-color: #dc2626;
}

.properties__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>
