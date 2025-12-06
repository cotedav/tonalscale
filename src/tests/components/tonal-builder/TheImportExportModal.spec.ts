import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TheImportExportModal from '@/components/tonal-builder/TheImportExportModal.vue';
import { useTonalScaleStore } from '@/stores/tonalScale';
import { nextTick } from 'vue';

// Mock clipboard
const mockCopyToClipboard = vi.fn();
vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({
    copyToClipboard: mockCopyToClipboard,
  }),
}));

// Mock toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('vue-sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock I18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Headless UI Dialog to simplify testing (avoid portals)
const MockDialog = {
  template: '<div><slot /></div>',
};
const MockDialogPanel = {
  template: '<div><slot /></div>',
};
const MockDialogTitle = {
  template: '<h3><slot /></h3>',
};

describe('TheImportExportModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCopyToClipboard.mockClear();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
  });

  const mountModal = (isOpen = true) => {
    return mount(TheImportExportModal, {
      props: {
        isOpen,
      },
      global: {
        stubs: {
          Dialog: MockDialog,
          DialogPanel: MockDialogPanel,
          DialogTitle: MockDialogTitle,
          TransitionRoot: { template: '<div><slot /></div>' },
          TransitionChild: { template: '<div><slot /></div>' },
        },
      },
    });
  };

  it('renders JSON config when open', async () => {
    const store = useTonalScaleStore();
    // Setup some state
    store.baseHex = '#123456';
    await nextTick();

    // Toggle open to trigger watch
    const wrapper = mountModal(false);
    await wrapper.setProps({ isOpen: true });

    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
    expect(textarea.element.value).toContain('"colorHex":"#123456"');
  });

  it('calls importState with new JSON when Import button is clicked', async () => {
    const store = useTonalScaleStore();
    const importSpy = vi.spyOn(store, 'importState');

    const wrapper = mountModal(false);
    await wrapper.setProps({ isOpen: true });

    const textarea = wrapper.find('textarea');
    const newConfig = JSON.stringify({ colorHex: '#abcdef' });
    await textarea.setValue(newConfig);

    const importButton = wrapper.find('button[data-cy="modal-import-btn"]');
    await importButton.trigger('click');

    expect(importSpy).toHaveBeenCalled();
    expect(store.baseHex).toBe('#abcdef');
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('shows error toast on invalid JSON import', async () => {
    const store = useTonalScaleStore();
    vi.spyOn(store, 'importState');

    const wrapper = mountModal(false);
    await wrapper.setProps({ isOpen: true });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('invalid json');

    const importButton = wrapper.find('button[data-cy="modal-import-btn"]');
    await importButton.trigger('click');

    expect(mockToastError).toHaveBeenCalled();
    expect(wrapper.emitted('close')).toBeFalsy();
  });
});
