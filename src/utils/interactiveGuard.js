/**
 * Stops user-authored links and buttons from firing while someone is designing.
 *
 * The listener sits on the designer root in the capture phase, so it runs before
 * any descendant handler. preventDefault there still holds if a child calls
 * stopPropagation or stopImmediatePropagation later. Selection and other editor
 * clicks keep working because this does not stop propagation.
 *
 * Scope:
 * - Guarded: elements inside a content surface (`[data-content-surface]`, Quill's
 *   `.ql-editor`, or the root itself when `contentRoot` is set for a preview).
 * - Not guarded: builder chrome (toolbar, block actions, Quill toolbar/tooltip,
 *   anything under `[data-builder-chrome]`), and anything outside a content surface.
 * - Not applied to exported HTML. `generateHTML` never includes this script.
 *
 * Activation (the deliberate "follow / trigger" gesture):
 * - macOS / iOS: Meta (Cmd). Ctrl is not treated as activation because Ctrl+click
 *   is the right-click / context-menu gesture on Apple platforms.
 * - Windows / Linux / ChromeOS: Ctrl. Meta is also accepted so a Cmd key still
 *   works on a non-Apple machine.
 * - Alt or Shift alone do not activate.
 * - Middle-click (auxclick / mouse button 1) does not bypass the guard. It is
 *   blocked unless the platform modifier is held as well. Right-click is left
 *   alone so the context menu still opens.
 * - Enter on a focused link or button, and Space on a button, are blocked unless
 *   the same modifier is held. Typing (inputs, textareas, contenteditable, including
 *   Quill) is not intercepted; a form submit from those is cancelled separately.
 *
 * Same-origin iframe documents are a separate tree. Nothing in this package renders
 * a preview iframe; call `attachInteractiveGuard` on the iframe document if one is
 * added later. Cross-origin frames cannot be reached.
 */

export const CONTENT_SURFACE_SELECTOR = '[data-content-surface], .ql-editor'

export const CHROME_SELECTOR = [
    '[data-builder-chrome]',
    '.block-actions',
    '.editing-actions',
    '.ql-toolbar',
    '.ql-tooltip'
].join(', ')

export const INTERACTIVE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button',
    'input[type="submit"]',
    'input[type="reset"]',
    'input[type="button"]',
    'input[type="image"]'
].join(', ')

// "Mac" covers MacIntel / Macintosh / macOS. "iPad" also covers iPadOS.
// Safari does not expose userAgentData; Chromium on iOS reports platform "iOS".
const APPLE_RE = /Mac|iPhone|iPad|iPod|iOS/i
const HINT_ATTR = 'data-cb-guard-hint'
const DETACH_KEY = '__cbInteractiveGuardDetach'
const DEFAULT_HINT_DELAY = 400

export function isApplePlatform(nav) {
    const source = nav === undefined
        ? (typeof navigator === 'undefined' ? undefined : navigator)
        : nav
    if (!source) return false
    const parts = [
        source.userAgentData && source.userAgentData.platform,
        source.platform,
        source.userAgent,
        source.vendor
    ]
    return APPLE_RE.test(parts.filter(Boolean).join(' '))
}

export function modifierLabel(apple) {
    return apple ? 'Cmd' : 'Ctrl'
}

export function activationHint(element, apple) {
    const key = modifierLabel(!!apple)
    const tag = element && element.tagName
    if (tag === 'A' || tag === 'AREA') return `${key}+click to follow link`
    return `${key}+click to activate`
}

export function isFollowModifier(event, apple) {
    if (!event) return false
    if (apple) return event.metaKey === true
    return event.ctrlKey === true || event.metaKey === true
}

function asElement(node) {
    if (!node) return null
    if (node.nodeType === 1) return node
    return node.parentElement || null
}

export function findGuardedInteractive(target, root) {
    const start = asElement(target)
    if (!start || !root || !root.contains(start)) return null
    const interactive = start.closest(INTERACTIVE_SELECTOR)
    if (!interactive || !root.contains(interactive)) return null
    if (interactive.closest(CHROME_SELECTOR)) return null
    const surface = interactive.closest(CONTENT_SURFACE_SELECTOR)
    if (!surface || !root.contains(surface)) return null
    return interactive
}

function isTypingContext(target) {
    const el = asElement(target)
    if (!el) return false
    if (el.isContentEditable) return true
    const tag = el.tagName
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (tag === 'INPUT') {
        const type = (el.getAttribute('type') || 'text').toLowerCase()
        return !['submit', 'reset', 'button', 'image'].includes(type)
    }
    return false
}

function inputType(el) {
    return (el.getAttribute('type') || '').toLowerCase()
}

function isSubmitter(el) {
    if (!el) return false
    if (el.tagName === 'BUTTON') {
        const type = (el.getAttribute('type') || 'submit').toLowerCase()
        return type === 'submit'
    }
    if (el.tagName === 'INPUT') {
        const type = inputType(el)
        return type === 'submit' || type === 'image'
    }
    return false
}

function isResetter(el) {
    if (!el) return false
    if (el.tagName === 'BUTTON') return (el.getAttribute('type') || '').toLowerCase() === 'reset'
    if (el.tagName === 'INPUT') return inputType(el) === 'reset'
    return false
}

function activatesOnSpace(el) {
    if (!el) return false
    if (el.tagName === 'BUTTON') return true
    if (el.tagName === 'INPUT') {
        return ['submit', 'reset', 'button', 'image'].includes(inputType(el))
    }
    return false
}

function shouldGuardForm(form, root) {
    if (!form || form.tagName !== 'FORM' || !root.contains(form)) return false
    if (form.closest(CHROME_SELECTOR)) return false
    const surface = form.closest(CONTENT_SURFACE_SELECTOR)
    return !!(surface && root.contains(surface))
}

function suppressInlineHandler(el, prop) {
    if (!el || typeof el[prop] !== 'function') return
    const handler = el[prop]
    el[prop] = null
    setTimeout(() => {
        if (el[prop] == null) el[prop] = handler
    }, 0)
}

/**
 * @param {HTMLElement} root Designer root, or a preview root.
 * @param {{ isApple?: boolean|(() => boolean), navigator?: Navigator, contentRoot?: boolean, hintDelay?: number }} [options]
 * `contentRoot: true` marks `root` itself as a content surface (a preview that
 * contains only user HTML). The designer leaves this false and marks the canvas
 * with `data-content-surface`; Quill editors are always content surfaces.
 * @returns {() => void} detach
 */
export function attachInteractiveGuard(root, options = {}) {
    if (!root || root.nodeType !== 1) return () => {}

    const hintDelay = Number.isFinite(options.hintDelay) ? Math.max(0, options.hintDelay) : DEFAULT_HINT_DELAY
    let addedSurface = false
    if (options.contentRoot && !root.hasAttribute('data-content-surface')) {
        root.setAttribute('data-content-surface', '')
        addedSurface = true
    }

    const apple = () => {
        if (typeof options.isApple === 'function') return !!options.isApple()
        if (typeof options.isApple === 'boolean') return options.isApple
        return isApplePlatform(options.navigator)
    }

    let hintTimer = 0
    let armedSubmit = false
    let armedReset = false
    let disarmTimer = 0

    const tooltip = document.createElement('div')
    tooltip.setAttribute(HINT_ATTR, '')
    tooltip.setAttribute('data-builder-chrome', '')
    tooltip.setAttribute('role', 'tooltip')
    tooltip.setAttribute('aria-live', 'polite')
    tooltip.setAttribute('aria-hidden', 'true')
    tooltip.style.cssText = [
        'position:fixed',
        'z-index:10001',
        'display:none',
        'pointer-events:none',
        'margin:0',
        'max-width:240px',
        'padding:4px 8px',
        'border:1px solid #e5e7eb',
        'border-radius:4px',
        'background:#ffffff',
        'color:#374151',
        'font:12px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        'box-shadow:0 2px 8px rgba(0,0,0,0.15)',
        'white-space:nowrap'
    ].join(';')
    root.appendChild(tooltip)

    function clearHintTimer() {
        if (hintTimer) {
            clearTimeout(hintTimer)
            hintTimer = 0
        }
    }

    function hideHint() {
        clearHintTimer()
        tooltip.style.display = 'none'
        tooltip.setAttribute('aria-hidden', 'true')
    }

    function placeTooltip(anchor) {
        const rect = anchor.getBoundingClientRect()
        tooltip.style.display = 'block'
        const tipRect = tooltip.getBoundingClientRect()
        let top = rect.bottom + 6
        let left = rect.left
        if (top + tipRect.height > window.innerHeight - 8) {
            top = rect.top - tipRect.height - 6
        }
        if (left + tipRect.width > window.innerWidth - 8) {
            left = window.innerWidth - tipRect.width - 8
        }
        if (left < 8) left = 8
        if (top < 8) top = 8
        tooltip.style.top = `${top}px`
        tooltip.style.left = `${left}px`
    }

    function showHint(anchor) {
        if (!anchor || !anchor.isConnected) return
        clearHintTimer()
        tooltip.setAttribute('aria-hidden', 'false')
        tooltip.textContent = activationHint(anchor, apple())
        placeTooltip(anchor)
    }

    function scheduleHint(anchor) {
        clearHintTimer()
        hintTimer = setTimeout(() => {
            hintTimer = 0
            showHint(anchor)
        }, hintDelay)
    }

    function disarmSoon() {
        if (disarmTimer) clearTimeout(disarmTimer)
        disarmTimer = setTimeout(() => {
            disarmTimer = 0
            armedSubmit = false
            armedReset = false
        }, 0)
    }

    function armFrom(interactive) {
        armedSubmit = isSubmitter(interactive)
        armedReset = isResetter(interactive)
        if (armedSubmit || armedReset) disarmSoon()
    }

    function allow(event, interactive) {
        if (!isFollowModifier(event, apple())) return false
        armFrom(interactive)
        hideHint()
        return true
    }

    function block(event, interactive) {
        event.preventDefault()
        if (event.type === 'click' || event.type === 'auxclick' || event.type === 'keydown') {
            suppressInlineHandler(interactive, 'onclick')
        }
        showHint(interactive)
    }

    function onClick(event) {
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        if (allow(event, interactive)) return
        block(event, interactive)
    }

    function onAuxClick(event) {
        // Middle-click follows links in a new tab. Button 1 is the case that
        // matters; other aux clicks are blocked the same way so they cannot
        // bypass the guard. The context menu is a separate `contextmenu` event.
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        if (allow(event, interactive)) return
        block(event, interactive)
    }

    function onMouseDown(event) {
        // Primary button must stay un-cancelled so text selection and drag still start.
        // Middle button is cancelled early because Firefox can open a tab from mousedown.
        if (event.button !== 1) return
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        if (allow(event, interactive)) return
        event.preventDefault()
        showHint(interactive)
    }

    function onKeyDown(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return
        if (isTypingContext(event.target)) return
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        if (event.key === ' ' && !activatesOnSpace(interactive)) return
        if (allow(event, interactive)) return
        block(event, interactive)
    }

    function onKeyUp(event) {
        if (event.key !== ' ') return
        if (isTypingContext(event.target)) return
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive || !activatesOnSpace(interactive)) return
        if (isFollowModifier(event, apple())) {
            armFrom(interactive)
            return
        }
        // Space activates buttons on keyup. Cancelling keydown is not enough
        // in every browser, so the keyup default is cancelled too.
        event.preventDefault()
    }

    function onSubmit(event) {
        const form = event.target
        if (!shouldGuardForm(form, root)) return
        if (armedSubmit) {
            armedSubmit = false
            return
        }
        event.preventDefault()
        suppressInlineHandler(form, 'onsubmit')
        const submitter = form.querySelector('button[type="submit"], input[type="submit"], input[type="image"], button:not([type])')
        showHint(submitter || form)
    }

    function onReset(event) {
        const form = event.target
        if (!shouldGuardForm(form, root)) return
        if (armedReset) {
            armedReset = false
            return
        }
        event.preventDefault()
        const resetter = form.querySelector('button[type="reset"], input[type="reset"]')
        showHint(resetter || form)
    }

    function onMouseOver(event) {
        // A modified hover is the start of a deliberate follow-click. Don't
        // pop the "hold the modifier" hint over a gesture that is already allowed.
        if (isFollowModifier(event, apple())) return
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        const from = asElement(event.relatedTarget)
        if (from && interactive.contains(from)) return
        scheduleHint(interactive)
    }

    function onMouseOut(event) {
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        const to = asElement(event.relatedTarget)
        if (to && (interactive.contains(to) || tooltip.contains(to))) return
        hideHint()
    }

    function onFocusIn(event) {
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        showHint(interactive)
    }

    function onFocusOut(event) {
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        const to = asElement(event.relatedTarget)
        if (to && interactive.contains(to)) return
        hideHint()
    }

    const bindings = [
        ['click', onClick],
        ['auxclick', onAuxClick],
        ['mousedown', onMouseDown],
        ['keydown', onKeyDown],
        ['keyup', onKeyUp],
        ['submit', onSubmit],
        ['reset', onReset],
        ['mouseover', onMouseOver],
        ['mouseout', onMouseOut],
        ['focusin', onFocusIn],
        ['focusout', onFocusOut]
    ]

    for (const [type, handler] of bindings) {
        root.addEventListener(type, handler, true)
    }
    window.addEventListener('scroll', hideHint, true)

    return function detach() {
        for (const [type, handler] of bindings) {
            root.removeEventListener(type, handler, true)
        }
        window.removeEventListener('scroll', hideHint, true)
        clearHintTimer()
        if (disarmTimer) clearTimeout(disarmTimer)
        tooltip.remove()
        if (addedSurface) root.removeAttribute('data-content-surface')
    }
}

export const vInteractiveGuard = {
    mounted(el, binding) {
        const value = binding && binding.value ? binding.value : {}
        el[DETACH_KEY] = attachInteractiveGuard(el, { contentRoot: true, ...value })
    },
    unmounted(el) {
        const detach = el[DETACH_KEY]
        if (typeof detach === 'function') detach()
        delete el[DETACH_KEY]
    }
}
