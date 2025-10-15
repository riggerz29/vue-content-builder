# Project Structure

## Overview

This is a Vue 3 package that provides a drag-and-drop email builder component. The project is structured as a library that can be imported into other Vue applications.

## Directory Structure

```
content-builder/
├── src/                          # Source code
│   ├── components/               # Vue components
│   │   ├── EmailBuilder.vue      # Main component
│   │   ├── blocks/               # Content block components
│   │   │   ├── ButtonBlock.vue
│   │   │   ├── DividerBlock.vue
│   │   │   ├── HeadingBlock.vue
│   │   │   ├── ParagraphBlock.vue
│   │   │   ├── ImageBlock.vue
│   │   │   ├── VideoBlock.vue
│   │   │   ├── SocialBlock.vue
│   │   │   ├── TableBlock.vue
│   │   │   └── RowBlock.vue
│   │   └── properties/           # Property panel components
│   │       ├── ButtonProperties.vue
│   │       ├── DividerProperties.vue
│   │       ├── HeadingProperties.vue
│   │       ├── ParagraphProperties.vue
│   │       ├── ImageProperties.vue
│   │       ├── VideoProperties.vue
│   │       ├── SocialProperties.vue
│   │       ├── TableProperties.vue
│   │       └── RowProperties.vue
│   ├── utils/                    # Utility functions
│   │   └── htmlGenerator.js      # HTML export generator
│   └── index.js                  # Package entry point
├── demo/                         # Demo application
│   ├── index.html                # Demo HTML template
│   ├── main.js                   # Demo entry point
│   └── DemoApp.vue               # Demo app component
├── dist/                         # Build output (generated)
│   ├── email-builder.css         # Compiled CSS
│   ├── email-builder.es.js       # ES module build
│   └── email-builder.umd.js      # UMD build
├── example-template.json         # Example email template
├── package.json                  # Package configuration
├── vite.config.js                # Vite build configuration
├── README.md                     # Package documentation
├── USAGE.md                      # Usage guide
└── PROJECT_STRUCTURE.md          # This file
```

## Component Architecture

### EmailBuilder.vue (Main Component)

The root component that orchestrates the entire email builder.

**Key Features:**
- Manages state for blocks, selected block, active tab
- Handles drag-and-drop events
- Renders sidebar with content/blocks/body tabs
- Renders canvas with blocks
- Provides export functionality (JSON and HTML)

**Props:**
- `initialData` - Initial email template data
- `primaryColor` - Theme color for UI
- `onUpload` - Callback for handling file uploads

**Emits:**
- `export-json` - When user exports to JSON
- `export-html` - When user exports to HTML
- `change` - When email data changes

### Block Components

Each block type has its own component in `src/components/blocks/`:

**Common Features:**
- Accept `block`, `isSelected`, `index` props
- Emit `select`, `update`, `delete`, `copy`, `move-up`, `move-down`, `drop` events
- Show action toolbar when selected
- Support drag-and-drop for reordering

**Text Blocks** (Button, Heading, Paragraph):
- Support double-click inline editing
- Show formatting toolbar in edit mode
- Direct text editing on canvas

**Media Blocks** (Image, Video, Social):
- Display media with configured properties
- Simple copy/delete actions

**Layout Block** (Row):
- Renders columns side-by-side
- Each column is a drop zone
- Supports nested blocks within columns

### Property Components

Each block type has a corresponding properties component in `src/components/properties/`:

**Features:**
- Accept `block` and `onUpload` props
- Emit `update` event when properties change
- Provide form inputs for all block properties
- Local reactive state with watchers

**Property Types:**
- Text inputs (text, URLs, alt text)
- Number inputs (sizes, spacing)
- Color pickers (colors)
- Dropdowns (font family, heading level, alignment)
- Checkboxes (fullWidth)
- Object inputs (padding, margin with top/right/bottom/left)
- Arrays (social icons, table rows)

## Data Structure

### Email Data Format

```javascript
{
  blocks: [
    {
      id: Number,           // Unique identifier
      type: String,         // Block type
      properties: Object,   // Block-specific properties
      columns: Array        // Only for row blocks
    }
  ],
  bodySettings: {
    backgroundColor: String,
    contentWidth: Number,
    fontFamily: String
  }
}
```

### Block Types and Properties

**button:**
```javascript
{
  text, url, backgroundColor, textColor, fontSize,
  fontFamily, fontWeight, textDecoration, borderRadius,
  padding: {top, right, bottom, left},
  margin: {top, right, bottom, left},
  align, fullWidth
}
```

**heading:**
```javascript
{
  text, level, fontSize, fontFamily, fontWeight, color,
  lineHeight, letterSpacing, align,
  margin: {top, right, bottom, left},
  padding: {top, right, bottom, left}
}
```

**paragraph:**
```javascript
{
  text, fontSize, fontFamily, fontWeight, color,
  lineHeight, letterSpacing, align,
  margin: {top, right, bottom, left},
  padding: {top, right, bottom, left}
}
```

**image:**
```javascript
{
  url, alt, width, height, link, align,
  margin: {top, right, bottom, left}
}
```

**divider:**
```javascript
{
  width, height, color, align,
  margin: {top, right, bottom, left}
}
```

**video:**
```javascript
{
  url, thumbnailUrl, width, align,
  margin: {top, right, bottom, left}
}
```

**social:**
```javascript
{
  icons: [{platform, url}],
  iconSize, iconSpacing, align,
  margin: {top, right, bottom, left}
}
```

**table:**
```javascript
{
  rows: [{cells: [String]}],
  borderColor, borderWidth, cellPadding,
  backgroundColor, textColor, fontSize,
  margin: {top, right, bottom, left}
}
```

**row:**
```javascript
{
  columns: [{width: Number, blocks: Array}],
  properties: {
    backgroundColor,
    padding: {top, right, bottom, left}
  }
}
```

## HTML Generation

The `htmlGenerator.js` utility converts the JSON structure to production-ready HTML:

**Features:**
- Inline CSS styles
- Table-based layout for email client compatibility
- DOCTYPE and meta tags
- Responsive images
- Email-safe HTML structure

**Process:**
1. Wraps content in email-safe table structure
2. Converts each block to HTML with inline styles
3. Handles nested blocks (rows with columns)
4. Escapes HTML entities in text content
5. Applies body settings (background, width, font)

## Build Configuration

### Vite Config

- **Development mode**: Serves demo from `./demo` directory
- **Build mode**: Builds library from `src/index.js`
- **Output formats**: ES modules and UMD
- **External dependencies**: Vue is marked as external (peer dependency)

### Package Exports

```json
{
  "main": "dist/email-builder.umd.js",
  "module": "dist/email-builder.es.js",
  "exports": {
    ".": {
      "import": "./dist/email-builder.es.js",
      "require": "./dist/email-builder.umd.js"
    }
  }
}
```

## Development Workflow

### Running Demo

```bash
npm run dev
```

Starts Vite dev server serving the demo app from `./demo` directory.

### Building Package

```bash
npm run build
```

Builds the library for distribution:
- Compiles Vue components
- Bundles JavaScript
- Extracts and bundles CSS
- Creates ES and UMD builds

### Using Locally

To test the package in another project:

```bash
# In this project
npm run build
npm link

# In your test project
npm link @riggerz29/email-builder
```

## Styling Strategy

### Scoped Styles

Each component uses Vue's `<style scoped>` to avoid style conflicts.

### CSS Variables

The main component uses CSS variables for theming:
- `--primary-color`: Configurable via `primaryColor` prop

### Email-Safe Styles

The HTML export uses only email-safe inline styles:
- No flexbox or grid
- Table-based layouts
- Inline CSS only
- Web-safe fonts

## Extension Points

### Adding New Block Types

1. Create block component in `src/components/blocks/`
2. Create properties component in `src/components/properties/`
3. Add default properties to `createBlock()` in `EmailBuilder.vue`
4. Add to `contentBlocks` array in `EmailBuilder.vue`
5. Register components in `EmailBuilder.vue`
6. Add HTML generation in `htmlGenerator.js`

### Customizing Appearance

- Modify CSS in component `<style>` sections
- Change default colors/spacing
- Update `primaryColor` prop for theme color

### Adding Features

- **Undo/Redo**: Add history tracking in EmailBuilder
- **Templates**: Add template picker in sidebar
- **Preview Mode**: Add preview toggle
- **Mobile Preview**: Add responsive preview
- **A/B Testing**: Add variant support

## Performance Considerations

- **Reactive Updates**: Uses Vue's reactivity for efficient updates
- **Component Reuse**: Block components are reused via `v-for`
- **Lazy Loading**: Could add dynamic imports for property panels
- **Bundle Size**: ~125KB ES build, ~106KB UMD build (uncompressed)

## Browser Compatibility

Requires modern browsers with ES6+ support:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Testing Recommendations

### Unit Tests
- Test block rendering
- Test property updates
- Test HTML generation
- Test drag-and-drop logic

### Integration Tests
- Test full workflow (drag, edit, export)
- Test JSON import/export
- Test HTML output validity

### E2E Tests
- Test user interactions
- Test across email clients
- Test upload functionality

## Future Enhancements

- **Conditional Content**: Show/hide based on conditions
- **Dynamic Content**: Merge tags and personalization
- **Advanced Layouts**: Custom column widths
- **More Blocks**: Countdown timer, menu, spacer
- **Templates**: Pre-built template library
- **Collaboration**: Real-time multi-user editing
- **Version History**: Save and restore versions
- **Preview**: Email client preview modes
- **Export**: PDF export, Markdown export
