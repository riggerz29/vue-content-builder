<template>
    <div class="properties-panel">
        <div class="properties__group">
            <label>Border Color</label>
            <input v-model="localProps.borderColor" @input="emitUpdate" type="color" />
        </div>

        <div class="properties__group">
            <label>Border Width</label>
            <input v-model="localProps.borderWidth" @input="emitUpdate" placeholder="1px" />
        </div>

        <div class="properties__group">
            <label>Cell Padding</label>
            <input v-model="localProps.cellPadding" @input="emitUpdate" placeholder="8px" />
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
            <input v-model="localProps.fontSize" @input="emitUpdate" placeholder="14px" />
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
    name: 'TableProperties',
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
            borderColor: '#e5e7eb',
            borderWidth: '1px',
            cellPadding: '8px',
            backgroundColor: '#ffffff',
            textColor: '#374151',
            fontSize: '14px',
            margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
            ...props.block.properties
        })

        const emitUpdate = () => {
            emit('update', { ...localProps.value })
        }

        watch(() => props.block.properties, (newProps) => {
            localProps.value = {
                borderColor: '#e5e7eb',
                borderWidth: '1px',
                cellPadding: '8px',
                backgroundColor: '#ffffff',
                textColor: '#374151',
                fontSize: '14px',
                margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
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
