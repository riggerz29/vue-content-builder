import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ParagraphBlock from '../components/blocks/ParagraphBlock.vue'
import ButtonBlock from '../components/blocks/ButtonBlock.vue'
import { createBlock } from '../blocks'

const settle = async () => { await nextTick(); await nextTick() }

function mountBlock(component, type, props = {}) {
    return mount(component, {
        attachTo: document.body,
        props: { block: createBlock({ type }), index: 0, ...props }
    })
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe('useInlineEditor', () => {
    it('opens Quill on double-click and emits one update when clicking outside', async () => {
        const wrapper = mountBlock(ParagraphBlock, 'paragraph')
        await wrapper.find('.paragraph-block').trigger('dblclick')
        await settle()

        expect(wrapper.find('.ql-editor').exists()).toBe(true)
        expect(wrapper.find('.ql-toolbar .ql-list').exists()).toBe(true) // full toolbar

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await settle()

        expect(wrapper.emitted('update')).toHaveLength(1)
        expect(wrapper.find('.ql-editor').exists()).toBe(false)
        wrapper.unmount()
    })

    it('uses the basic toolbar for buttons', async () => {
        const wrapper = mountBlock(ButtonBlock, 'button')
        await wrapper.find('.button-block').trigger('dblclick')
        await settle()

        expect(wrapper.find('.ql-toolbar .ql-bold').exists()).toBe(true)
        expect(wrapper.find('.ql-toolbar .ql-list').exists()).toBe(false)
        wrapper.unmount()
    })

    it('inserts the selected variable into the editor', async () => {
        const wrapper = mountBlock(ParagraphBlock, 'paragraph', {
            variables: [{ label: 'First name', format: '$$first_name$$' }, { name: 'incomplete' }]
        })
        await wrapper.find('.paragraph-block').trigger('dblclick')
        await settle()

        expect(wrapper.findAll('.toolbar__vars option')).toHaveLength(1)
        await wrapper.find('.btn-var').trigger('click')
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await settle()

        const [, properties] = wrapper.emitted('update').at(-1)
        expect(properties.text).toContain('$$first_name$$')
        wrapper.unmount()
    })

    it('removes its document listener when unmounted mid-edit', async () => {
        const add = vi.spyOn(document, 'addEventListener')
        const remove = vi.spyOn(document, 'removeEventListener')
        const wrapper = mountBlock(ParagraphBlock, 'paragraph')
        await wrapper.find('.paragraph-block').trigger('dblclick')
        await settle()

        const handler = add.mock.calls.find(([type]) => type === 'mousedown')?.[1]
        expect(handler).toBeTypeOf('function')

        wrapper.unmount()
        expect(remove).toHaveBeenCalledWith('mousedown', handler)
    })
})
