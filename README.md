# Email Builder

A simplistic Vue 3 drag-and-drop email builder component for crafting production-ready HTML emails with inline styles. 
The name suggests that it's more than just a drag-and-drop email builder, this is intended as I plan to add more content 
builders and features in the future.

## Features

- **Drag & Drop Interface** - Intuitive builder similar to Unlayer
- **Content Blocks** - Button, Divider, Heading, Paragraph, Image, Video, Social, Table
- **Layout Blocks** - Multiple column layouts (1, 2, 3, 4 columns with various ratios)
- **Inline Editing** - Edit text content directly on the canvas with formatting toolbar
- **Properties Panel** - Detailed property controls for each block type
- **Responsive Design** - Email-optimized with inline styles
- **JSON Import/Export** - Save and load email templates
- **HTML Export** - Production-ready HTML with email client compatibility
- **Basic Theming** - Customizable primary color for the interface
- **Upload Callback** - Integrate your own image upload handler
- **Variables** - Add dynamic variables to your email templates

## Installation

```bash
npm install @riggerz29/content-builder
```

## Usage

### Basic Example

```vue
<template>
  <EmailBuilder
    :v-model="data"
    :primary-color="#2f4574"
    :on-upload="handleUpload"
    :variables="variables"
    @export-json="handleExportJSON"
    @export-html="handleExportHTML"
    @change="handleChange"
  />
</template>

<script>
import { ref } from 'vue'
import EmailBuilder from '@riggerz29/content-builder'

export default {
  components: {
    EmailBuilder
  },
  setup() {
    const data = ref({ json: {
      blocks: [],
      bodySettings: {
        backgroundColor: '#f3f4f6',
        textColor: '#000000',
        linkColor: '#2f4574',
        contentWidth: 600,
        contentAlignment: 'center',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        preheaderText: ''
      }
    }, html: '' })

    const handleUpload = async (file, blockData) => {
      const blockId = blockData.id
      const blockType = blockData?.type || null
      // Upload to your server and return the URL
      const formData = new FormData()
      formData.append('image', file)
      formData.append('blockId', blockId)
      formData.append('blockType', blockType)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      return { url: data.url, meta: data?.meta || {} }
    }

    const handleExportJSON = (data) => {
      console.log('JSON:', data)
      // Save to database or download
    }

    const handleExportHTML = (html) => {
      console.log('HTML:', html)
      // Use in your email campaign
    }

    const handleChange = (data) => {
      // Auto-save functionality or other logic
    }

    const variables = ref([
      {name: 'First name', format: '$$first_name$$'},
      {name: 'Last name', format: '$$last_name$$'},
      {name: 'Title', format: '$$title$$'},
    ])

    return {
      data, 
      handleUpload,
      handleExportJSON,
      handleExportHTML,
      handleChange, 
      variables
    }
  }
}
</script>
```

## Props

| Prop               | Type             | Default                                              | Description                                                                                            |
|--------------------|------------------|------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `modelValue`       | Object           | `{ json: { blocks: [], bodySettings: {} }, html: ''}` | v-model data                                                                                           |
| `primaryColor`     | String           | `'#6b7280'`                                          | Primary colour for the UI (panels, buttons, etc.)                                                      |
| `onUpload`         | Function         | `null`                                               | Callback function for handling image/video uploads                                                     |
| `variables`        | [Object, Array]  | `[]`                                                 | A list of variables to use in text blocks `[{ label, format }]`                                        |
| `displayAsModal`   | Boolean          | `false`                                              | Display the builder as a modal                                                                         |
| `hideToolbarActions` | Boolean        | `false`                                              | Hide the default toolbar actions container (or override with `actions` slot to provide custom content) |
| `hideExportJson`   | Boolean          | `false`                                              | Hide the default "Export JSON" button (only affects the default toolbar actions)                       |
| `hideExportHtml`   | Boolean          | `false`                                              | Hide the default "Export HTML" button (only affects the default toolbar actions)                       |

## Events

| Event | Payload                                                          | Description |
|-------|------------------------------------------------------------------|-------------|
| `export-json` | `{ blocks: Array, bodySettings: Object }`                        | Emitted when Export JSON is clicked |
| `export-html` | `String`                                                         | Emitted when Export HTML is clicked |
| `change` | `{ blocks: Array, bodySettings: Object }`                        | Emitted whenever the email content changes |
 | `update:modelValue` | `{ json: { blocks: Array, bodySettings: Object }, html: String}` | Emitted whenever the email content changes |

## Slots

| Slot name | Scope | Description |
|-----------|-------|-------------|
| `actions` | none  | Replaces the top toolbar actions area. Use to add your own buttons/controls. Combine with `hideToolbarActions`, `hideExportJson`, and `hideExportHtml` to control which default buttons are shown. |

## Exposed Functions

| Function | Description                                            |
|--------|--------------------------------------------------------|
| `exportJSON` | Returns the email build JSON and emits export-json     |
| `exportHTML` | Returns the HTML email content and emits export-html   |
| `open` | Opens the email modal if displayAsModal prop is true   |
| `close` | Closes the email modal if displayAsModal prop is true  |
| `toggle` | Toggles the email modal if displayAsModal prop is true |

### Example: Custom toolbar actions

```vue
<template>
  <EmailBuilder
    v-model="data"
    :hide-toolbar-actions="true"
  >
    <template #actions>
      <div class="toolbar__actions">
        <button @click="saveDraft" class="toolbar__btn">
          <Icon name="save" :size="16" />
          <span>Save Draft</span>
        </button>
        <button @click="preview" class="toolbar__btn">
          <Icon name="eye" :size="16" />
          <span>Preview</span>
        </button>
      </div>
    </template>
  </EmailBuilder>
</template>
```

## Content Blocks

### Button
- Text, URL, colors, fonts, padding, border radius, alignment
- Inline editing for text and formatting

### Heading
- H1-H6 levels, text, fonts, colors, line height, letter spacing
- Inline editing with formatting toolbar

### Paragraph
- Text, fonts, colors, line height, letter spacing, alignment
- Inline editing with formatting toolbar including lists

### Image
- URL, alt text, dimensions, link, alignment
- Upload callback integration

### Divider
- Width, height, color, alignment

### Video
- Video URL, thumbnail, dimensions, alignment
- Upload callback for thumbnail

### Social
- Platform icons (Facebook, x, Instagram, LinkedIn, YouTube, Pinterest)
- Icon size, spacing, alignment
- Add/remove icons

### Table
- Rows and cells, borders, padding, colors, font size

## Layout Blocks

- **1 Column** (100%)
- **2 Columns** (50/50, 33/67, 67/33)
- **3 Columns** (33/33/33)
- **4 Columns** (25/25/25/25, 17/33/17/33, 33/17/33/17)

Columns can contain any content blocks and support nested layouts.

## JSON Structure

```json
{
  "blocks": [
    {
      "id": 1634567890123,
      "type": "heading",
      "properties": {
        "text": "Welcome!",
        "level": "h2",
        "fontSize": 28,
        "fontFamily": "Arial, sans-serif",
        "fontWeight": "bold",
        "color": "#000000",
        "lineHeight": 1.4,
        "letterSpacing": 0,
        "align": "center",
        "margin": { "top": 20, "right": 0, "bottom": 10, "left": 0 },
        "padding": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
      }
    }
  ],
  "bodySettings": {
    "backgroundColor": "#f3f4f6",
    "textColor": "#000000",
    "linkColor": "#2f4574",
    "contentWidth": 600,
    "contentAlignment": "center",
    "fontFamily": "Arial, sans-serif",
    "fontWeight": "normal",
    "preheaderText": "Preview text for email clients"
  }
}
```

## HTML Export

The exported HTML is production-ready with:
- Inline styles for maximum email client compatibility
- Table-based layout for reliability
- DOCTYPE and meta tags for proper rendering
- Responsive images
- Support for Outlook, Gmail, Apple Mail, etc.

## Development

```bash
# Install dependencies
npm install

# Run demo in development mode
npm run dev

# Build the package
npm run build
```

## Demo

Run the included demo to see the email builder in action:

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
