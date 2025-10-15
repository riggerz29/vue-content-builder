# Email Builder - Usage Guide

## Quick Start

### 1. Installation

```bash
npm install @riggerz29/email-builder
```

### 2. Import and Use

```vue
<template>
  <div id="app">
    <EmailBuilder
      :initial-data="emailData"
      :primary-color="primaryColor"
      :on-upload="handleUpload"
      @export-json="onExportJSON"
      @export-html="onExportHTML"
      @change="onChange"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import EmailBuilder from '@riggerz29/email-builder'

export default {
  components: {
    EmailBuilder
  },
  setup() {
    const primaryColor = ref('#3b82f6')
    const emailData = ref({
      blocks: [],
      bodySettings: {
        backgroundColor: '#f3f4f6',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif'
      }
    })

    const handleUpload = async (file) => {
      // Implement your upload logic
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      return data.url // Return the uploaded file URL
    }

    const onExportJSON = (data) => {
      console.log('JSON Export:', data)
      // Save to your backend or download
      localStorage.setItem('emailTemplate', JSON.stringify(data))
    }

    const onExportHTML = (html) => {
      console.log('HTML Export:', html)
      // Use in your email campaign
    }

    const onChange = (data) => {
      // Auto-save or track changes
      emailData.value = data
    }

    return {
      primaryColor,
      emailData,
      handleUpload,
      onExportJSON,
      onExportHTML,
      onChange
    }
  }
}
</script>

<style>
@import '@riggerz29/email-builder/dist/email-builder.css';
</style>
```

## Features Overview

### Drag and Drop

1. **Content Blocks** - Drag from the right sidebar onto the canvas:
   - Button
   - Divider
   - Heading
   - Paragraph
   - Image
   - Video
   - Social
   - Table

2. **Layout Blocks** - Create multi-column layouts:
   - 1 Column (100%)
   - 2 Columns (50/50, 33/67, 67/33)
   - 3 Columns (33/33/33)
   - 4 Columns (25/25/25/25, 17/33/17/33, 33/17/33/17)

### Inline Editing

Text-based blocks (Heading, Paragraph, Button) support inline editing:

1. **Double-click** on text to enter edit mode
2. **Inline toolbar** appears with formatting options:
   - Font family selector
   - Font size
   - Bold
   - Italic
   - Underline
   - Text color
   - Alignment
   - Links (paragraph only)
   - Lists (paragraph only)

### Properties Panel

Click any block to show the properties panel on the right:

- **Button**: URL, colors, fonts, padding, border radius, alignment
- **Heading**: Text, level (H1-H6), fonts, colors, line height, letter spacing
- **Paragraph**: Text, fonts, colors, line height, letter spacing
- **Image**: URL, alt text, dimensions, link, alignment, upload
- **Divider**: Width, height, color, alignment
- **Video**: URL, thumbnail, width, alignment
- **Social**: Icons (add/remove), size, spacing, alignment
- **Table**: Borders, padding, colors, font size
- **Row**: Background color, padding

### Block Actions

When a block is selected, action buttons appear:

- **📋 Copy** - Duplicate the block
- **↑ Move Up** - Move block up in the order
- **↓ Move Down** - Move block down in the order
- **🗑 Delete** - Remove the block

## Advanced Usage

### Loading a Template

```javascript
import templateData from './example-template.json'

const emailData = ref(templateData)
```

### Custom Upload Handler

```javascript
const handleUpload = async (file) => {
  // Upload to AWS S3
  const { url } = await uploadToS3(file)
  return url

  // Or use Cloudinary
  const { secure_url } = await uploadToCloudinary(file)
  return secure_url

  // Or convert to base64 for preview (not recommended for production)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}
```

### Customizing Colors

```vue
<EmailBuilder
  :primary-color="#10b981"
  :initial-data="emailData"
/>
```

The primary color controls:
- Toolbar background
- Tab active state
- Selected block outline
- Active buttons
- Hover states

### Exporting for Different Use Cases

#### Save to Database

```javascript
const onExportJSON = async (data) => {
  await fetch('/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'My Email Template',
      data: data
    })
  })
}
```

#### Send Email Campaign

```javascript
const onExportHTML = async (html) => {
  await fetch('/api/campaigns/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: 'Newsletter',
      html: html,
      recipients: ['user@example.com']
    })
  })
}
```

#### Download as File

```javascript
const onExportHTML = (html) => {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'email-template.html'
  a.click()
  URL.revokeObjectURL(url)
}
```

## Body Settings

Configure overall email appearance in the "Body" tab:

- **Background Color**: Color outside the email content
- **Content Width**: Maximum width of the email (default 600px)
- **Font Family**: Default font for the entire email

## Best Practices

### Email Design

1. **Keep width at 600px** - Most email clients render best at this width
2. **Use web-safe fonts** - Arial, Georgia, Courier New, Verdana, Times New Roman
3. **Inline styles** - The HTML export automatically includes inline styles
4. **Alt text for images** - Always provide descriptive alt text
5. **Test across clients** - Test in Gmail, Outlook, Apple Mail, etc.

### Layout

1. **Use rows for structure** - Create layouts with row blocks
2. **Mobile considerations** - Columns stack on mobile devices
3. **Padding and spacing** - Use consistent margin/padding values
4. **Visual hierarchy** - Use heading levels appropriately

### Performance

1. **Optimize images** - Compress images before upload
2. **Limit nesting** - Avoid deeply nested row structures
3. **Auto-save** - Use the `@change` event to implement auto-save

## Troubleshooting

### Images not displaying

- Ensure images are hosted on a publicly accessible URL
- Use HTTPS URLs for images
- Check CORS settings if uploading from browser

### Email looks different in Outlook

- Outlook uses Word rendering engine
- Avoid advanced CSS (flexbox, grid)
- The exported HTML is optimized for Outlook compatibility

### Styles not applying

- Check that you imported the CSS: `@import '@riggerz29/email-builder/dist/email-builder.css'`
- Ensure Vue 3 is installed
- Check browser console for errors

## Examples

See the `demo/` directory for a complete working example, and `example-template.json` for a sample template.

## Support

For issues and feature requests, please visit: https://github.com/yourorg/email-builder
