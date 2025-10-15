<template>
  <div class="demo-wrapper">
    <EmailBuilder
      :initial-data="initialData"
      :primary-color="primaryColor"
      :on-upload="handleUpload"
      @export-json="handleExportJSON"
      @export-html="handleExportHTML"
      @change="handleChange"
    />

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

export default {
  name: 'DemoApp',
  components: {
    EmailBuilder
  },
  setup() {
    const primaryColor = ref('#6b7280')
    const initialData = ref({
      blocks: [],
      bodySettings: {
        backgroundColor: '#f3f4f6',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif'
      }
    })

    const exportModal = ref({
      show: false,
      type: 'json',
      content: ''
    })

    const handleUpload = async (file) => {
      // This is where you would implement your upload logic
      // For demo purposes, we'll just return a data URL
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.readAsDataURL(file)
      })
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

    return {
      primaryColor,
      initialData,
      exportModal,
      handleUpload,
      handleExportJSON,
      handleExportHTML,
      handleChange,
      closeModal,
      copyToClipboard,
      downloadFile
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
  background: #3b82f6;
  color: white;
}

.btn-download:hover {
  background: #2563eb;
}
</style>
