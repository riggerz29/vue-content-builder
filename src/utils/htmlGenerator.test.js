import { describe, expect, it } from 'vitest'
import { generateHTML } from './htmlGenerator'

const bodySettings = {
    backgroundColor: '#f3f4f6',
    textColor: '#111111',
    linkColor: '#2f4574',
    contentWidth: 600,
    contentAlignment: 'center',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    preheaderText: ''
}

const spacing = { top: 0, right: 0, bottom: 0, left: 0 }

function buttonBlock() {
    return {
        id: 1,
        type: 'button',
        properties: {
            text: 'Click Here',
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
    }
}

describe('generateHTML stays a normal published email', () => {
    it('keeps real hrefs and does not embed the designer guard', () => {
        const html = generateHTML([
            buttonBlock(),
            {
                id: 2,
                type: 'paragraph',
                properties: {
                    text: '<p>Email <a href="mailto:ada@example.com">Ada</a> or call <a href="tel:+15551212">us</a>.</p>',
                    fontSize: 14,
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                    color: '#111111',
                    lineHeight: 1.5,
                    letterSpacing: 0,
                    align: 'left',
                    margin: spacing,
                    padding: spacing
                }
            },
            {
                id: 3,
                type: 'image',
                properties: {
                    url: 'https://example.com/image.png',
                    alt: 'Photo',
                    width: '600',
                    height: 'auto',
                    link: 'https://example.com/image',
                    align: 'center',
                    margin: spacing
                }
            },
            {
                id: 4,
                type: 'social',
                properties: {
                    icons: [{ platform: 'github', url: 'https://example.com/social' }],
                    iconSize: 32,
                    iconSpacing: 10,
                    align: 'center',
                    margin: spacing
                }
            }
        ], bodySettings)

        expect(html).toContain('href="https://example.com/button"')
        expect(html).toContain('target="_blank"')
        expect(html).toContain('href="mailto:ada@example.com"')
        expect(html).toContain('href="tel:+15551212"')
        expect(html).toContain('href="https://example.com/image"')
        expect(html).toContain('href="https://example.com/social"')
        expect(html).not.toContain('data-cb-guard-hint')
        expect(html).not.toContain('data-content-surface')
        expect(html).not.toContain('data-builder-chrome')
        expect(html).not.toContain('Ctrl+click')
        expect(html).not.toContain('Cmd+click')
        expect(html).not.toContain('interactiveGuard')
        expect(html).not.toContain('preventDefault')

        const host = document.createElement('div')
        host.innerHTML = html
        const link = host.querySelector('a[href="https://example.com/button"]')
        const event = new MouseEvent('click', { bubbles: true, cancelable: true })
        link.dispatchEvent(event)
        expect(event.defaultPrevented).toBe(false)
        expect(link.getAttribute('target')).toBe('_blank')
    })
})
