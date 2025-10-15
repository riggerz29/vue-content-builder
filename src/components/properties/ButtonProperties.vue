<template>
    <div class="properties-panel">
        <div class="properties__group">
            <label>Button Text</label>
            <input v-model="localProps.text" @input="emitUpdate" />
        </div>

        <div class="properties__group">
            <label>URL</label>
            <input v-model="localProps.url" @input="emitUpdate" type="url" placeholder="https://example.com" />
        </div>

        <div class="properties__group">
            <label>Background Color</label>
            <input v-model="localProps.backgroundColor" @input="emitUpdate" type="color" />
        </div>

        <div class="properties__group">
            <label>Text Color</label>
            <input v-model="localProps.textColor" @input="emitUpdate" type="color" />
        </div>

        <div class="properties__group">
            <label>Font Size</label>
            <input v-model="localProps.fontSize" @input="emitUpdate" placeholder="16px" />
        </div>

        <div class="properties__group">
            <label>Font Family</label>
            <select v-model="localProps.fontFamily" @change="emitUpdate">
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
            </select>
        </div>

        <div class="properties__group">
            <label>Font Weight</label>
            <select v-model="localProps.fontWeight" @change="emitUpdate">
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
            </select>
        </div>

        <div class="properties__group">
            <label>Text Decoration</label>
            <select v-model="localProps.textDecoration" @change="emitUpdate">
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Line Through</option>
            </select>
        </div>

        <div class="properties__group">
            <label>Border Radius</label>
            <input v-model="localProps.borderRadius" @input="emitUpdate" placeholder="4px" />
        </div>

        <div class="properties__group">
            <label>Align</label>
            <select v-model="localProps.align" @change="emitUpdate">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
            </select>
        </div>

        <div class="properties__group">
            <label>
                <input type="checkbox" v-model="localProps.fullWidth" @change="emitUpdate" />
                Full Width
            </label>
        </div>

        <div class="properties__section">
            <h4>Padding</h4>
            <div class="properties__grid">
                <div class="properties__group">
                    <label>Top</label>
                    <input v-model="localProps.padding.top" @input="emitUpdate" placeholder="12px" />
                </div>
                <div class="properties__group">
                    <label>Right</label>
                    <input v-model="localProps.padding.right" @input="emitUpdate" placeholder="24px" />
                </div>
                <div class="properties__group">
                    <label>Bottom</label>
                    <input v-model="localProps.padding.bottom" @input="emitUpdate" placeholder="12px" />
                </div>
                <div class="properties__group">
                    <label>Left</label>
                    <input v-model="localProps.padding.left" @input="emitUpdate" placeholder="24px" />
                </div>
            </div>
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
                    <input v-model="localProps.margin.bottom" @input="emitUpdate" placeholder="0px" />
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
    name: 'ButtonProperties',
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
            text: '',
            url: '',
            backgroundColor: '#3b82f6',
            textColor: '#ffffff',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: '4px',
            align: 'center',
            fullWidth: false,
            padding: { top: '12px', right: '24px', bottom: '12px', left: '24px' },
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            ...props.block.properties
        })

        const emitUpdate = () => {
            emit('update', { ...localProps.value })
        }

        watch(() => props.block.properties, (newProps) => {
            localProps.value = {
                text: '',
                url: '',
                backgroundColor: '#3b82f6',
                textColor: '#ffffff',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: '600',
                textDecoration: 'none',
                borderRadius: '4px',
                align: 'center',
                fullWidth: false,
                padding: { top: '12px', right: '24px', bottom: '12px', left: '24px' },
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                ...newProps
            }
        }, { deep: true })

        return { localProps, emitUpdate }
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

.properties__group input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
}

.properties__group input,
.properties__group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 13px;
}

.properties__group input[type="color"] {
    height: 40px;
    padding: 4px;
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
