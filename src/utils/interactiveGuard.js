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
 * - Touch and pen (pointerType, not the user agent): holding a guarded control for
 *   HOLD_TO_ACTIVATE_MS performs the same allowed activation as a modifier click.
 *   A short tap still only selects. The hold is cancelled if the contact moves more
 *   than HOLD_MOVE_CANCEL_PX, lifts early, scrolls, or the pointer is cancelled.
 *   Mouse pointers never start a hold, so Cmd/Ctrl+click is unchanged.
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

// Long enough to tell a tap from a hold, short of the 1.5s end of the range
// Richard suggested. One place controls the timer, the ring, and the tests.
export const HOLD_TO_ACTIVATE_MS = 1200
export const HOLD_MOVE_CANCEL_PX = 10
const HOLD_RING_RADIUS = 14
const HOLD_RING_LENGTH = 2 * Math.PI * HOLD_RING_RADIUS
const SVG_NS = 'http://www.w3.org/2000/svg'

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

export function activationHint(element, apple, mode) {
    const tag = element && element.tagName
    const follow = tag === 'A' || tag === 'AREA'
    if (mode === 'hold') return follow ? 'Hold to follow link' : 'Hold to activate'
    const key = modifierLabel(!!apple)
    return follow ? `${key}+click to follow link` : `${key}+click to activate`
}

export function isHoldPointer(event) {
    if (!event || event.button !== 0) return false
    return event.pointerType === 'touch' || event.pointerType === 'pen'
}

function formOf(interactive) {
    if (!interactive) return null
    if (interactive.form) return interactive.form
    if (typeof interactive.closest === 'function') return interactive.closest('form')
    return null
}

/**
 * Performs the default action of a user click. Used when a hold completes,
 * because a timer cannot produce a trusted click and browsers ignore the
 * default action of a synthetic one. Modifier clicks do not use this; the
 * browser handles those itself.
 */
export function followInteractive(interactive, view) {
    const targetView = view || (typeof window !== 'undefined' ? window : null)
    if (!interactive || !targetView) return
    const tag = interactive.tagName
    if (tag === 'A' || tag === 'AREA') {
        const raw = interactive.getAttribute('href')
        if (raw == null) return
        const href = interactive.href || raw
        const target = (interactive.getAttribute('target') || '').trim()
        if (!target || target === '_self') {
            targetView.location.assign(href)
            return
        }
        if (target === '_top' && targetView.top) {
            targetView.top.location.assign(href)
            return
        }
        if (target === '_parent' && targetView.parent) {
            targetView.parent.location.assign(href)
            return
        }
        targetView.open(href, target, 'noopener,noreferrer')
        return
    }
    const form = formOf(interactive)
    if (isSubmitter(interactive)) {
        if (!form) return
        if (typeof form.requestSubmit === 'function') {
            try {
                form.requestSubmit(interactive)
            } catch {
                form.requestSubmit()
            }
        } else {
            form.submit()
        }
        return
    }
    if (isResetter(interactive) && form) form.reset()
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
 * @param {{ isApple?: boolean|(() => boolean), navigator?: Navigator, contentRoot?: boolean, hintDelay?: number, holdDuration?: number }} [options]
 * `contentRoot: true` marks `root` itself as a content surface (a preview that
 * contains only user HTML). The designer leaves this false and marks the canvas
 * with `data-content-surface`; Quill editors are always content surfaces.
 * @returns {() => void} detach
 */
export function attachInteractiveGuard(root, options = {}) {
    if (!root || root.nodeType !== 1) return () => {}

    const hintDelay = Number.isFinite(options.hintDelay) ? Math.max(0, options.hintDelay) : DEFAULT_HINT_DELAY
    const holdDuration = Number.isFinite(options.holdDuration) ? Math.max(0, options.holdDuration) : HOLD_TO_ACTIVATE_MS
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
    let recentTouch = false
    let recentTouchTimer = 0
    let hold = null
    let swallowClick = null
    const syntheticHolds = new WeakSet()

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

    const ring = document.createElement('div')
    ring.setAttribute('data-cb-guard-hold', '')
    ring.setAttribute('data-builder-chrome', '')
    ring.setAttribute('aria-hidden', 'true')
    ring.style.cssText = 'position:fixed;z-index:10002;display:none;pointer-events:none;width:36px;height:36px;margin:0;filter:drop-shadow(0 1px 2px rgba(15,23,42,.35))'
    const ringSvg = document.createElementNS(SVG_NS, 'svg')
    ringSvg.setAttribute('viewBox', '0 0 36 36')
    ringSvg.setAttribute('width', '36')
    ringSvg.setAttribute('height', '36')
    const ringDisc = document.createElementNS(SVG_NS, 'circle')
    ringDisc.setAttribute('cx', '18')
    ringDisc.setAttribute('cy', '18')
    ringDisc.setAttribute('r', '16')
    ringDisc.setAttribute('fill', '#ffffff')
    const ringTrack = document.createElementNS(SVG_NS, 'circle')
    ringTrack.setAttribute('cx', '18')
    ringTrack.setAttribute('cy', '18')
    ringTrack.setAttribute('r', String(HOLD_RING_RADIUS))
    ringTrack.setAttribute('fill', 'none')
    ringTrack.setAttribute('stroke', '#e5e7eb')
    ringTrack.setAttribute('stroke-width', '3')
    const ringProgress = document.createElementNS(SVG_NS, 'circle')
    ringProgress.setAttribute('data-cb-hold-progress', '')
    ringProgress.setAttribute('cx', '18')
    ringProgress.setAttribute('cy', '18')
    ringProgress.setAttribute('r', String(HOLD_RING_RADIUS))
    ringProgress.setAttribute('fill', 'none')
    ringProgress.setAttribute('stroke', '#2f4574')
    ringProgress.setAttribute('stroke-width', '3')
    ringProgress.setAttribute('stroke-linecap', 'round')
    ringProgress.setAttribute('transform', 'rotate(-90 18 18)')
    ringSvg.append(ringDisc, ringTrack, ringProgress)
    ring.appendChild(ringSvg)
    root.appendChild(ring)

    const calloutStyle = document.createElement('style')
    calloutStyle.setAttribute('data-cb-guard-style', '')
    calloutStyle.textContent = '[data-cb-holding]{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}'
    ;(document.head || root).appendChild(calloutStyle)

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
        tooltip.textContent = activationHint(anchor, apple(), recentTouch ? 'hold' : 'modifier')
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
        if (!syntheticHolds.has(event) && !isFollowModifier(event, apple())) return false
        armFrom(interactive)
        hideHint()
        return true
    }

    function markTouch(event) {
        recentTouch = isHoldPointer(event)
        if (recentTouchTimer) clearTimeout(recentTouchTimer)
        if (!recentTouch) return
        recentTouchTimer = setTimeout(() => {
            recentTouchTimer = 0
            recentTouch = false
        }, 2000)
    }

    function hideRing() {
        ring.style.display = 'none'
    }

    function releaseHoldCapture() {
        if (!hold) return
        const captor = hold.interactive
        if (captor && typeof captor.hasPointerCapture === 'function' && captor.hasPointerCapture(hold.pointerId)) {
            try { captor.releasePointerCapture(hold.pointerId) } catch { /* already released */ }
        }
    }

    function clearHold() {
        if (!hold) return
        clearTimeout(hold.timer)
        releaseHoldCapture()
        if (hold.interactive) hold.interactive.removeAttribute('data-cb-holding')
        hold = null
        hideRing()
    }

    function cancelHold() {
        clearHold()
        hideHint()
    }

    function startRing(x, y) {
        ring.style.left = `${x - 18}px`
        ring.style.top = `${y - 18}px`
        ring.style.display = 'block'
        ringProgress.style.transition = 'none'
        ringProgress.style.strokeDasharray = String(HOLD_RING_LENGTH)
        ringProgress.style.strokeDashoffset = String(HOLD_RING_LENGTH)
        // Restart the transition from a full ring to empty over the hold.
        if (typeof ringProgress.getBoundingClientRect === 'function') ringProgress.getBoundingClientRect()
        ringProgress.style.transition = `stroke-dashoffset ${holdDuration}ms linear`
        ringProgress.style.strokeDashoffset = '0'
    }

    function finishHold() {
        if (!hold) return
        const interactive = hold.interactive
        clearHold()
        if (!interactive || !interactive.isConnected) return
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
        syntheticHolds.add(event)
        const proceeded = interactive.dispatchEvent(event)
        // The finger is still down. The browser will emit a real click on
        // pointerup; swallow that one so the action does not run twice.
        swallowClick = interactive
        if (!proceeded) return
        try { followInteractive(interactive) } catch { /* navigation can throw outside a browser */ }
    }

    function onPointerDown(event) {
        markTouch(event)
        if (!isHoldPointer(event)) return
        if (hold) return
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        swallowClick = null
        interactive.setAttribute('data-cb-holding', '')
        const timer = setTimeout(finishHold, holdDuration)
        hold = {
            pointerId: event.pointerId,
            interactive,
            x: event.clientX,
            y: event.clientY,
            timer
        }
        startRing(event.clientX, event.clientY)
        showHint(interactive)
    }

    function onPointerMove(event) {
        if (!hold || event.pointerId !== hold.pointerId) return
        const dx = event.clientX - hold.x
        const dy = event.clientY - hold.y
        if ((dx * dx) + (dy * dy) > HOLD_MOVE_CANCEL_PX * HOLD_MOVE_CANCEL_PX) cancelHold()
    }

    function onPointerUp(event) {
        if (!hold || event.pointerId !== hold.pointerId) return
        const interactive = hold.interactive
        clearHold()
        showHint(interactive)
    }

    function onPointerCancel(event) {
        if (!hold || event.pointerId !== hold.pointerId) return
        cancelHold()
    }

    function onContextMenu(event) {
        const interactive = findGuardedInteractive(event.target, root)
        if (!interactive) return
        // Desktop right-click still opens the menu. Touch and pen long-press
        // would otherwise show the iOS callout or Android menu and steal the hold.
        if (hold || recentTouch) event.preventDefault()
    }

    function onSelectStart(event) {
        if (!hold) return
        if (hold.interactive === findGuardedInteractive(event.target, root) || hold.interactive.contains(event.target)) {
            event.preventDefault()
        }
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
        if (swallowClick === interactive && !syntheticHolds.has(event)) {
            swallowClick = null
            event.preventDefault()
            event.stopPropagation()
            suppressInlineHandler(interactive, 'onclick')
            return
        }
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
    function onScroll() {
        if (hold) cancelHold()
        else hideHint()
    }

    const pointerBindings = [
        ['pointerdown', onPointerDown],
        ['pointermove', onPointerMove],
        ['pointerup', onPointerUp],
        ['pointercancel', onPointerCancel],
        ['contextmenu', onContextMenu],
        ['selectstart', onSelectStart]
    ]

    for (const [type, handler] of pointerBindings) {
        root.addEventListener(type, handler, true)
    }
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('pointercancel', onPointerCancel, true)
    window.addEventListener('scroll', onScroll, true)

    return function detach() {
        for (const [type, handler] of bindings) {
            root.removeEventListener(type, handler, true)
        }
        for (const [type, handler] of pointerBindings) {
            root.removeEventListener(type, handler, true)
        }
        window.removeEventListener('pointermove', onPointerMove, true)
        window.removeEventListener('pointerup', onPointerUp, true)
        window.removeEventListener('pointercancel', onPointerCancel, true)
        window.removeEventListener('scroll', onScroll, true)
        clearHold()
        clearHintTimer()
        if (disarmTimer) clearTimeout(disarmTimer)
        if (recentTouchTimer) clearTimeout(recentTouchTimer)
        tooltip.remove()
        ring.remove()
        calloutStyle.remove()
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
