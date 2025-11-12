<template>
    <div class="demo-wrapper">
        <EmailBuilder
            v-model="data"
            :primary-color="primaryColor"
            :on-upload="handleUpload"
            :variables="variables"
            @export-json="handleExportJSON"
            @export-html="handleExportHTML"
            @change="handleChange"
        >
            <template #extra-actions>
                <button @click="resetDemoData" class="toolbar__btn">
                    <span>Reset Demo Data</span>
                </button>
            </template>
        </EmailBuilder>

        <!-- Modal for JSON/HTML Export -->
        <div v-if="exportModal.show" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>{{ exportModal.type === 'json' ? 'Export JSON' : 'Export HTML' }}</h2>
                    <button class="btn-close" @click="closeModal">×</button>
                </div>
                <div class="modal-body">
          <textarea
              readonly
              :value="exportModal.content"
              class="export-textarea"
          ></textarea>
                </div>
                <div class="modal-footer">
                    <button @click="copyToClipboard" class="btn-copy">Copy to Clipboard</button>
                    <button @click="downloadFile" class="btn-download">Download</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import EmailBuilder from '../src/components/EmailBuilder.vue'
import Icon from "../src/components/common/Icon.vue";

export default {
    name: 'DemoApp',
    components: {
        Icon,
        EmailBuilder
    },
    setup() {
        const primaryColor = ref('#334570')
        const demoData = {
            "blocks": [
                {
                    "id": 1634567890122,
                    "type": "image",
                    "properties": {
                        "url": "https://dummyimage.com/100x60/cccccc/fff&text=Logo+Here",
                        "alt": "Featured Image",
                        "width": "100px",
                        "height": "60px",
                        "link": "",
                        "align": "center",
                        "margin": { "top": 20, "right": 0, "bottom": 20, "left": 0 }
                    }
                },
                {
                    "id": 1634567890123,
                    "type": "heading",
                    "properties": {
                        "text": "Welcome to Our Newsletter",
                        "level": "h1",
                        "fontSize": 32,
                        "fontFamily": "Arial, sans-serif",
                        "fontWeight": "bold",
                        "color": "#1f2937",
                        "lineHeight": 1.4,
                        "letterSpacing": 0,
                        "align": "center",
                        "margin": { "top": 30, "right": 20, "bottom": 10, "left": 20 },
                        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
                    }
                },
                {
                    "id": 1634567890124,
                    "type": "paragraph",
                    "properties": {
                        "text": "Thank you for subscribing to our newsletter. We're excited to keep you updated with the latest news and offers.",
                        "fontSize": 16,
                        "fontFamily": "Arial, sans-serif",
                        "fontWeight": "normal",
                        "color": "#6b7280",
                        "lineHeight": 1.6,
                        "letterSpacing": 0,
                        "align": "center",
                        "margin": { "top": 10, "right": 20, "bottom": 20, "left": 20 },
                        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
                    }
                },
                {
                    "id": 1634567890125,
                    "type": "image",
                    "properties": {
                        "url": "https://dummyimage.com/600x300/cccccc/fff&text=Featured+Image",
                        "alt": "Featured Image",
                        "width": "100%",
                        "height": "auto",
                        "link": "",
                        "align": "center",
                        "margin": { "top": 20, "right": 0, "bottom": 20, "left": 0 }
                    }
                },
                {
                    "id": 1634567890126,
                    "type": "row",
                    "columns": [
                        {
                            "width": 50,
                            "blocks": [
                                {
                                    "id": 1634567890127,
                                    "type": "heading",
                                    "properties": {
                                        "text": "Feature One",
                                        "level": "h3",
                                        "fontSize": 20,
                                        "fontFamily": "Arial, sans-serif",
                                        "fontWeight": "bold",
                                        "color": "#1f2937",
                                        "lineHeight": 1.4,
                                        "letterSpacing": 0,
                                        "align": "left",
                                        "margin": { "top": 0, "right": 0, "bottom": 10, "left": 0 },
                                        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
                                    }
                                },
                                {
                                    "id": 1634567890128,
                                    "type": "paragraph",
                                    "properties": {
                                        "text": "This is a great feature that will help you achieve your goals.",
                                        "fontSize": 14,
                                        "fontFamily": "Arial, sans-serif",
                                        "fontWeight": "normal",
                                        "color": "#6b7280",
                                        "lineHeight": 1.6,
                                        "letterSpacing": 0,
                                        "align": "left",
                                        "margin": { "top": 0, "right": 0, "bottom": 0, "left": 0 },
                                        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
                                    }
                                }
                            ]
                        },
                        {
                            "width": 50,
                            "blocks": [
                                {
                                    "id": 1634567890129,
                                    "type": "heading",
                                    "properties": {
                                        "text": "Feature Two",
                                        "level": "h3",
                                        "fontSize": 20,
                                        "fontFamily": "Arial, sans-serif",
                                        "fontWeight": "bold",
                                        "color": "#1f2937",
                                        "lineHeight": 1.4,
                                        "letterSpacing": 0,
                                        "align": "left",
                                        "margin": { "top": 0, "right": 0, "bottom": 10, "left": 0 },
                                        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
                                    }
                                },
                                {
                                    "id": 1634567890130,
                                    "type": "paragraph",
                                    "properties": {
                                        "text": "Another amazing feature designed specifically for you.",
                                        "fontSize": 14,
                                        "fontFamily": "Arial, sans-serif",
                                        "fontWeight": "normal",
                                        "color": "#6b7280",
                                        "lineHeight": 1.6,
                                        "letterSpacing": 0,
                                        "align": "left",
                                        "margin": { "top": 0, "right": 0, "bottom": 0, "left": 0 },
                                        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
                                    }
                                }
                            ]
                        }
                    ],
                    "properties": {
                        "backgroundColor": "transparent",
                        "padding": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
                    }
                },
                {
                    "id": 1634567890131,
                    "type": "button",
                    "properties": {
                        "text": "Learn More",
                        "url": "https://example.com",
                        "backgroundColor": "#2f4574",
                        "textColor": "#ffffff",
                        "fontSize": 16,
                        "fontFamily": "Arial, sans-serif",
                        "fontWeight": "bold",
                        "textDecoration": "none",
                        "borderRadius": 6,
                        "padding": { "top": 14, "right": 32, "bottom": 14, "left": 32 },
                        "margin": { "top": 20, "right": 0, "bottom": 20, "left": 0 },
                        "align": "center",
                        "fullWidth": false
                    }
                },
                {
                    "id": 1634567890132,
                    "type": "divider",
                    "properties": {
                        "width": 80,
                        "height": 1,
                        "color": "#e5e7eb",
                        "align": "center",
                        "margin": { "top": 30, "right": 0, "bottom": 30, "left": 0 }
                    }
                },
                {
                    "id": 1634567890133,
                    "type": "social",
                    "properties": {
                        "icons": [
                            { "platform": "facebook", "url": "https://facebook.com" },
                            { "platform": "x", "url": "https://x.com" },
                            { "platform": "instagram", "url": "https://instagram.com" },
                            { "platform": "linkedin", "url": "https://linkedin.com" }
                        ],
                        "iconSize": 32,
                        "iconSpacing": 15,
                        "align": "center",
                        "margin": { "top": 20, "right": 0, "bottom": 30, "left": 0 }
                    }
                }
            ],
            "bodySettings": {
                "backgroundColor": "#f3f4f6",
                "textColor": "#1f2937",
                "linkColor": "#2f4574",
                "contentWidth": 600,
                "contentAlignment": "center",
                "fontFamily": "Arial, sans-serif",
                "fontWeight": "normal",
                "preheaderText": "Thank you for subscribing! Check out our latest updates and exclusive offers."
            }
        };

        const data = ref({ json: demoData, html: ''})

        const exportModal = ref({
            show: false,
            type: 'json',
            content: ''
        })

        const handleUpload = async (file, blockData) => {
            // You will receive the block id and type here in-case you need to do some manipulation in your backend
            const blockId = blockData.id
            const blockType = blockData?.type || null

            console.log('File uploaded:', file);
            console.log('Block Data:', blockData);

            // This is where you would implement your upload logic
            // For demo purposes, we'll just return a data URL
            const result = new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    resolve(e.target.result)
                }
                reader.readAsDataURL(file)
            })

            // return url and meta
            return {
                url: await result,
                meta: {} // maybe the result of streamed S3 upload
            }
        }

        const handleExportJSON = (data) => {
            exportModal.value = {
                show: true,
                type: 'json',
                content: JSON.stringify(data, null, 2)
            }
        }

        const handleExportHTML = (html) => {
            exportModal.value = {
                show: true,
                type: 'html',
                content: html
            }
        }

        const handleChange = (data) => {
            console.log('Email data changed:', data)
        }

        const closeModal = () => {
            exportModal.value.show = false
        }

        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(exportModal.value.content)
                alert('Copied to clipboard!')
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }

        const downloadFile = () => {
            const blob = new Blob([exportModal.value.content], {
                type: exportModal.value.type === 'json' ? 'application/json' : 'text/html'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `email.${exportModal.value.type === 'json' ? 'json' : 'html'}`
            a.click()
            URL.revokeObjectURL(url)
        }

        const variables = ref([
            {name: 'First name', format: '$$first_name$$'},
            {name: 'Last name', format: '$$last_name$$'},
            {name: 'Title', format: '$$title$$'},
        ])

        const resetDemoData = () => {
            data.value = { json: demoData, html: '' }
        }

        return {
            primaryColor,
            data,
            exportModal,
            handleUpload,
            handleExportJSON,
            handleExportHTML,
            handleChange,
            closeModal,
            copyToClipboard,
            downloadFile,
            variables,
            resetDemoData
        }
    }
}
</script>

<style scoped>
.demo-wrapper {
    width: 100%;
    height: 100vh;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
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

.btn-close {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
}

.btn-close:hover {
    color: #374151;
}

.modal-body {
    flex: 1;
    padding: 20px;
    overflow: auto;
}

.export-textarea {
    width: 100%;
    height: 400px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    resize: vertical;
}

.modal-footer {
    display: flex;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    justify-content: flex-end;
}

.btn-copy,
.btn-download {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.btn-copy {
    background: #f3f4f6;
    color: #374151;
}

.btn-copy:hover {
    background: #e5e7eb;
}

.btn-download {
    background: #2f4574;
    color: white;
}

.btn-download:hover {
    background: #2563eb;
}
</style>
