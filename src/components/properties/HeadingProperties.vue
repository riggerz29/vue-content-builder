<template>
    <div class="properties-panel">
        <div class="properties__group">
            <label>Heading Text</label>
            <RichTextEditor
                v-model="localProps.text"
                :styles="{
                    fontSize: localProps.fontSize,
                    color: localProps.color,
                    fontFamily: localProps.fontFamily,
                    fontWeight: localProps.fontWeight,
                    lineHeight: localProps.lineHeight,
                    textAlign: localProps.align
                }"
                @update:modelValue="emitUpdate"
            />
        </div>

        <div class="properties__group" v-if="variablesList.length">
            <label>Insert Variable</label>
            <div style="display:flex; gap:8px; align-items:center;">
                <select v-model="selectedVarIdx" class="toolbar-select" style="flex:1;">
                    <option v-for="(v, i) in variablesList" :key="i" :value="i">{{ v.name }}</option>
                </select>
                <button type="button" class="btn-insert" @click="insertSelectedVariable">Insert</button>
            </div>
            <small class="input-hint">Inserts the variable's format into the text (e.g. {{ variablesList[selectedVarIdx]?.format || '' }})</small>
        </div>

        <div class="properties__group">
            <label>Level</label>
            <select v-model="localProps.level" @change="emitUpdate">
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
            </select>
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
            <label>Colour</label>
            <input v-model="localProps.color" @input="emitUpdate" type="color" />
        </div>

        <div class="properties__section">
            <h4>Padding</h4>
            <div class="properties__grid">
                <div class="properties__group">
                    <label>Top</label>
                    <input v-model="localProps.padding.top" @input="emitUpdate" placeholder="0px" />
                </div>
                <div class="properties__group">
                    <label>Right</label>
                    <input v-model="localProps.padding.right" @input="emitUpdate" placeholder="0px" />
                </div>
                <div class="properties__group">
                    <label>Bottom</label>
                    <input v-model="localProps.padding.bottom" @input="emitUpdate" placeholder="0px" />
                </div>
                <div class="properties__group">
                    <label>Left</label>
                    <input v-model="localProps.padding.left" @input="emitUpdate" placeholder="0px" />
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
import { ref, watch, computed } from 'vue'
import RichTextEditor from '../common/RichTextEditor.vue'

export default {
    name: 'HeadingProperties',
    components: {
        RichTextEditor
    },
    props: {
        block: {
            type: Object,
            required: true
        },
        onUpload: {
            type: Function,
            default: null
        },
        variables: {
            type: [Array, Object],
            default: () => ([])
        }
    },
    emits: ['update'],
    setup(props, { emit }) {
        const localProps = ref({
            text: '',
            level: 'h2',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontWeight: '700',
            color: '#111827',
            lineHeight: '1.3',
            letterSpacing: '0px',
            align: 'left',
            padding: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
            ...props.block.properties
        })

        // normalize variables to array
        const variablesList = computed(() => {
            const vars = props.variables || []
            if (Array.isArray(vars)) return vars.filter(v => v && (v.name || v.label) && v.format).map(v => ({ name: v.name || v.label, format: v.format }))
            return Object.values(vars).filter(v => v && (v.name || v.label) && v.format).map(v => ({ name: v.name || v.label, format: v.format }))
        })
        const selectedVarIdx = ref(0)
        const insertSelectedVariable = () => {
            const v = variablesList.value[selectedVarIdx.value]
            if (!v) return
            localProps.value.text = (localProps.value.text || '') + v.format
            emitUpdate()
        }

        const emitUpdate = () => {
            const propsToEmit = { ...localProps.value }
            if (typeof propsToEmit.fontSize === 'string' && propsToEmit.fontSize.endsWith('px')) {
                propsToEmit.fontSize = parseInt(propsToEmit.fontSize)
            }
            emit('update', propsToEmit)
        }

        watch(() => props.block.properties, (newProps) => {
            localProps.value = {
                text: '',
                level: 'h2',
                fontSize: 24,
                fontFamily: 'Arial, sans-serif',
                fontWeight: '700',
                color: '#111827',
                lineHeight: '1.3',
                letterSpacing: '0px',
                align: 'left',
                padding: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
                ...newProps
            }
            if (typeof localProps.value.fontSize === 'string' && localProps.value.fontSize.endsWith('px')) {
                localProps.value.fontSize = parseInt(localProps.value.fontSize)
            }
        }, { deep: true })

        return { localProps, emitUpdate, variablesList, selectedVarIdx, insertSelectedVariable }
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

.btn-insert {
    padding: 8px 12px;
    background-color: #f1f1f1;
    color: #374151;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;

    &:hover {
        background-color: #e5e7eb;
    }
}
</style>
