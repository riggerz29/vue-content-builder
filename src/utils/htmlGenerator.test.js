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
        expect(html).not.toContain('Hold to follow')
        expect(html).not.toContain('data-cb-holding')
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

function imageBlock(overrides = {}) {
    return {
        id: 10,
        type: 'image',
        properties: {
            url: 'https://example.com/image.png',
            alt: 'Photo',
            width: '600',
            height: 'auto',
            link: '',
            align: 'center',
            margin: spacing,
            ...overrides
        }
    }
}

function render(blocks) {
    const host = document.createElement('div')
    host.innerHTML = generateHTML(blocks, bodySettings)
    return host
}

describe('generateHTML escapes user-supplied values', () => {
    it.each([
        'javascript:alert(1)',
        'JavaScript:alert(1)',
        ' java\tscript:alert(1)',
        'vbscript:msgbox(1)',
        'data:text/html,<script>alert(1)</script>'
    ])('replaces unsafe link %j with #', (bad) => {
        const button = buttonBlock()
        button.properties.url = bad
        const host = render([button, imageBlock({ link: bad })])

        for (const a of host.querySelectorAll('a')) {
            expect(a.getAttribute('href')).toBe('#')
        }
    })

    it('keeps safe, relative and merge-tag links', () => {
        const hrefs = ['https://example.com/?a=1&b=2', '/relative', '#top', '$$unsubscribe_url$$', '{{link}}']
        const host = render(hrefs.map(href => imageBlock({ link: href })))

        expect([...host.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(hrefs)
    })

    it('stops quotes in URLs and alt text breaking out of the attribute', () => {
        const host = render([imageBlock({
            url: 'https://example.com/x.png" onerror="alert(1)',
            alt: '"><script>alert(1)</script>',
            link: 'https://example.com/" onclick="alert(1)'
        })])

        const img = host.querySelector('img')
        expect(img.getAttribute('onerror')).toBeNull()
        expect(img.getAttribute('src')).toBe('https://example.com/x.png" onerror="alert(1)')
        expect(img.getAttribute('alt')).toBe('"><script>alert(1)</script>')
        expect(host.querySelector('a').getAttribute('onclick')).toBeNull()
        expect(host.querySelector('script')).toBeNull()
    })

    it('allows data:image sources but not data: links', () => {
        const src = 'data:image/png;base64,iVBORw0KGgo='
        const host = render([imageBlock({ url: src, link: 'data:image/png;base64,iVBORw0KGgo=' })])

        expect(host.querySelector('img').getAttribute('src')).toBe(src)
        expect(host.querySelector('a').getAttribute('href')).toBe('#')
    })

    it('stops style values injecting extra CSS or attributes', () => {
        const button = buttonBlock()
        button.properties.backgroundColor = 'red; background-image: url(https://evil.test)" onmouseover="alert(1)'
        const host = render([button])

        const td = host.querySelector('td[align="center"][style*="background-color"]')
        expect(td.getAttribute('onmouseover')).toBeNull()
        expect(td.getAttribute('style')).not.toMatch(/background-color:[^;]*;\s*background-image/)
    })

    it('only emits known alignments', () => {
        const host = render([imageBlock({ align: 'center" onclick="alert(1)' })])
        const td = host.querySelector('img').closest('td')

        expect(td.getAttribute('align')).toBe('left')
        expect(td.getAttribute('onclick')).toBeNull()
    })

    it('does not double the px unit on spacing entered with units', () => {
        const html = generateHTML([imageBlock({ margin: { top: '16px', right: '0px', bottom: 8, left: '' } })], bodySettings)

        expect(html).toContain('margin: 16px 0px 8px 0px;')
        expect(html).not.toContain('pxpx')
    })
})
