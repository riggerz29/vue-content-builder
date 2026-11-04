/**
 * Content block registry: everything the builder needs to know about each content block type.
 *
 * - `label`, `icon`: how it appears in the Content tab
 * - `component`: renders and edits the block on the canvas
 * - `properties`: the sidebar properties panel
 * - `defaults()`: a fresh set of properties for a newly dropped block
 *
 * Rows are registered separately in `./index.js` (rows contain content blocks, so RowBlock imports
 * this list; keeping rows out of it avoids a circular import). The HTML output for each type lives
 * in `utils/htmlGenerator.js`, which stays free of Vue so it can run anywhere.
 */
import ButtonBlock from '../components/blocks/ButtonBlock.vue'
import ButtonProperties from '../components/properties/ButtonProperties.vue'
import DividerBlock from '../components/blocks/DividerBlock.vue'
import DividerProperties from '../components/properties/DividerProperties.vue'
import HeadingBlock from '../components/blocks/HeadingBlock.vue'
import HeadingProperties from '../components/properties/HeadingProperties.vue'
import ParagraphBlock from '../components/blocks/ParagraphBlock.vue'
import ParagraphProperties from '../components/properties/ParagraphProperties.vue'
import ImageBlock from '../components/blocks/ImageBlock.vue'
import ImageProperties from '../components/properties/ImageProperties.vue'
import VideoBlock from '../components/blocks/VideoBlock.vue'
import VideoProperties from '../components/properties/VideoProperties.vue'
import SocialBlock from '../components/blocks/SocialBlock.vue'
import SocialProperties from '../components/properties/SocialProperties.vue'
import TableBlock from '../components/blocks/TableBlock.vue'
import TableProperties from '../components/properties/TableProperties.vue'

export const CONTENT_BLOCKS = [
    {
        type: 'button',
        label: 'Button',
        icon: 'square',
        component: ButtonBlock,
        properties: ButtonProperties,
        defaults: () => ({
            text: '<p style=\"text-align: center;\">Click Here</p>',
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
        })
    },
    {
        type: 'divider',
        label: 'Divider',
        icon: 'minus',
        component: DividerBlock,
        properties: DividerProperties,
        defaults: () => ({
            width: 100,
            height: 1,
            color: '#e5e7eb',
            align: 'center',
            margin: { top: 10, right: 0, bottom: 10, left: 0 }
        })
    },
    {
        type: 'heading',
        label: 'Heading',
        icon: 'type',
        component: HeadingBlock,
        properties: HeadingProperties,
        defaults: () => ({
            text: '<p>Heading Text</p>',
            level: 'h2',
            fontSize: 28,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            color: '#000000',
            lineHeight: 1.4,
            letterSpacing: 0,
            align: 'left',
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 }
        })
    },
    {
        type: 'paragraph',
        label: 'Paragraph',
        icon: 'alignLeft',
        component: ParagraphBlock,
        properties: ParagraphProperties,
        defaults: () => ({
            text: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            color: '#000000',
            lineHeight: 1.6,
            letterSpacing: 0,
            align: 'left',
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 }
        })
    },
    {
        type: 'image',
        label: 'Image',
        icon: 'image',
        component: ImageBlock,
        properties: ImageProperties,
        defaults: () => ({
            url: 'https://dummyimage.com/600x300/cccccc/fff&text=Add+Image/600x300',
            alt: 'Image',
            width: '100%',
            height: 'auto',
            link: '',
            align: 'center',
            margin: { top: 10, right: 0, bottom: 10, left: 0 },
            meta: {}
        })
    },
    {
        type: 'video',
        label: 'Video',
        icon: 'video',
        component: VideoBlock,
        properties: VideoProperties,
        defaults: () => ({
            url: '',
            thumbnailUrl: 'https://dummyimage.com/600x300/cccccc/fff&text=Add+Image/600x300',
            width: '100%',
            align: 'center',
            margin: { top: 10, right: 0, bottom: 10, left: 0 }
        })
    },
    {
        type: 'social',
        label: 'Social',
        icon: 'users',
        component: SocialBlock,
        properties: SocialProperties,
        defaults: () => ({
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
        })
    },
    {
        type: 'table',
        label: 'Table',
        icon: 'table',
        component: TableBlock,
        properties: TableProperties,
        defaults: () => ({
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
        })
    }
]

export const CONTENT_BLOCK_TYPES = Object.fromEntries(CONTENT_BLOCKS.map(block => [block.type, block]))
