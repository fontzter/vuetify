import VEditDialog from '../VEditDialog'
import VMenu from '../../VMenu'

import {
  mount,
  Wrapper,
  MountOptions,
} from '@vue/test-utils'
import { keyCodes } from '../../../util/helpers'

describe('VEditDialog.ts', () => {
  type Instance = InstanceType<typeof VEditDialog>
  let mountFunction: (options?: MountOptions<Instance>) => Wrapper<Instance>
  beforeEach(() => {
    document.body.setAttribute('data-app', 'true')

    mountFunction = (options?: MountOptions<Instance>) => {
      return mount(VEditDialog, {
        mocks: {
          $vuetify: {
            theme: {
              dark: false,
            },
          },
        },
        ...options,
      })
    }
  })

  it('should render', () => {
    const wrapper = mountFunction()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render custom button texts', () => {
    const wrapper = mountFunction({
      propsData: {
        cancelText: 'I don\'t want to modify that!',
        saveText: 'Save it!',
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should open and close', () => {
    jest.useFakeTimers()

    const open = jest.fn()
    const close = jest.fn()

    const wrapper = mountFunction({
      listeners: {
        open,
        close,
      },
    })

    wrapper.vm.isActive = true
    expect(open).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(wrapper.vm.focus, 50)

    wrapper.vm.isActive = false
    expect(close).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should react to menu', () => {
    const open = jest.fn()
    const close = jest.fn()

    const wrapper = mountFunction({
      listeners: {
        open,
        close,
      },
    })

    const menu = wrapper.find(VMenu)

    menu.vm.$emit('input', true)
    expect(open).toHaveBeenCalledTimes(1)

    menu.vm.$emit('input', false)
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('should react to input', () => {
    const cancel = jest.fn()
    const save = jest.fn()
    const saveEvent = jest.fn()

    const wrapper = mountFunction({
      methods: {
        cancel,
        save,
      },
      render () {
        return this.genContent()
      },
      slots: {
        input: '<input class="test" />',
      },
      listeners: {
        save: saveEvent,
      },
    })

    const input = wrapper.vm.$refs.content as HTMLElement

    input.dispatchEvent(new KeyboardEvent('keydown', { keyCode: keyCodes.esc } as KeyboardEventInit))
    expect(cancel).toHaveBeenCalledTimes(1)

    const field = wrapper.find('input.test')
    field.setValue('test')

    input.dispatchEvent(new KeyboardEvent('keydown', { keyCode: keyCodes.enter } as KeyboardEventInit))
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenLastCalledWith('test')
    expect(saveEvent).toHaveBeenCalledTimes(1)
  })

  it('should render button', () => {
    const fn = jest.fn()

    const wrapper = mountFunction({
      render () {
        return this.genButton(fn, 'test')
      },
    })

    expect(wrapper.html()).toMatchSnapshot()

    const btn = wrapper.find('.v-btn')
    btn.trigger('click')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should focus', () => {
    const wrapper = mountFunction({
      render () {
        return this.genContent()
      },
      slots: {
        input: '<input class="test" />',
      },
    })

    const input = wrapper.find('input.test')

    expect(document.activeElement).not.toEqual(input.element as HTMLInputElement)
    wrapper.vm.focus()
    expect(document.activeElement).toEqual(input.element as HTMLInputElement)
  })

  it('should render actions', () => {
    const save = jest.fn()
    const saveEvent = jest.fn()

    const wrapper = mountFunction({
      methods: {
        save,
      },
      render () {
        return this.genActions()
      },
      listeners: {
        save: saveEvent,
      },
    })

    expect(wrapper.html()).toMatchSnapshot()

    const btn = wrapper.find('.v-btn:last-child')
    btn.trigger('click')
    expect(save).toHaveBeenCalledTimes(1)
    expect(saveEvent).toHaveBeenCalledTimes(1)
  })

  it('should cancel', () => {
    const cancel = jest.fn()
    const wrapper = mountFunction({
      listeners: {
        cancel,
      },
      data: () => ({
        isActive: true,
      }),
    })

    wrapper.vm.cancel()
    expect(wrapper.vm.isActive).toBeFalsy()
    expect(cancel).toHaveBeenCalledTimes(1)
  })
})
