import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, withDirectives } from 'vue'
import { mount } from '@vue/test-utils'
import { useInteractiveGuard } from '../composables/useInteractiveGuard'
import {
    activationHint,
    attachInteractiveGuard,
    followInteractive,
    HOLD_MOVE_CANCEL_PX,
    HOLD_TO_ACTIVATE_MS,
    isApplePlatform,
    isFollowModifier,
    isHoldPointer,
    vInteractiveGuard
} from './interactiveGuard'

function tick() {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

function click(target, init = {}) {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...init })
    target.dispatchEvent(event)
    return event
}

function key(target, type, keyName, init = {}) {
    const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, key: keyName, ...init })
    target.dispatchEvent(event)
    return event
}

describe('platform modifier', () => {
    it('treats Apple platforms as Cmd and everything else as Ctrl', () => {
        expect(isApplePlatform({ platform: 'MacIntel', userAgent: 'Macintosh' })).toBe(true)
        expect(isApplePlatform({ userAgentData: { platform: 'macOS' } })).toBe(true)
        expect(isApplePlatform({ userAgentData: { platform: 'iOS' }, userAgent: '' })).toBe(true)
        expect(isApplePlatform({ platform: 'iPhone' })).toBe(true)
        expect(isApplePlatform({ platform: 'iPad' })).toBe(true)
        expect(isApplePlatform({ platform: 'Win32', userAgent: 'Windows NT 10.0' })).toBe(false)
        expect(isApplePlatform({ platform: 'Linux x86_64', userAgent: 'X11; Linux x86_64' })).toBe(false)
        expect(isApplePlatform({ userAgentData: { platform: 'Chrome OS' } })).toBe(false)
        expect(isApplePlatform(null)).toBe(false)
    })

    it('uses Cmd on Apple, and Ctrl or Meta elsewhere', () => {
        expect(isFollowModifier({ metaKey: true, ctrlKey: false }, true)).toBe(true)
        expect(isFollowModifier({ metaKey: false, ctrlKey: true }, true)).toBe(false)
        expect(isFollowModifier({ metaKey: false, ctrlKey: false }, true)).toBe(false)

        expect(isFollowModifier({ metaKey: false, ctrlKey: true }, false)).toBe(true)
        expect(isFollowModifier({ metaKey: true, ctrlKey: false }, false)).toBe(true)
        expect(isFollowModifier({ metaKey: false, ctrlKey: false, altKey: true, shiftKey: true }, false)).toBe(false)
    })

    it('names the hint after the element and the platform', () => {
        expect(activationHint({ tagName: 'A' }, true)).toBe('Cmd+click to follow link')
        expect(activationHint({ tagName: 'A' }, false)).toBe('Ctrl+click to follow link')
        expect(activationHint({ tagName: 'BUTTON' }, true)).toBe('Cmd+click to activate')
        expect(activationHint({ tagName: 'BUTTON' }, false)).toBe('Ctrl+click to activate')
        expect(activationHint({ tagName: 'A' }, false, 'hold')).toBe('Hold to follow link')
        expect(activationHint({ tagName: 'BUTTON' }, true, 'hold')).toBe('Hold to activate')
    })

    it('recognises a primary touch or pen contact, not a mouse', () => {
        expect(isHoldPointer({ button: 0, pointerType: 'touch' })).toBe(true)
        expect(isHoldPointer({ button: 0, pointerType: 'pen' })).toBe(true)
        expect(isHoldPointer({ button: 0, pointerType: 'mouse' })).toBe(false)
        expect(isHoldPointer({ button: 2, pointerType: 'touch' })).toBe(false)
        expect(HOLD_TO_ACTIVATE_MS).toBeGreaterThanOrEqual(1000)
        expect(HOLD_TO_ACTIVATE_MS).toBeLessThanOrEqual(1500)
    })
})

describe('followInteractive', () => {
    it('assigns same-tab links and opens the rest, and submits or resets the owning form', () => {
        const view = {
            location: { assign: vi.fn() },
            open: vi.fn(),
            top: { location: { assign: vi.fn() } },
            parent: { location: { assign: vi.fn() } }
        }
        const link = document.createElement('a')
        link.href = 'https://example.com/self'
        followInteractive(link, view)
        expect(view.location.assign).toHaveBeenCalledWith('https://example.com/self')

        link.setAttribute('target', '_blank')
        followInteractive(link, view)
        expect(view.open).toHaveBeenCalledWith(link.href, '_blank', 'noopener,noreferrer')

        const top = document.createElement('a')
        top.href = 'https://example.com/top'
        top.setAttribute('target', '_top')
        followInteractive(top, view)
        expect(view.top.location.assign).toHaveBeenCalledWith(top.href)

        const form = document.createElement('form')
        const submit = document.createElement('button')
        submit.setAttribute('type', 'submit')
        const reset = document.createElement('button')
        reset.setAttribute('type', 'reset')
        form.append(submit, reset)
        form.requestSubmit = vi.fn()
        form.reset = vi.fn()
        followInteractive(submit, view)
        expect(form.requestSubmit).toHaveBeenCalledWith(submit)
        followInteractive(reset, view)
        expect(form.reset).toHaveBeenCalled()

        const plain = document.createElement('button')
        plain.setAttribute('type', 'button')
        followInteractive(plain, view)
        expect(view.open).toHaveBeenCalledTimes(1)
    })
})

describe('attachInteractiveGuard', () => {
    let root
    let detach = () => {}

    afterEach(() => {
        detach()
        detach = () => {}
        root?.remove()
        root = null
        document.body.innerHTML = ''
    })

    function mountDesigner(html, options = {}) {
        root = document.createElement('div')
        root.innerHTML = html
        document.body.appendChild(root)
        detach = attachInteractiveGuard(root, { isApple: false, hintDelay: 0, ...options })
        return root
    }

    const designerHtml = `
        <button id="export" type="button">Export</button>
        <div data-content-surface>
            <a id="link" href="https://example.com/page" target="_blank">Page</a>
            <a id="mail" href="mailto:ada@example.com">Mail</a>
            <a id="tel" href="tel:+15551212">Tel</a>
            <a id="script" href="javascript:void(0)">Script</a>
            <p id="rich"><a id="rich-link" href="https://example.com/rich">Rich</a></p>
            <button id="content-btn" type="button">Go</button>
            <form id="form">
                <input id="query" type="text" />
                <button id="submit" type="submit">Send</button>
                <button id="reset" type="reset">Reset</button>
                <input id="image-submit" type="image" alt="" />
            </form>
            <div class="block-actions" data-builder-chrome>
                <button id="copy" type="button">Copy</button>
            </div>
            <div class="ql-toolbar">
                <button id="bold" type="button">Bold</button>
            </div>
            <div class="editing-actions">
                <button id="delete" type="button">Delete</button>
            </div>
            <map><area id="area" href="https://example.com/area" alt="" /></map>
        </div>
        <div class="sidebar">
            <button id="add" type="button">Add Icon</button>
            <div class="ql-editor">
                <a id="editor-link" href="https://example.com/edited">Edited</a>
                <button id="editor-btn" type="button">Inside editor</button>
            </div>
            <div class="ql-tooltip">
                <a id="tooltip-link" href="https://example.com/tooltip">Visit</a>
                <button id="tooltip-btn" type="button">Save</button>
            </div>
        </div>
    `

    it('blocks a plain click on content links and lets the platform modifier through', () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#link')

        const plain = click(link)
        expect(plain.defaultPrevented).toBe(true)

        const ctrl = click(link, { ctrlKey: true })
        expect(ctrl.defaultPrevented).toBe(false)

        const meta = click(link, { metaKey: true })
        expect(meta.defaultPrevented).toBe(false)

        const shift = click(link, { shiftKey: true })
        expect(shift.defaultPrevented).toBe(true)

        const alt = click(link, { altKey: true })
        expect(alt.defaultPrevented).toBe(true)
    })

    it('uses Cmd on Apple and does not treat Ctrl+click as activation there', () => {
        mountDesigner(designerHtml, { isApple: true })
        const link = root.querySelector('#link')

        expect(click(link).defaultPrevented).toBe(true)
        expect(click(link, { ctrlKey: true }).defaultPrevented).toBe(true)
        expect(click(link, { metaKey: true }).defaultPrevented).toBe(false)
        expect(root.querySelector('[data-cb-guard-hint]').textContent).toBe('Cmd+click to follow link')
    })

    it('blocks mailto, tel, javascript, target=_blank, rich text, and area links', () => {
        mountDesigner(designerHtml)
        for (const id of ['mail', 'tel', 'script', 'rich-link', 'area']) {
            const event = click(root.querySelector(`#${id}`))
            expect(event.defaultPrevented).toBe(true)
        }
        expect(click(root.querySelector('#mail'), { ctrlKey: true }).defaultPrevented).toBe(false)
    })

    it('blocks content buttons and form controls but not builder chrome', () => {
        mountDesigner(designerHtml)
        const runs = { export: 0, copy: 0, bold: 0, add: 0, delete: 0, tooltip: 0 }
        root.querySelector('#export').addEventListener('click', () => { runs.export++ })
        root.querySelector('#copy').addEventListener('click', () => { runs.copy++ })
        root.querySelector('#bold').addEventListener('click', () => { runs.bold++ })
        root.querySelector('#add').addEventListener('click', () => { runs.add++ })
        root.querySelector('#delete').addEventListener('click', () => { runs.delete++ })
        root.querySelector('#tooltip-btn').addEventListener('click', () => { runs.tooltip++ })

        expect(click(root.querySelector('#content-btn')).defaultPrevented).toBe(true)
        expect(click(root.querySelector('#editor-btn')).defaultPrevented).toBe(true)
        expect(click(root.querySelector('#submit')).defaultPrevented).toBe(true)
        expect(click(root.querySelector('#reset')).defaultPrevented).toBe(true)
        expect(click(root.querySelector('#image-submit')).defaultPrevented).toBe(true)

        for (const id of ['export', 'copy', 'bold', 'add', 'delete', 'tooltip-btn']) {
            const event = click(root.querySelector(`#${id}`))
            expect(event.defaultPrevented).toBe(false)
        }
        expect(runs).toEqual({ export: 1, copy: 1, bold: 1, add: 1, delete: 1, tooltip: 1 })

        // Quill's tooltip preview is editor chrome, so it stays a normal link.
        expect(click(root.querySelector('#tooltip-link')).defaultPrevented).toBe(false)
    })

    it('cancels form submit and reset unless the modifier click armed them', () => {
        mountDesigner(designerHtml)
        const form = root.querySelector('#form')
        const submit = new Event('submit', { bubbles: true, cancelable: true })
        form.dispatchEvent(submit)
        expect(submit.defaultPrevented).toBe(true)

        const reset = new Event('reset', { bubbles: true, cancelable: true })
        form.dispatchEvent(reset)
        expect(reset.defaultPrevented).toBe(true)

        let nestedSubmitPrevented = null
        root.querySelector('#submit').addEventListener('click', () => {
            const nested = new Event('submit', { bubbles: true, cancelable: true })
            form.dispatchEvent(nested)
            nestedSubmitPrevented = nested.defaultPrevented
        })
        const armed = click(root.querySelector('#submit'), { ctrlKey: true })
        expect(armed.defaultPrevented).toBe(false)
        expect(nestedSubmitPrevented).toBe(false)

        let nestedResetPrevented = null
        root.querySelector('#reset').addEventListener('click', () => {
            const nested = new Event('reset', { bubbles: true, cancelable: true })
            form.dispatchEvent(nested)
            nestedResetPrevented = nested.defaultPrevented
        })
        expect(click(root.querySelector('#reset'), { ctrlKey: true }).defaultPrevented).toBe(false)
        expect(nestedResetPrevented).toBe(false)
    })

    it('lets Enter insert a newline or submit attempt from a text field, then blocks the submit', () => {
        mountDesigner(designerHtml)
        const input = root.querySelector('#query')
        const enter = key(input, 'keydown', 'Enter')
        expect(enter.defaultPrevented).toBe(false)

        const submit = new Event('submit', { bubbles: true, cancelable: true })
        root.querySelector('#form').dispatchEvent(submit)
        expect(submit.defaultPrevented).toBe(true)
    })

    it('blocks Enter on links and Space on buttons, and allows them with the modifier', () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#link')
        const button = root.querySelector('#content-btn')

        expect(key(link, 'keydown', 'Enter').defaultPrevented).toBe(true)
        expect(key(link, 'keydown', 'Enter', { ctrlKey: true }).defaultPrevented).toBe(false)
        // Space does not activate links, so the guard leaves page scrolling alone.
        expect(key(link, 'keydown', ' ').defaultPrevented).toBe(false)

        expect(key(button, 'keydown', ' ').defaultPrevented).toBe(true)
        expect(key(button, 'keyup', ' ').defaultPrevented).toBe(true)
        expect(key(button, 'keydown', 'Enter').defaultPrevented).toBe(true)
        expect(key(button, 'keydown', ' ', { ctrlKey: true }).defaultPrevented).toBe(false)
        expect(key(button, 'keyup', ' ', { ctrlKey: true }).defaultPrevented).toBe(false)
        expect(key(button, 'keydown', 'a').defaultPrevented).toBe(false)
    })

    it('does not let middle-click bypass the guard', () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#link')

        const aux = new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 })
        link.dispatchEvent(aux)
        expect(aux.defaultPrevented).toBe(true)

        const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 1 })
        link.dispatchEvent(down)
        expect(down.defaultPrevented).toBe(true)

        const left = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 })
        link.dispatchEvent(left)
        expect(left.defaultPrevented).toBe(false)

        const context = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 })
        link.dispatchEvent(context)
        expect(context.defaultPrevented).toBe(false)

        const modified = new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1, ctrlKey: true })
        link.dispatchEvent(modified)
        expect(modified.defaultPrevented).toBe(false)
    })

    it('still blocks the default action when a child stops propagation', () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#link')
        const surface = root.querySelector('[data-content-surface]')
        let parentClicks = 0
        let seenInsideStop = null
        surface.addEventListener('click', () => { parentClicks++ })
        link.addEventListener('click', (event) => {
            seenInsideStop = event.defaultPrevented
            event.stopPropagation()
            event.stopImmediatePropagation()
        })

        const event = click(link)
        expect(event.defaultPrevented).toBe(true)
        expect(seenInsideStop).toBe(true)
        // The child's own stopPropagation keeps the event from the parent.
        // A link that does not stop propagation still reaches the parent.
        expect(parentClicks).toBe(0)

        const rich = root.querySelector('#rich-link')
        const second = click(rich)
        expect(second.defaultPrevented).toBe(true)
        expect(parentClicks).toBe(1)
    })

    it('cannot be skipped by a descendant capture listener that stops propagation', () => {
        root = document.createElement('div')
        root.innerHTML = '<div data-content-surface><a id="link" href="https://example.com">Go</a></div>'
        document.body.appendChild(root)
        const link = root.querySelector('#link')
        let seen = null
        link.addEventListener('click', (event) => {
            event.stopImmediatePropagation()
            event.stopPropagation()
            seen = event.defaultPrevented
        }, true)
        detach = attachInteractiveGuard(root, { isApple: false, hintDelay: 0 })

        click(link)
        expect(seen).toBe(true)
    })

    it('suppresses an inline onclick until a modifier click', async () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#link')
        let calls = 0
        link.onclick = () => { calls++ }

        expect(click(link).defaultPrevented).toBe(true)
        expect(calls).toBe(0)

        await tick()
        expect(typeof link.onclick).toBe('function')

        expect(click(link, { ctrlKey: true }).defaultPrevented).toBe(false)
        expect(calls).toBe(1)
    })

    it('leaves a router-style click handler un-navigated until the modifier click', () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#link')
        const visits = []
        link.addEventListener('click', (event) => {
            if (event.defaultPrevented) return
            visits.push(link.getAttribute('href'))
        })

        click(link)
        click(link, { ctrlKey: true })
        expect(visits).toEqual(['https://example.com/page'])
    })

    it('shows the platform hint without writing it into the content', async () => {
        mountDesigner(designerHtml)
        const link = root.querySelector('#editor-link')
        const editor = root.querySelector('.ql-editor')
        const before = editor.innerHTML

        link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        await tick()

        const hint = root.querySelector('[data-cb-guard-hint]')
        expect(hint.textContent).toBe('Ctrl+click to follow link')
        expect(hint.style.display).toBe('block')
        expect(editor.innerHTML).toBe(before)
        expect(link.outerHTML).not.toContain('Ctrl+click')
        expect(link.hasAttribute('title')).toBe(false)

        const button = root.querySelector('#content-btn')
        click(button)
        expect(hint.textContent).toBe('Ctrl+click to activate')
        expect(button.outerHTML).not.toContain('Ctrl+click')

        link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, ctrlKey: true }))
        click(link, { ctrlKey: true })
        await tick()
        expect(hint.style.display).not.toBe('block')
    })

    it('does not guard links outside a content surface', () => {
        mountDesigner('<a id="help" href="https://example.com/help">Help</a>')
        expect(click(root.querySelector('#help')).defaultPrevented).toBe(false)
    })

    it('guards every link in a preview root and stops when detached', () => {
        root = document.createElement('div')
        root.innerHTML = '<a id="live" href="https://example.com/live">Live</a><button id="go" type="button">Go</button>'
        document.body.appendChild(root)
        detach = attachInteractiveGuard(root, { contentRoot: true, isApple: false, hintDelay: 0 })

        expect(root.hasAttribute('data-content-surface')).toBe(true)
        expect(click(root.querySelector('#live')).defaultPrevented).toBe(true)
        expect(click(root.querySelector('#go')).defaultPrevented).toBe(true)

        detach()
        detach = () => {}
        expect(root.hasAttribute('data-content-surface')).toBe(false)
        expect(click(root.querySelector('#live')).defaultPrevented).toBe(false)
        expect(root.querySelector('[data-cb-guard-hint]')).toBe(null)
    })

    describe('touch long-press', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            detach()
            detach = () => {}
            vi.clearAllTimers()
            vi.useRealTimers()
            vi.restoreAllMocks()
        })

        function pointer(target, type, init = {}) {
            const event = new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                pointerId: 1,
                pointerType: 'touch',
                button: 0,
                clientX: 20,
                clientY: 20,
                isPrimary: true,
                ...init
            })
            target.dispatchEvent(event)
            return event
        }

        function holdRing() {
            return root.querySelector('[data-cb-guard-hold]')
        }

        function hintText() {
            return root.querySelector('[data-cb-guard-hint]').textContent
        }

        it('activates a link when the hold completes and shows a progress ring', () => {
            mountDesigner(designerHtml)
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)
            const seen = []
            link.addEventListener('click', (event) => seen.push(event))

            pointer(link, 'pointerdown', { clientX: 40, clientY: 48 })
            expect(link.hasAttribute('data-cb-holding')).toBe(true)
            expect(holdRing().style.display).toBe('block')
            expect(hintText()).toBe('Hold to follow link')
            expect(document.querySelector('[data-cb-guard-style]').textContent).toContain('-webkit-touch-callout:none')

            const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
            link.dispatchEvent(menu)
            expect(menu.defaultPrevented).toBe(true)
            const selecting = new Event('selectstart', { bubbles: true, cancelable: true })
            link.dispatchEvent(selecting)
            expect(selecting.defaultPrevented).toBe(true)

            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS - 1)
            expect(open).not.toHaveBeenCalled()
            expect(link.hasAttribute('data-cb-holding')).toBe(true)

            vi.advanceTimersByTime(1)
            expect(open).toHaveBeenCalledTimes(1)
            expect(open).toHaveBeenCalledWith('https://example.com/page', '_blank', 'noopener,noreferrer')
            expect(seen).toHaveLength(1)
            expect(seen[0].defaultPrevented).toBe(false)
            expect(link.hasAttribute('data-cb-holding')).toBe(false)
            expect(holdRing().style.display).toBe('none')

            const ghost = click(link)
            expect(ghost.defaultPrevented).toBe(true)
            expect(open).toHaveBeenCalledTimes(1)
        })

        it('runs a button action and says hold to activate', () => {
            mountDesigner(designerHtml)
            const button = root.querySelector('#content-btn')
            const ran = vi.fn()
            button.addEventListener('click', ran)

            pointer(button, 'pointerdown', { pointerType: 'pen' })
            expect(hintText()).toBe('Hold to activate')
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(ran).toHaveBeenCalledTimes(1)
            expect(ran.mock.calls[0][0].defaultPrevented).toBe(false)
        })

        it('cancels when the contact lifts early', () => {
            mountDesigner(designerHtml)
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)

            pointer(link, 'pointerdown')
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS - 1)
            pointer(link, 'pointerup')
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()
            expect(link.hasAttribute('data-cb-holding')).toBe(false)
            expect(holdRing().style.display).toBe('none')
            expect(hintText()).toBe('Hold to follow link')
            expect(click(link).defaultPrevented).toBe(true)
        })

        it('cancels when the contact moves past the threshold, and keeps a small move', () => {
            mountDesigner(designerHtml)
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)

            pointer(link, 'pointerdown', { clientX: 0, clientY: 0 })
            pointer(window, 'pointermove', { clientX: 4, clientY: 0 })
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).toHaveBeenCalledTimes(1)

            open.mockClear()
            pointer(link, 'pointerdown', { clientX: 0, clientY: 0 })
            pointer(window, 'pointermove', { clientX: HOLD_MOVE_CANCEL_PX + 1, clientY: 0 })
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()
            expect(link.hasAttribute('data-cb-holding')).toBe(false)
        })

        it('cancels when the pointer is cancelled or the page scrolls', () => {
            mountDesigner(designerHtml)
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)

            pointer(link, 'pointerdown')
            pointer(link, 'pointercancel')
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()

            pointer(link, 'pointerdown')
            window.dispatchEvent(new Event('scroll'))
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()
            expect(holdRing().style.display).toBe('none')
        })

        it('does not activate on a tap', () => {
            mountDesigner(designerHtml)
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)

            pointer(link, 'pointerdown')
            pointer(link, 'pointerup')
            const tap = click(link)
            expect(tap.defaultPrevented).toBe(true)
            expect(open).not.toHaveBeenCalled()
            expect(hintText()).toBe('Hold to follow link')
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()
        })

        it('leaves desktop pointer and modifier clicks unchanged', () => {
            mountDesigner(designerHtml)
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)

            pointer(link, 'pointerdown', { pointerType: 'mouse', button: 0 })
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()
            expect(link.hasAttribute('data-cb-holding')).toBe(false)
            expect(holdRing().style.display).toBe('none')

            const plain = click(link)
            expect(plain.defaultPrevented).toBe(true)
            expect(hintText()).toBe('Ctrl+click to follow link')
            expect(click(link, { ctrlKey: true }).defaultPrevented).toBe(false)
            expect(open).not.toHaveBeenCalled()

            link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
            vi.advanceTimersByTime(0)
            expect(hintText()).toBe('Ctrl+click to follow link')

            const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
            link.dispatchEvent(menu)
            expect(menu.defaultPrevented).toBe(false)
        })

        it('does not hold builder chrome and does not activate after detach', () => {
            mountDesigner(designerHtml)
            const copy = root.querySelector('#copy')
            const link = root.querySelector('#link')
            const open = vi.spyOn(window, 'open').mockReturnValue(null)

            pointer(copy, 'pointerdown')
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(copy.hasAttribute('data-cb-holding')).toBe(false)
            expect(open).not.toHaveBeenCalled()

            pointer(link, 'pointerdown')
            expect(link.hasAttribute('data-cb-holding')).toBe(true)
            detach()
            detach = () => {}
            vi.advanceTimersByTime(HOLD_TO_ACTIVATE_MS)
            expect(open).not.toHaveBeenCalled()
            expect(link.hasAttribute('data-cb-holding')).toBe(false)
        })
    })

    it('leaves an unguarded render, such as exported HTML, behaving normally', () => {
        const host = document.createElement('div')
        host.innerHTML = '<a href="https://example.com/published" target="_blank">Ada</a><button type="submit">Send</button>'
        document.body.appendChild(host)
        const link = host.querySelector('a')
        let calls = 0
        link.onclick = () => { calls++ }

        const event = click(link)
        expect(event.defaultPrevented).toBe(false)
        expect(calls).toBe(1)
        expect(click(host.querySelector('button')).defaultPrevented).toBe(false)
    })
})

describe('Vue integration', () => {
    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('keeps selection clicks working while a child stopPropagation cannot undo the guard', async () => {
        const state = { selected: 0, stopped: 0 }
        const Harness = defineComponent({
            setup() {
                const root = ref(null)
                useInteractiveGuard(root, { isApple: false, hintDelay: 0 })
                return () => h('div', { ref: root }, [
                    h('button', { id: 'export', type: 'button' }, 'Export'),
                    h('div', { 'data-content-surface': '', onClick: () => { state.selected++ } }, [
                        h('a', { id: 'link', href: 'https://example.com' }, 'Open'),
                        h('a', {
                            id: 'stopped',
                            href: 'https://example.com/stop',
                            onClick: (event) => {
                                event.stopPropagation()
                                state.stopped++
                            }
                        }, 'Stop')
                    ])
                ])
            }
        })

        const wrapper = mount(Harness, { attachTo: document.body })
        await nextTick()

        const plain = click(wrapper.get('#link').element)
        expect(plain.defaultPrevented).toBe(true)
        expect(state.selected).toBe(1)

        const stopped = click(wrapper.get('#stopped').element)
        expect(stopped.defaultPrevented).toBe(true)
        expect(state.stopped).toBe(1)
        expect(state.selected).toBe(1)

        const exportClick = click(wrapper.get('#export').element)
        expect(exportClick.defaultPrevented).toBe(false)

        wrapper.unmount()
    })

    it('guards a preview mounted with the directive and nowhere else', async () => {
        const Host = defineComponent({
            setup() {
                return () => h('div', [
                    withDirectives(h('div', { id: 'preview' }, [
                        h('a', { id: 'preview-link', href: 'https://example.com/preview' }, 'Preview')
                    ]), [[vInteractiveGuard, { isApple: true, hintDelay: 0 }]]),
                    h('a', { id: 'outside', href: 'https://example.com/outside' }, 'Outside')
                ])
            }
        })

        const wrapper = mount(Host, { attachTo: document.body })
        await nextTick()

        expect(click(wrapper.get('#preview-link').element).defaultPrevented).toBe(true)
        expect(click(wrapper.get('#preview-link').element, { metaKey: true }).defaultPrevented).toBe(false)
        expect(click(wrapper.get('#outside').element).defaultPrevented).toBe(false)
        expect(wrapper.get('[data-cb-guard-hint]').text()).toBe('Cmd+click to follow link')

        wrapper.unmount()
        expect(document.querySelector('[data-cb-guard-hint]')).toBe(null)
    })

})
