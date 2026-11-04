import { isRef, onBeforeUnmount, onMounted, watch } from 'vue'
import { attachInteractiveGuard } from '../utils/interactiveGuard'

/**
 * Attach the content-link guard to a designer or preview root for the
 * lifetime of the current component.
 *
 * Pass a template ref. Leave `contentRoot` false on the designer (only
 * `[data-content-surface]` and Quill `.ql-editor` regions are guarded) and
 * set `contentRoot: true` for a preview that contains only user HTML.
 */
export function useInteractiveGuard(target, options = {}) {
    let detach = () => {}

    const bind = (el) => {
        detach()
        detach = () => {}
        if (el) detach = attachInteractiveGuard(el, options)
    }

    if (isRef(target)) {
        watch(target, (el) => bind(el), { flush: 'post', immediate: true })
    }

    onMounted(() => {
        const el = isRef(target) ? target.value : target
        bind(el)
    })

    onBeforeUnmount(() => {
        detach()
        detach = () => {}
    })
}
