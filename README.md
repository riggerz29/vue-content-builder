# Email Builder

A Vue 3 drag-and-drop email builder component for crafting production-ready HTML emails with inline styles.

## Features

- **Drag & Drop Interface** - Intuitive builder similar to Unlayer
- **Content Blocks** - Button, Divider, Heading, Paragraph, Image, Video, Social, Table
- **Layout Blocks** - Multiple column layouts (1, 2, 3, 4 columns with various ratios)
- **Inline Editing** - Edit text content directly on the canvas with formatting toolbar
- **Properties Panel** - Detailed property controls for each block type
- **Responsive Design** - Email-optimized with inline styles
- **JSON Import/Export** - Save and load email templates
- **HTML Export** - Production-ready HTML with email client compatibility
- **Theming** - Customizable primary color for the interface
- **Upload Callback** - Integrate your own image upload handler

## Installation

```bash
npm install @yourorg/email-builder
```

## Usage

### Basic Example

```vue
<template>
  <EmailBuilder
    :initial-data="emailData"
    :primary-color="#3b82f6"
    :on-upload="handleImageUpload"
    @export-json="handleExportJSON"
    @export-html="handleExportHTML"
    @change="handleChange"
  />
</template>

<script>
import { ref } from 'vue'
import EmailBuilder from '@yourorg/email-builder'

export default {
  components: {
    EmailBuilder
  },
  setup() {
    const emailData = ref({
      blocks: [],
      bodySettings: {
        backgroundColor: '#f3f4f6',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif'
      }
    })

    const handleImageUpload = async (file) => {
      // Upload to your server and return the URL
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      return data.url
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
      // Auto-save functionality
      emailData.value = data
    }

    return {
      emailData,
      handleImageUpload,
      handleExportJSON,
      handleExportHTML,
      handleChange
    }
  }
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | Object | `{ blocks: [], bodySettings: {} }` | Initial email template data |
| `primaryColor` | String | `'#6b7280'` | Primary color for the UI (panels, buttons, etc.) |
| `onUpload` | Function | `null` | Callback function for handling image/video uploads |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `export-json` | `{ blocks: Array, bodySettings: Object }` | Emitted when Export JSON is clicked |
| `export-html` | `String` | Emitted when Export HTML is clicked |
| `change` | `{ blocks: Array, bodySettings: Object }` | Emitted whenever the email content changes |

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
- Platform icons (Facebook, Twitter, Instagram, LinkedIn, YouTube, Pinterest)
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
    "contentWidth": 600,
    "fontFamily": "Arial, sans-serif"
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
