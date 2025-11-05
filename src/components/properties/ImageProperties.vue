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
            <div class="size-row" :class="{ stacked: widthUnit === '%' }">
                <select v-model="widthUnit" @change="emitUpdate" class="unit-select">
                    <option value="px">Pixels</option>
                    <option value="%">Percent</option>
                    <option value="auto">Auto</option>
                </select>
                <template v-if="widthUnit !== 'auto'">
                    <input v-if="widthUnit === 'px'" type="number" min="0" v-model.number="widthValue" @input="emitUpdate" placeholder="600" class="size-input" />
                    <div v-else class="percent-wrap">
                        <input type="range" min="0" max="100" v-model.number="widthValue" @input="emitUpdate" />
                        <input type="number" min="0" max="100" v-model.number="widthValue" @input="emitUpdate" placeholder="100" class="size-input" />
                        <span class="unit-label">%</span>
                    </div>
                </template>
            </div>
        </div>

        <div class="properties__group">
            <label>Height</label>
            <div class="size-row" :class="{ stacked: heightUnit === '%' }">
                <select v-model="heightUnit" @change="emitUpdate" class="unit-select">
                    <option value="px">Pixels</option>
                    <option value="%">Percent</option>
                    <option value="auto">Auto</option>
                </select>
                <template v-if="heightUnit !== 'auto'">
                    <input v-if="heightUnit === 'px'" type="number" min="0" v-model.number="heightValue" @input="emitUpdate" placeholder="400" class="size-input" />
                    <div v-else class="percent-wrap">
                        <input type="range" min="0" max="100" v-model.number="heightValue" @input="emitUpdate" />
                        <input type="number" min="0" max="100" v-model.number="heightValue" @input="emitUpdate" placeholder="100" class="size-input" />
                        <span class="unit-label">%</span>
                    </div>
                </template>
            </div>
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
            height: '400px',
            link: '',
            align: 'center',
            margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
            meta: {}, // optional metadata i.e the returned data from a streamed s3 upload
            ...props.block.properties
        })

        // Size controls state
        const widthUnit = ref('px') // 'px' | '%'
        const widthValue = ref(600)
        const heightUnit = ref('auto') // 'px' | '%' | 'auto'
        const heightValue = ref(400)

        const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0))

        function parseSize(input, { defaultUnit = 'px', defaultValue = 0 } = {}) {
            if (input == null) return { unit: defaultUnit, value: defaultValue }
            if (typeof input === 'number') return { unit: 'px', value: input }
            const str = String(input).trim().toLowerCase()
            if (str === 'auto') return { unit: 'auto', value: NaN }
            if (str.endsWith('%')) {
                const num = parseFloat(str.slice(0, -1))
                return { unit: '%', value: isNaN(num) ? defaultValue : num }
            }
            if (str.endsWith('px')) {
                const num = parseFloat(str.slice(0, -2))
                return { unit: 'px', value: isNaN(num) ? defaultValue : num }
            }
            // If plain number (user may omit unit), treat as px by default
            const num = parseFloat(str)
            if (!isNaN(num)) return { unit: defaultUnit, value: num }
            return { unit: defaultUnit, value: defaultValue }
        }

        function initFromProps() {
            const wParsed = parseSize(localProps.value.width ?? '600px', { defaultUnit: 'px', defaultValue: 600 })
            if (wParsed.unit === 'auto') {
                widthUnit.value = 'auto'
                widthValue.value = 600
            } else {
                widthUnit.value = wParsed.unit === '%' ? '%' : 'px'
                widthValue.value = clamp(wParsed.value || 0, 0, widthUnit.value === '%' ? 100 : Number.POSITIVE_INFINITY)
            }

            const hParsed = parseSize(localProps.value.height ?? '400px', { defaultUnit: 'px', defaultValue: 400 })
            if (hParsed.unit === 'auto') {
                heightUnit.value = 'auto'
                heightValue.value = 400
            } else {
                heightUnit.value = hParsed.unit === '%' ? '%' : 'px'
                heightValue.value = clamp(hParsed.value || 0, 0, heightUnit.value === '%' ? 100 : Number.POSITIVE_INFINITY)
            }
        }

        // init
        initFromProps()

        const emitUpdate = () => {
            // compose width string
            if (widthUnit.value === 'auto') {
                localProps.value.width = 'auto'
            } else {
                const wVal = widthUnit.value === '%' ? clamp(widthValue.value, 0, 100) : Math.max(0, Number(widthValue.value) || 0)
                localProps.value.width = widthUnit.value === '%' ? `${wVal}%` : `${wVal}px`
            }

            // compose height string
            if (heightUnit.value === 'auto') {
                localProps.value.height = 'auto'
            } else {
                const hVal = heightUnit.value === '%' ? clamp(heightValue.value, 0, 100) : Math.max(0, Number(heightValue.value) || 0)
                localProps.value.height = heightUnit.value === '%' ? `${hVal}%` : `${hVal}px`
            }

            emit('update', { ...localProps.value })
        }

        const handleUpload = async () => {
            if (!props.onUpload) return

            // optionally open a file dialog
            const file = await pickFileOptional() // returns File or null

            const result = await props.onUpload(file, {
                id: props.block.id,
                type: props.block.type,
            })

            if (result?.url) localProps.value.url = result.url
            if (result?.meta) localProps.value.meta = result.meta
            emitUpdate()
        }

        // helper: optional picker
        function pickFileOptional() {
            return new Promise(resolve => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*' // adjust per use-case
                input.onchange = () => resolve(input.files?.[0] || null)
                input.click()
            })
        }

        watch(() => props.block.properties, (newProps) => {
            localProps.value = {
                url: '',
                alt: '',
                width: '600px',
                height: '400px',
                link: '',
                align: 'center',
                margin: { top: '0px', right: '0px', bottom: '16px', left: '0px' },
                ...newProps
            }
            initFromProps()
        }, { deep: true })

        return { localProps, emitUpdate, handleUpload, widthUnit, widthValue, heightUnit, heightValue }
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

/* New size controls */
.size-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
/* When percent is selected, stack the unit dropdown on top and show slider + value on the next row */
.size-row.stacked {
    flex-direction: column;
    align-items: stretch;
}
.size-row.stacked .unit-select {
    flex: 0 0 auto;
    width: 100%;
}
.unit-select {
    flex: 0 0 110px;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 13px;
    background: #fff;
}
.size-input {
    flex: 1 1 auto;
}
.percent-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}
.percent-wrap input[type="range"] {
    flex: 1 1 auto;
}
.unit-label {
    color: #6b7280;
    font-size: 12px;
}
</style>
