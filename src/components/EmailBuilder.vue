<template>
    <div class="email-builder" :style="cssVars">
        <!-- Top Toolbar -->
        <div class="email-builder__toolbar">
            <div class="toolbar__actions">
                <button @click="exportJSON" class="toolbar__btn">
                    <Icon name="download" :size="16" />
                    <span>Export JSON</span>
                </button>
                <button @click="exportHTML" class="toolbar__btn">
                    <Icon name="code" :size="16" />
                    <span>Export HTML</span>
                </button>
            </div>
        </div>

        <div class="email-builder__main">
            <!-- Right Sidebar - Tools & Properties -->
            <div class="email-builder__sidebar">
                <!-- Menu Tabs -->
                <div class="sidebar__tabs">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id, selectedBlock = null"
                        :class="['tab__btn', { 'tab__btn--active': activeTab === tab.id }]"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Content Tab -->
                <div v-if="activeTab === 'content' && !selectedBlock" class="sidebar__content">
                    <div class="content__section">
                        <h3 class="section__title">Content Blocks</h3>
                        <div class="content__items">
                            <div
                                v-for="block in contentBlocks"
                                :key="block.type"
                                class="content__item"
                                draggable="true"
                                @dragstart="onDragStart($event, block)"
                            >
                                <div class="item__icon">
                                    <Icon :name="block.icon" :size="24" :stroke-width="2" />
                                </div>
                                <div class="item__label">{{ block.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Blocks Tab -->
                <div v-if="activeTab === 'blocks' && !selectedBlock" class="sidebar__content">
                    <div class="content__section">
                        <h3 class="section__title">Layout Blocks</h3>
                        <div class="content__items">
                            <div
                                v-for="block in layoutBlocks"
                                :key="block.type"
                                class="content__item"
                                draggable="true"
                                @dragstart="onDragStart($event, block)"
                            >
                                <div class="item__layout">{{ block.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Body Tab -->
                <div v-if="activeTab === 'body' && !selectedBlock" class="sidebar__content">
                    <div class="content__section">
                        <h3 class="section__title">Body Settings</h3>

                        <div class="properties__group">
                            <label>Background Color</label>
                            <div class="input-with-color">
                                <input v-model="bodySettings.backgroundColor" type="color" class="color-input" />
                                <input v-model="bodySettings.backgroundColor" type="text" class="color-text" />
                            </div>
                        </div>

                        <div class="properties__group">
                            <label>Text Color</label>
                            <div class="input-with-color">
                                <input v-model="bodySettings.textColor" type="color" class="color-input" />
                                <input v-model="bodySettings.textColor" type="text" class="color-text" />
                            </div>
                        </div>

                        <div class="properties__group">
                            <label>Link Color</label>
                            <div class="input-with-color">
                                <input v-model="bodySettings.linkColor" type="color" class="color-input" />
                                <input v-model="bodySettings.linkColor" type="text" class="color-text" />
                            </div>
                        </div>

                        <div class="properties__group">
                            <label>Content Width (px)</label>
                            <input v-model.number="bodySettings.contentWidth" type="number" min="320" max="800" />
                        </div>

                        <div class="properties__group">
                            <label>Content Alignment</label>
                            <select v-model="bodySettings.contentAlignment">
                                <option value="center">Center</option>
                                <option value="left">Left</option>
                            </select>
                        </div>

                        <div class="properties__group">
                            <label>Font Family</label>
                            <select v-model="bodySettings.fontFamily">
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="'Courier New', monospace">Courier New</option>
                                <option value="Verdana, sans-serif">Verdana</option>
                                <option value="'Times New Roman', serif">Times New Roman</option>
                                <option value="Helvetica, sans-serif">Helvetica</option>
                                <option value="Tahoma, sans-serif">Tahoma</option>
                            </select>
                        </div>

                        <div class="properties__group">
                            <label>Font Weight</label>
                            <select v-model="bodySettings.fontWeight">
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                                <option value="300">Light (300)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semi-Bold (600)</option>
                            </select>
                        </div>

                        <div class="properties__group">
                            <label>Preheader Text</label>
                            <textarea
                                v-model="bodySettings.preheaderText"
                                rows="3"
                                placeholder="Preview text that appears in email client..."
                                class="preheader-input"
                            ></textarea>
                            <small class="input-hint">This text appears in email previews but is hidden in the email body</small>
                        </div>
                    </div>
                </div>

                <!-- Properties Panel -->
                <div v-if="selectedBlock" class="sidebar__properties">
                    <div class="properties__header">
                        <h3>Properties</h3>
                        <button @click="selectedBlock = null" class="btn--close">×</button>
                    </div>
                    <component
                        :is="getPropertiesComponent(selectedBlock.type)"
                        :block="selectedBlock"
                        :on-upload="onUpload"
                        :variables="variables"
                        @update="updateBlockProperties"
                    />
                </div>
            </div>

            <!-- Canvas -->
            <div class="email-builder__canvas" :style="canvasStyle">
                <div
                    class="canvas__container"
                    :style="canvasContainerStyle"
                    @drop="onDrop($event, null)"
                    @dragover.prevent
                    @click="selectedBlock = null"
                >
                    <template v-if="blocks.length === 0">
                        <div class="canvas__placeholder">
                            <p>Drag content blocks here to start building your email</p>
                        </div>
                    </template>

                    <component
                        v-for="(block, index) in blocks"
                        :key="block.id"
                        :is="getBlockComponent(block?.type)"
                        :block="block"
                        :index="index"
                        :is-selected="selectedBlock && selectedBlock.id === block.id"
                        :selected-block-id="selectedBlock ? selectedBlock.id : null"
                        :variables="variables"
                        @select="selectBlock(block)"
                        @child-select="selectBlock($event)"
                        @update="updateBlock($event)"
                        @delete="deleteBlock($event)"
                        @copy="copyBlock($event)"
                        @move-up="moveBlockUp($event)"
                        @move-down="moveBlockDown($event)"
                        @drop="onDrop($event, index)"
                        @column-drop="handleColumnDrop"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Icon from './common/Icon.vue'
import ButtonBlock from './blocks/ButtonBlock.vue'
import DividerBlock from './blocks/DividerBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import ParagraphBlock from './blocks/ParagraphBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import VideoBlock from './blocks/VideoBlock.vue'
import SocialBlock from './blocks/SocialBlock.vue'
import TableBlock from './blocks/TableBlock.vue'
import RowBlock from './blocks/RowBlock.vue'
import ButtonProperties from './properties/ButtonProperties.vue'
import DividerProperties from './properties/DividerProperties.vue'
import HeadingProperties from './properties/HeadingProperties.vue'
import ParagraphProperties from './properties/ParagraphProperties.vue'
import ImageProperties from './properties/ImageProperties.vue'
import VideoProperties from './properties/VideoProperties.vue'
import SocialProperties from './properties/SocialProperties.vue'
import TableProperties from './properties/TableProperties.vue'
import RowProperties from './properties/RowProperties.vue'
import { generateHTML } from '../utils/htmlGenerator'

export default {
    name: 'EmailBuilder',
    components: {
        Icon,
        ButtonBlock,
        DividerBlock,
        HeadingBlock,
        ParagraphBlock,
        ImageBlock,
        VideoBlock,
        SocialBlock,
        TableBlock,
        RowBlock,
        ButtonProperties,
        DividerProperties,
        HeadingProperties,
        ParagraphProperties,
        ImageProperties,
        VideoProperties,
        SocialProperties,
        TableProperties,
        RowProperties
    },
    props: {
        primaryColor: {
            type: String,
            default: '#2f4574'
        },
        onUpload: {
            type: Function,
            default: null
        },
        modelValue: {
            type: Object,
            default: () => ({ json: {}, html: '' })
        },
        // a dictionary of variables {name, format} i.e { label: First Name, format: $$first_name$$ }
        // in back end you can replace $$first_name$$ in HTML with the real first name value
        // you do not need to add $$ before and after the variable name this is just an
        // example, use something you can use to easily find and replace
        variables: {
            type: [Array, Object],
            default: () => ([]) // preferably {label, format}
        }
    },
    emits: ['export-json', 'export-html', 'change', 'update:modelValue'],
    setup(props, { emit }) {
        const activeTab = ref('content')
        const selectedBlock = ref(null)
        const isSyncingFromParent = ref(false)

        // Defaults used when no JSON is provided via v-model
        const defaultBodySettings = {
            backgroundColor: '#f3f4f6',
            textColor: '#000000',
            linkColor: props.primaryColor || '#2f4574',
            contentWidth: 600,
            contentAlignment: 'center',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            preheaderText: ''
        }

        const incomingJson = props.modelValue?.json || {}
        const isEmptyJson = !incomingJson || Object.keys(incomingJson).length === 0

        const blocks = ref(isEmptyJson ? [] : (incomingJson.blocks || []))
        const bodySettings = ref({
            ...defaultBodySettings,
            ...(isEmptyJson ? {} : (incomingJson.bodySettings || {}))
        })

        const tabs = [
            { id: 'content', label: 'Content' },
            { id: 'blocks', label: 'Blocks' },
            { id: 'body', label: 'Body' }
        ]

        const contentBlocks = [
            { type: 'button', label: 'Button', icon: 'square' },
            { type: 'divider', label: 'Divider', icon: 'minus' },
            { type: 'heading', label: 'Heading', icon: 'type' },
            { type: 'paragraph', label: 'Paragraph', icon: 'alignLeft' },
            { type: 'image', label: 'Image', icon: 'image' },
            { type: 'video', label: 'Video', icon: 'video' },
            { type: 'social', label: 'Social', icon: 'users' },
            { type: 'table', label: 'Table', icon: 'table' }
        ]

        const layoutBlocks = [
            { type: 'row', label: '1 Column', columns: [{ width: 100 }] },
            { type: 'row', label: '2 Columns 50/50', columns: [{ width: 50 }, { width: 50 }] },
            { type: 'row', label: '3 Columns 33/33/33', columns: [{ width: 33.33 }, { width: 33.33 }, { width: 33.34 }] },
            { type: 'row', label: '4 Columns 25/25/25/25', columns: [{ width: 25 }, { width: 25 }, { width: 25 }, { width: 25 }] },
            { type: 'row', label: '2 Columns 33/67', columns: [{ width: 33.33 }, { width: 66.67 }] },
            { type: 'row', label: '2 Columns 67/33', columns: [{ width: 66.67 }, { width: 33.33 }] },
            { type: 'row', label: '4 Columns 17/33/17/33', columns: [{ width: 17 }, { width: 33 }, { width: 17 }, { width: 33 }] },
            { type: 'row', label: '4 Columns 33/17/33/17', columns: [{ width: 33 }, { width: 17 }, { width: 33 }, { width: 17 }] }
        ]

        const cssVars = computed(() => ({
            '--primary-color': props.primaryColor
        }))

        const canvasStyle = computed(() => ({
            backgroundColor: bodySettings.value.backgroundColor,
            justifyContent: bodySettings.value.contentAlignment === 'center' ? 'center' : 'flex-start'
        }))

        const canvasContainerStyle = computed(() => ({
            maxWidth: `${bodySettings.value.contentWidth}px`,
            color: bodySettings.value.textColor,
            fontFamily: bodySettings.value.fontFamily,
            fontWeight: bodySettings.value.fontWeight,
            height: 'fit-content'
        }))

        let draggedBlock = null

        const onDragStart = (event, block) => {
            draggedBlock = block
            event.dataTransfer.effectAllowed = 'copy'
            event.dataTransfer.setData('block-dropped', block);
        }

        const onDrop = (event, insertIndex) => {
            event.preventDefault()
            event.stopPropagation()

            if (!draggedBlock) return

            const newBlock = createBlock(draggedBlock)

            if (insertIndex !== null) {
                blocks.value.splice(insertIndex + 1, 0, newBlock)
            } else {
                blocks.value.push(newBlock)
            }

            draggedBlock = null
            emitChange()
        }

        const handleColumnDrop = (dropInfo) => {
            if (!draggedBlock) return

            // Find the row block
            const rowBlock = _findBlockById(blocks.value, dropInfo.blockId)
            if (!rowBlock || rowBlock.type !== 'row') return

            // Create the new block
            const newBlock = createBlock(draggedBlock)

            // Add to the specified column
            const column = rowBlock.columns[dropInfo.columnIndex]
            if (column) {
                if (dropInfo.insertIndex !== null && dropInfo.insertIndex !== undefined) {
                    column.blocks.splice(dropInfo.insertIndex + 1, 0, newBlock)
                } else {
                    column.blocks.push(newBlock)
                }
            }

            draggedBlock = null
            emitChange()
        }

        const createBlock = (template) => {
            const id = Date.now() + Math.random()

            if (template.type === 'row') {
                return {
                    id,
                    type: 'row',
                    columns: template.columns.map(col => ({
                        width: col.width,
                        blocks: []
                    })),
                    properties: {
                        backgroundColor: 'transparent',
                        padding: { top: 10, right: 0, bottom: 10, left: 0 }
                    }
                }
            }

            const defaults = {
                button: {
                    text: 'Click Here',
                    url: '#',
                    backgroundColor: '#2f4574',
                    textColor: '#ffffff',
                    fontSize: 16,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    textDecoration: 'none',
                    borderRadius: 4,
                    padding: { top: 12, right: 24, bottom: 12, left: 24 },
                    margin: { top: 10, right: 0, bottom: 10, left: 0 },
                    align: 'center',
                    fullWidth: false
                },
                divider: {
                    width: 100,
                    height: 1,
                    color: '#e5e7eb',
                    align: 'center',
                    margin: { top: 10, right: 0, bottom: 10, left: 0 }
                },
                heading: {
                    text: 'Heading Text',
                    level: 'h2',
                    fontSize: 28,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'bold',
                    color: '#000000',
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    align: 'left',
                    margin: { top: 10, right: 0, bottom: 10, left: 0 },
                    padding: { top: 0, right: 0, bottom: 0, left: 0 }
                },
                paragraph: {
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    fontSize: 14,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    color: '#000000',
                    lineHeight: 1.6,
                    letterSpacing: 0,
                    align: 'left',
                    margin: { top: 10, right: 0, bottom: 10, left: 0 },
                    padding: { top: 0, right: 0, bottom: 0, left: 0 }
                },
                image: {
                    url: 'https://dummyimage.com/600x300/cccccc/fff&text=Add+Image/600x300',
                    alt: 'Image',
                    width: '100%',
                    height: 'auto',
                    link: '',
                    align: 'center',
                    margin: { top: 10, right: 0, bottom: 10, left: 0 },
                    meta: {}
                },
                video: {
                    url: '',
                    thumbnailUrl: 'https://dummyimage.com/600x300/cccccc/fff&text=Add+Image/600x300',
                    width: '100%',
                    align: 'center',
                    margin: { top: 10, right: 0, bottom: 10, left: 0 }
                },
                social: {
                    icons: [
                        { platform: 'facebook', url: '#' },
                        { platform: 'x', url: '#' },
                        { platform: 'instagram', url: '#' },
                        { platform: 'linkedin', url: '#' }
                    ],
                    iconSize: 32,
                    iconSpacing: 10,
                    align: 'center',
                    margin: { top: 10, right: 0, bottom: 10, left: 0 }
                },
                table: {
                    rows: [
                        { cells: ['Cell 1', 'Cell 2'] },
                        { cells: ['Cell 3', 'Cell 4'] }
                    ],
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    cellPadding: 10,
                    backgroundColor: '#ffffff',
                    textColor: '#000000',
                    fontSize: 14,
                    margin: { top: 10, right: 0, bottom: 10, left: 0 }
                }
            }

            return {
                id,
                type: template.type,
                properties: defaults[template.type] || {}
            }
        }

        const getBlockComponent = (type) => {
            const components = {
                button: 'ButtonBlock',
                divider: 'DividerBlock',
                heading: 'HeadingBlock',
                paragraph: 'ParagraphBlock',
                image: 'ImageBlock',
                video: 'VideoBlock',
                social: 'SocialBlock',
                table: 'TableBlock',
                row: 'RowBlock'
            }
            return components[type] || 'div'
        }

        const getPropertiesComponent = (type) => {
            const components = {
                button: 'ButtonProperties',
                divider: 'DividerProperties',
                heading: 'HeadingProperties',
                paragraph: 'ParagraphProperties',
                image: 'ImageProperties',
                video: 'VideoProperties',
                social: 'SocialProperties',
                table: 'TableProperties',
                row: 'RowProperties'
            }
            return components[type] || null
        }

        const selectBlock = (block) => {
            selectedBlock.value = block
        }

        const updateBlock = (id, properties) => {
            const block = _findBlockById(blocks.value, id)
            if (block) {
                block.properties = { ...block.properties, ...properties }
                emitChange()
            }
        }

        const updateBlockProperties = (properties) => {
            if (selectedBlock.value) {
                selectedBlock.value.properties = { ...selectedBlock.value.properties, ...properties }
                emitChange()
            }
        }

        const deleteBlock = (id) => {
            // try top-level first (in-place)
            const topIndex = _findBlockIndex(blocks.value, id)
            if (topIndex !== -1) {
                blocks.value.splice(topIndex, 1)
            } else {
                // remove from nested rows in-place
                _removeFromRowsInPlace(blocks.value, id)
            }
            if (selectedBlock.value && selectedBlock.value.id === id) {
                selectedBlock.value = null
            }
            emitChange()
        }

        const copyBlock = (id) => {
            const block = _findBlockById(blocks.value, id)
            if (block) {
                const copied = JSON.parse(JSON.stringify(block))
                copied.id = Date.now() + Math.random()
                const index = _findBlockIndex(blocks.value, id)
                blocks.value.splice(index + 1, 0, copied)
                emitChange()
            }
        }

        const moveBlockUp = (id) => {
            const index = _findBlockIndex(blocks.value, id)
            if (index > 0) {
                const temp = blocks.value[index]
                blocks.value[index] = blocks.value[index - 1]
                blocks.value[index - 1] = temp
                emitChange()
            }
        }

        const moveBlockDown = (id) => {
            const index = _findBlockIndex(blocks.value, id)
            if (index < blocks.value.length - 1) {
                const temp = blocks.value[index]
                blocks.value[index] = blocks.value[index + 1]
                blocks.value[index + 1] = temp
                emitChange()
            }
        }

        const _removeFromRowsInPlace = (list, id) => {
            for (const block of list) {
                if (block.type === 'row' && block.columns) {
                    for (const column of block.columns) {
                        const idx = column.blocks.findIndex(b => b.id === id)
                        if (idx !== -1) {
                            column.blocks.splice(idx, 1)
                            return true
                        }
                        if (_removeFromRowsInPlace(column.blocks, id)) return true
                    }
                }
            }
            return false
        }

        const _findBlockById = (blockList, id) => {
            for (const block of blockList) {
                if (block.id === id) return block
                if (block.type === 'row' && block.columns) {
                    for (const column of block.columns) {
                        const found = _findBlockById(column.blocks, id)
                        if (found) return found
                    }
                }
            }
            return null
        }

        const _findBlockIndex = (blockList, id) => {
            return blockList.findIndex(block => block.id === id)
        }

        const exportJSON = () => {
            const data = {
                blocks: blocks.value,
                bodySettings: bodySettings.value
            }
            emit('export-json', data)
        }

        const exportHTML = () => {
            const html = generateHTML(blocks.value, bodySettings.value)
            emit('export-html', html)
        }

        const emitChange = () => {
            const json = {
                blocks: blocks.value,
                bodySettings: bodySettings.value
            }
            const html = generateHTML(blocks.value, bodySettings.value)

            // Legacy event with JSON only
            emit('change', json)

            // v-model event returns both JSON and HTML
            emit('update:modelValue', { json, html })
        }

        // When parent updates v-model, sync internal state. If json is empty, use defaults.
        watch(() => props.modelValue, async (newVal) => {
            isSyncingFromParent.value = true
            const incoming = newVal?.json || {}
            const isEmpty = !incoming || Object.keys(incoming).length === 0
            blocks.value = isEmpty ? [] : (incoming.blocks || [])
            bodySettings.value = {
                ...defaultBodySettings,
                ...(isEmpty ? {} : (incoming.bodySettings || {}))
            }
            await nextTick()
            isSyncingFromParent.value = false
        }, { deep: true })

        // Always keep v-model in sync when user edits blocks or body settings
        watch([blocks, bodySettings], () => {
            if (isSyncingFromParent.value) return
            emitChange()
        }, { deep: true })

        // Emit initial value so v-model receives defaults-derived JSON+HTML
        onMounted(() => {
            emitChange()
        })

        return {
            activeTab,
            selectedBlock,
            blocks,
            bodySettings,
            tabs,
            contentBlocks,
            layoutBlocks,
            cssVars,
            canvasStyle,
            canvasContainerStyle,
            onDragStart,
            onDrop,
            handleColumnDrop,
            getBlockComponent,
            getPropertiesComponent,
            selectBlock,
            updateBlock,
            updateBlockProperties,
            deleteBlock,
            copyBlock,
            moveBlockUp,
            moveBlockDown,
            exportJSON,
            exportHTML
        }
    }
}
</script>

<style scoped>
.email-builder {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f9fafb;
}

.email-builder__toolbar {
    background: var(--primary-color);
    color: white;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.toolbar__actions {
    display: flex;
    gap: 10px;
}

.toolbar__btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
}

.toolbar__btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.email-builder__main {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.email-builder__sidebar {
    width: 320px;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar__tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
}

.tab__btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    border-bottom: 2px solid transparent;
}

.tab__btn--active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background: white;
}

.sidebar__content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.content__section {
    margin-bottom: 20px;
}

.section__title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #374151;
}

.content__items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.content__item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    cursor: move;
    text-align: center;
    transition: all 0.2s;
}

.content__item:hover {
    background: #f3f4f6;
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

.item__icon {
    font-size: 24px;
    margin-bottom: 8px;
}

.item__label {
    font-size: 12px;
    color: #374151;
    font-weight: 500;
}

.item__layout {
    font-size: 11px;
    color: #374151;
    font-weight: 500;
}

.sidebar__properties {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.properties__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.properties__header h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
}

.btn--close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 24px;
    height: 24px;
}

.btn--close:hover {
    color: #374151;
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
.properties__group select,
.properties__group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 13px;
}

.input-with-color {
    display: flex;
    gap: 8px;
    align-items: center;
}

.color-input {
    width: 50px;
    height: 36px;
    padding: 2px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
}

.color-text {
    flex: 1;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 13px;
    font-family: monospace;
}

.preheader-input {
    resize: vertical;
    min-height: 60px;
}

.input-hint {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
    font-style: italic;
}

.email-builder__canvas {
    flex: 1;
    overflow-y: auto;
    padding: 40px;
    display: flex;
    justify-content: center;
}

.canvas__container {
    width: 100%;
    max-width: 600px;
    background: white;
    min-height: 800px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.canvas__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #9ca3af;
    text-align: center;
    padding: 40px;
}

.canvas__placeholder p {
    font-size: 16px;
}
</style>
