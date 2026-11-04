import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import EmailBuilder from './EmailBuilder.vue'
import { createBlock } from '../blocks'

function dataTransfer() {
    const data = {}
    return {
        effectAllowed: '',
        setData: (type, value) => { data[type] = String(value) },
        getData: (type) => data[type] || ''
    }
}

async function mountBuilder() {
    const wrapper = mount(EmailBuilder, { attachTo: document.body })
    await nextTick()
    return wrapper
}

/** Drag a sidebar item (by its label) from the given tab and drop it on `target`. */
async function dragFromSidebar(wrapper, tab, label, target) {
    await wrapper.findAll('.tab__btn').find(b => b.text() === tab).trigger('click')
    const item = wrapper.findAll('.content__item').find(i => i.text() === label)
    const transfer = dataTransfer()
    await item.trigger('dragstart', { dataTransfer: transfer })
    await target().trigger('drop', { dataTransfer: transfer })
    await nextTick()
}

const modelUpdates = (wrapper) => wrapper.emitted('update:modelValue')?.length ?? 0
const lastJson = (wrapper) => wrapper.emitted('update:modelValue').at(-1)[0].json

describe('EmailBuilder state changes', () => {
    it('emits change and update:modelValue once per edit', async () => {
        const wrapper = await mountBuilder()
        const updatesBefore = modelUpdates(wrapper)
        const changesBefore = wrapper.emitted('change')?.length ?? 0

        await dragFromSidebar(wrapper, 'Content', 'Divider', () => wrapper.find('.canvas__container'))

        expect(modelUpdates(wrapper)).toBe(updatesBefore + 1)
        expect(wrapper.emitted('change').length).toBe(changesBefore + 1)
        expect(lastJson(wrapper).blocks.map(b => b.type)).toEqual(['divider'])

        // select it, then delete via the block actions
        await wrapper.find('.block-wrapper').trigger('click')
        const deleteUpdatesBefore = modelUpdates(wrapper)
        await wrapper.find('.block-actions button[title="Delete"]').trigger('click')
        await nextTick()

        expect(modelUpdates(wrapper)).toBe(deleteUpdatesBefore + 1)
        expect(lastJson(wrapper).blocks).toEqual([])

        wrapper.unmount()
    })

    it('still emits body setting edits', async () => {
        const wrapper = await mountBuilder()
        await wrapper.findAll('.tab__btn').find(b => b.text() === 'Body').trigger('click')
        const before = modelUpdates(wrapper)

        await wrapper.find('textarea.preheader-input').setValue('Hello inbox')
        await nextTick()

        expect(modelUpdates(wrapper)).toBe(before + 1)
        expect(lastJson(wrapper).bodySettings.preheaderText).toBe('Hello inbox')

        wrapper.unmount()
    })

    it('drops content into a row column', async () => {
        const wrapper = await mountBuilder()
        await dragFromSidebar(wrapper, 'Blocks', '2 Columns 50/50', () => wrapper.find('.canvas__container'))
        await dragFromSidebar(wrapper, 'Content', 'Divider', () => wrapper.findAll('.row-block__column')[1])

        const [row] = lastJson(wrapper).blocks
        expect(row.columns[0].blocks).toEqual([])
        expect(row.columns[1].blocks.map(b => b.type)).toEqual(['divider'])

        wrapper.unmount()
    })

    it('turns a row dropped into a column into a new top-level row after it', async () => {
        const wrapper = await mountBuilder()
        await dragFromSidebar(wrapper, 'Blocks', '2 Columns 50/50', () => wrapper.find('.canvas__container'))
        await dragFromSidebar(wrapper, 'Blocks', '1 Column', () => wrapper.find('.canvas__container'))
        const [first] = lastJson(wrapper).blocks

        await dragFromSidebar(wrapper, 'Blocks', '3 Columns 33/33/33', () => wrapper.findAll('.row-block__column')[0])

        const blocks = lastJson(wrapper).blocks
        expect(blocks.map(b => b.columns.length)).toEqual([2, 3, 1])
        expect(blocks[0].id).toBe(first.id)
        expect(blocks[0].columns.every(c => c.blocks.length === 0)).toBe(true)

        wrapper.unmount()
    })

    it('does not echo or loop when bound with v-model', async () => {
        let updates = 0
        const Parent = defineComponent({
            setup() {
                const data = ref({ json: {}, html: '' })
                return () => h(EmailBuilder, {
                    modelValue: data.value,
                    'onUpdate:modelValue': (v) => { updates++; data.value = v }
                })
            }
        })
        const wrapper = mount(Parent, { attachTo: document.body })
        await nextTick(); await nextTick()
        const builder = wrapper.findComponent(EmailBuilder)
        const before = updates

        await dragFromSidebar(builder, 'Content', 'Divider', () => builder.find('.canvas__container'))
        await nextTick(); await nextTick()

        expect(updates).toBe(before + 1)
        expect(builder.findAll('.block-wrapper')).toHaveLength(1)

        wrapper.unmount()
    })
})

describe('EmailBuilder variables', () => {
    const variables = [{ label: 'First name', format: '$$first_name$$' }]

    async function mountWithRow() {
        const paragraph = createBlock({ type: 'paragraph' })
        const image = createBlock({ type: 'image' })
        const row = createBlock({ type: 'row', columns: [{ width: 50 }, { width: 50 }] })
        row.columns[0].blocks.push(paragraph)
        row.columns[1].blocks.push(image)

        const wrapper = mount(EmailBuilder, {
            attachTo: document.body,
            props: { variables, modelValue: { json: { blocks: [row, createBlock({ type: 'image' })] }, html: '' } }
        })
        await nextTick(); await nextTick()
        return wrapper
    }

    it('offers the variable picker for text blocks inside row columns', async () => {
        const wrapper = await mountWithRow()
        await wrapper.find('.row-block__column .paragraph-block').trigger('dblclick')
        await nextTick(); await nextTick()

        const options = wrapper.findAll('.row-block__column .toolbar__vars option')
        expect(options.map(o => o.text())).toEqual(['First name'])

        await wrapper.find('.row-block__column .btn-var').trigger('click')
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await nextTick()

        const [row] = wrapper.emitted('update:modelValue').at(-1)[0].json.blocks
        expect(row.columns[0].blocks[0].properties.text).toContain('$$first_name$$')
        wrapper.unmount()
    })

    it('does not leak variables onto blocks as a DOM attribute', async () => {
        const wrapper = await mountWithRow()

        expect(wrapper.findAll('.canvas__container [variables]')).toHaveLength(0)
        wrapper.unmount()
    })
})
