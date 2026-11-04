import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import EmailBuilder from './EmailBuilder.vue'
import { isApplePlatform } from '../utils/interactiveGuard'

const spacing = { top: 10, right: 0, bottom: 10, left: 0 }
const textSpacing = { top: 0, right: 0, bottom: 0, left: 0 }

const bodySettings = {
    backgroundColor: '#f3f4f6',
    textColor: '#000000',
    linkColor: '#2f4574',
    contentWidth: 600,
    contentAlignment: 'center',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    preheaderText: ''
}

const blocks = [
    {
        id: 1,
        type: 'button',
        properties: {
            text: '<p>Click Here</p>',
            url: 'https://example.com/button',
            backgroundColor: '#2f4574',
            textColor: '#ffffff',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            textDecoration: 'none',
            borderRadius: 4,
            padding: { top: 12, right: 24, bottom: 12, left: 24 },
            margin: spacing,
            align: 'center',
            fullWidth: false
        }
    },
    {
        id: 2,
        type: 'paragraph',
        properties: {
            text: '<p>Hello <a href="mailto:ada@example.com" target="_blank">Ada</a></p>',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            color: '#000000',
            lineHeight: 1.6,
            letterSpacing: 0,
            align: 'left',
            margin: spacing,
            padding: textSpacing
        }
    },
    {
        id: 3,
        type: 'image',
        properties: {
            url: 'https://example.com/photo.png',
            alt: 'Photo',
            width: '100%',
            height: 'auto',
            link: 'https://example.com/image',
            align: 'center',
            margin: spacing
        }
    },
    {
        id: 4,
        type: 'video',
        properties: {
            url: 'https://example.com/video',
            thumbnailUrl: 'https://example.com/thumb.png',
            width: '100%',
            align: 'center',
            margin: spacing
        }
    },
    {
        id: 5,
        type: 'social',
        properties: {
            icons: [
                { platform: 'github', url: 'https://example.com/social' }
            ],
            iconSize: 32,
            iconSpacing: 10,
            align: 'center',
            margin: spacing
        }
    },
    {
        id: 6,
        type: 'row',
        columns: [
            {
                width: 100,
                blocks: [
                    {
                        id: 7,
                        type: 'button',
                        properties: {
                            text: '<p>Nested</p>',
                            url: 'https://example.com/nested',
                            backgroundColor: '#2f4574',
                            textColor: '#ffffff',
                            fontSize: 16,
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 'normal',
                            textDecoration: 'none',
                            borderRadius: 4,
                            padding: { top: 12, right: 24, bottom: 12, left: 24 },
                            margin: spacing,
                            align: 'center',
                            fullWidth: false
                        }
                    }
                ]
            }
        ],
        properties: {
            backgroundColor: 'transparent',
            padding: { top: 10, right: 0, bottom: 10, left: 0 }
        }
    }
]

function followModifiers() {
    return isApplePlatform() ? { metaKey: true } : { ctrlKey: true }
}

function nativeClick(element, init = {}) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
    element.dispatchEvent(event)
    return event
}

describe('EmailBuilder content clicks', () => {
    it('blocks plain activation of canvas links and follows only with the platform modifier', async () => {
        const wrapper = mount(EmailBuilder, {
            attachTo: document.body,
            props: {
                modelValue: { json: { blocks, bodySettings }, html: '' }
            }
        })
        await nextTick()

        const selectors = [
            '.button-block__link',
            '.paragraph-block a',
            '.image-block a',
            '.video-block__link',
            '.social-block__icon',
            '.row-block .button-block__link'
        ]

        for (const selector of selectors) {
            const event = nativeClick(wrapper.get(selector).element)
            expect(event.defaultPrevented).toBe(true)
        }

        const modified = nativeClick(wrapper.get('.button-block__link').element, followModifiers())
        expect(modified.defaultPrevented).toBe(false)

        const html = wrapper.vm.exportHTML()
        expect(html).toContain('href="https://example.com/button"')
        expect(html).toContain('href="mailto:ada@example.com"')
        expect(html).toContain('href="https://example.com/image"')
        expect(html).toContain('href="https://example.com/video"')
        expect(html).toContain('href="https://example.com/social"')
        expect(html).toContain('href="https://example.com/nested"')
        expect(html).toContain('target="_blank"')
        expect(html).not.toContain('Ctrl+click')
        expect(html).not.toContain('Cmd+click')
        expect(html).not.toContain('data-cb-guard-hint')
        expect(html).not.toContain('preventDefault')

        wrapper.unmount()
    })

    it('still selects a block, copies it, and exports from the toolbar', async () => {
        const wrapper = mount(EmailBuilder, {
            attachTo: document.body,
            props: {
                modelValue: { json: { blocks: [blocks[0]], bodySettings }, html: '<p>existing</p>' }
            }
        })
        await nextTick()

        const link = wrapper.get('.button-block__link')
        expect(nativeClick(link.element).defaultPrevented).toBe(true)
        await nextTick()

        expect(wrapper.find('.block-actions').exists()).toBe(true)
        expect(wrapper.findAll('.button-block')).toHaveLength(1)
        await wrapper.get('.block-actions button').trigger('click')
        await nextTick()
        expect(wrapper.findAll('.button-block')).toHaveLength(2)

        const exportButton = wrapper.findAll('.toolbar__btn')[1]
        const exportClick = nativeClick(exportButton.element)
        expect(exportClick.defaultPrevented).toBe(false)
        expect(wrapper.emitted('export-html')).toBeTruthy()
        const exported = wrapper.emitted('export-html').at(-1)[0]
        expect(exported).toContain('href="https://example.com/button"')
        expect(exported).not.toContain('Ctrl+click')
        expect(exported).not.toContain('Cmd+click')

        wrapper.unmount()
    })

    it('blocks links inside the properties rich text editor and leaves its toolbar buttons usable', async () => {
        const wrapper = mount(EmailBuilder, {
            attachTo: document.body,
            props: {
                modelValue: { json: { blocks: [blocks[1]], bodySettings }, html: '' }
            }
        })
        await nextTick()

        nativeClick(wrapper.get('.paragraph-block').element)
        await nextTick()

        const editor = wrapper.get('.sidebar__properties .ql-editor')
        editor.element.innerHTML = '<p><a href="https://example.com/from-editor">Call</a></p>'
        const editorLink = editor.element.querySelector('a')
        expect(nativeClick(editorLink).defaultPrevented).toBe(true)
        expect(editorLink.outerHTML).not.toContain('Ctrl+click')
        expect(editorLink.outerHTML).not.toContain('Cmd+click')

        const hint = wrapper.get('[data-cb-guard-hint]')
        expect(hint.text()).toMatch(/click to follow link$/)

        // Quill cancels toolbar button clicks itself, so defaultPrevented is not
        // a signal that the guard ran. The guard would rewrite the hint if it had.
        const toolbarButton = wrapper.get('.sidebar__properties .ql-toolbar button')
        expect(toolbarButton.element.closest('.ql-toolbar')).not.toBeNull()
        nativeClick(toolbarButton.element)
        expect(hint.text()).toMatch(/click to follow link$/)

        wrapper.unmount()
    })
})
