# Getting Started with Email Builder

## What is Email Builder?

Email Builder is a Vue 3 component package that provides a full-featured drag-and-drop email builder interface, similar to Unlayer. It allows you to create beautiful, responsive HTML emails with a visual editor.

## Key Features

✅ **Drag & Drop Interface** - Intuitive builder with visual feedback
✅ **8 Content Blocks** - Button, Divider, Heading, Paragraph, Image, Video, Social, Table
✅ **8 Layout Options** - Flexible column layouts from 1 to 4 columns
✅ **Inline Editing** - Edit text directly on canvas with formatting toolbar
✅ **Properties Panel** - Detailed controls for each block type
✅ **JSON Import/Export** - Save and load email templates
✅ **HTML Export** - Production-ready HTML with inline styles
✅ **Themeable** - Customize colors to match your brand
✅ **Upload Callback** - Integrate with your own image upload

## Quick Start

### 1. Install

```bash
npm install @yourorg/email-builder
```

### 2. Import in your Vue app

```vue
<template>
  <EmailBuilder
    :initial-data="emailData"
    @export-json="handleExportJSON"
    @export-html="handleExportHTML"
  />
</template>

<script>
import { ref } from 'vue'
import EmailBuilder from '@yourorg/email-builder'

export default {
  components: { EmailBuilder },
  setup() {
    const emailData = ref({ blocks: [], bodySettings: {} })

    const handleExportJSON = (data) => {
      console.log('JSON:', data)
    }

    const handleExportHTML = (html) => {
      console.log('HTML:', html)
    }

    return { emailData, handleExportJSON, handleExportHTML }
  }
}
</script>

<style>
@import '@yourorg/email-builder/dist/email-builder.css';
</style>
```

### 3. Run the Demo

```bash
cd content-builder
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## How It Works

### 1. **Content Menu** (Right Sidebar)

Choose from three tabs:

- **Content** - Individual content blocks (Button, Heading, Paragraph, etc.)
- **Blocks** - Layout blocks with different column configurations
- **Body** - Global email settings (background color, width, font)

### 2. **Canvas** (Center)

- **Drag blocks** from the sidebar onto the canvas
- **Click blocks** to select and show properties
- **Double-click text** to edit inline
- **Use action buttons** to copy, move, or delete blocks

### 3. **Properties Panel** (Right Sidebar)

When you select a block, the properties panel appears with controls for:

- Colors, fonts, sizes
- Padding, margins, alignment
- URLs, images, text content
- Block-specific options

### 4. **Toolbar** (Top)

- **Export JSON** - Save your template as JSON
- **Export HTML** - Get production-ready HTML code

## Block Types

### Content Blocks

| Block | Description | Properties |
|-------|-------------|------------|
| **Button** | Call-to-action button | Text, URL, colors, fonts, padding, radius |
| **Heading** | H1-H6 headings | Text, level, fonts, colors, spacing |
| **Paragraph** | Body text | Text, fonts, colors, line height, spacing |
| **Image** | Image with optional link | URL, alt text, dimensions, link |
| **Divider** | Horizontal line | Width, height, color, alignment |
| **Video** | Video with thumbnail | URL, thumbnail, width |
| **Social** | Social media icons | Platforms, size, spacing |
| **Table** | Data table | Rows, cells, borders, colors |

### Layout Blocks (Rows)

| Layout | Description |
|--------|-------------|
| 1 Column | 100% width |
| 2 Columns | 50/50, 33/67, 67/33 |
| 3 Columns | 33/33/33 |
| 4 Columns | 25/25/25/25, 17/33/17/33, 33/17/33/17 |

Rows can contain any content blocks and support nesting.

## Common Use Cases

### 1. Newsletter

1. Add a **Heading** for the title
2. Add a **Paragraph** for intro text
3. Add a **Row** with 2 columns
4. Add content to each column
5. Add a **Button** for call-to-action
6. Add **Social** icons at the bottom

### 2. Promotional Email

1. Add an **Image** banner
2. Add a **Heading** for the offer
3. Add a **Paragraph** for details
4. Add a **Button** with promo code
5. Add a **Divider**
6. Add footer content

### 3. Transactional Email

1. Add **Heading** for email type
2. Add **Paragraph** for message
3. Add **Table** for order details
4. Add **Button** for action
5. Add **Paragraph** for footer

## Tips & Best Practices

### Email Design

- ✅ Keep width at 600px (default)
- ✅ Use web-safe fonts
- ✅ Test in multiple email clients
- ✅ Provide alt text for images
- ✅ Use clear call-to-action buttons

### Layout

- ✅ Use rows for structure
- ✅ Keep layouts simple (avoid deep nesting)
- ✅ Consistent padding/spacing
- ✅ Mobile-friendly (columns stack on mobile)

### Performance

- ✅ Optimize images before upload
- ✅ Use HTTPS URLs
- ✅ Compress images
- ✅ Limit number of blocks

## Customization

### Change Theme Color

```vue
<EmailBuilder
  :primary-color="#10b981"
  :initial-data="emailData"
/>
```

### Implement Image Upload

```javascript
const handleUpload = async (file) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  return data.url
}
```

```vue
<EmailBuilder
  :on-upload="handleUpload"
  :initial-data="emailData"
/>
```

### Load Template

```javascript
import template from './example-template.json'

const emailData = ref(template)
```

## Exporting

### Export JSON

Save your email template for later editing:

```javascript
const handleExportJSON = (data) => {
  // Save to database
  await saveTemplate(data)

  // Or download as file
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template.json'
  a.click()
}
```

### Export HTML

Get production-ready HTML for sending emails:

```javascript
const handleExportHTML = (html) => {
  // Send via email service
  await sendEmail({
    to: 'user@example.com',
    subject: 'Newsletter',
    html: html
  })

  // Or copy to clipboard
  await navigator.clipboard.writeText(html)
}
```

## Next Steps

1. **Read the full documentation** - See `README.md` for complete API reference
2. **Check usage examples** - See `USAGE.md` for detailed examples
3. **Explore the demo** - Run `npm run dev` to try the full interface
4. **Review project structure** - See `PROJECT_STRUCTURE.md` to understand the codebase
5. **Load example template** - Import `example-template.json` to see a complete email

## Support & Resources

- **Demo**: Run `npm run dev` to see it in action
- **Example Template**: `example-template.json`
- **Documentation**: `README.md`, `USAGE.md`, `PROJECT_STRUCTURE.md`
- **GitHub**: Report issues and contribute

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Email Client Compatibility

The exported HTML is optimized for:

- Gmail
- Outlook (desktop & web)
- Apple Mail
- Yahoo Mail
- Thunderbird
- Mobile email clients

## License

MIT - Free to use in personal and commercial projects

---

**Ready to start building?** Run `npm run dev` and open http://localhost:5173 to try the demo!
