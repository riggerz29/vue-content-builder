import Quill from 'quill'
import 'quill/dist/quill.snow.css'

/**
 * Single place Quill is configured for the builder. Importing this module registers the
 * attributors once; every editor (inline blocks and the properties panel) uses these toolbars.
 */

export const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '32px', '36px', '48px', '64px', '72px', '96px']

// Inline styles (not classes) so formatting survives into the exported email HTML
Quill.register(Quill.import('attributors/style/align'), true)

const SizeStyle = Quill.import('attributors/style/size')
SizeStyle.whitelist = FONT_SIZES
Quill.register(SizeStyle, true)

/** Full rich-text toolbar: headings and paragraphs. */
export const FULL_TOOLBAR = [
    [{ font: [] }, { size: FONT_SIZES }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean']
]

/** Minimal toolbar: buttons. */
export const BASIC_TOOLBAR = [
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    ['clean']
]

export function createQuill(element, toolbar = FULL_TOOLBAR) {
    return new Quill(element, {
        theme: 'snow',
        modules: { toolbar }
    })
}

/** Insert plain text at the cursor (or the end, if the editor has no selection) and move past it. */
export function insertAtCursor(quill, text) {
    const range = quill.getSelection(true) || { index: quill.getLength() }
    quill.insertText(range.index, text)
    quill.setSelection(range.index + text.length)
}

export default Quill
