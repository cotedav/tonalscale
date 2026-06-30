import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TheImportExportModal from '@/components/tonal-builder/TheImportExportModal.vue';
import {
  BUILT_IN_ROLE_IDS,
  TONAL_PERSISTENCE_SCHEMA_VERSION,
  useTonalScaleStore,
} from '@/stores/tonalScale';
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
    t: (key: string, fallback?: string) =>
      (
        ({
          'tonal_builder.modals.dialog_title': 'Import or export configuration',
          'tonal_builder.modals.dialog_helper':
            'Paste your JSON configuration below to restore a previous state.',
          'tonal_builder.modals.close_label': 'Close import/export dialog',
          'tonal_builder.actions.import': 'Import',
          'tonal_builder.actions.copy_json': 'Copy JSON',
          'tonal_builder.actions.cancel': 'Cancel',
          'tonal_builder.actions.import_success': 'Imported configuration successfully',
          'tonal_builder.actions.import_error': 'Invalid JSON configuration',
        }) as Record<string, string>
      )[key] ??
      fallback ??
      key,
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
    expect(textarea.element.value).toContain('"baseHex":"#123456"');
    expect(textarea.element.value).toContain('"primary"');
    expect(textarea.element.value).toContain(`"version":${TONAL_PERSISTENCE_SCHEMA_VERSION}`);
    expect(wrapper.get('h3').text()).toBe('Import or export configuration');
    expect(wrapper.text()).toContain('Paste your JSON configuration below');
    expect(wrapper.text()).not.toContain('tonal_builder.modals.dialog_title');
  });

  it('copies complete dynamic role JSON from the modal', async () => {
    const store = useTonalScaleStore();
    const customRole = store.addRole({ label: 'Support', baseHex: '#224466' });
    store.updateRolePreviewSettings(customRole, { contrast: 'high', lightSurfaceTone: 90 });

    const wrapper = mountModal(false);
    await wrapper.setProps({ isOpen: true });
    await wrapper.get('[data-cy="modal-copy-json-btn"]').trigger('click');

    expect(mockCopyToClipboard).toHaveBeenCalledOnce();
    const copiedJson = mockCopyToClipboard.mock.calls[0]?.[0] as string;
    expect(JSON.parse(copiedJson)).toMatchObject({
      version: TONAL_PERSISTENCE_SCHEMA_VERSION,
      activeRole: customRole,
      roleOrder: [...BUILT_IN_ROLE_IDS, customRole],
      roleMeta: {
        [customRole]: {
          label: 'Support',
        },
      },
      roles: {
        [customRole]: {
          baseHex: '#224466',
        },
      },
      preview: {
        roleSettings: {
          [customRole]: {
            contrast: 'high',
            lightSurfaceTone: 90,
          },
        },
      },
    });
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

  it('imports complete dynamic role JSON from the modal', async () => {
    const store = useTonalScaleStore();
    const wrapper = mountModal(false);
    await wrapper.setProps({ isOpen: true });

    await wrapper.find('textarea').setValue(
      JSON.stringify({
        version: TONAL_PERSISTENCE_SCHEMA_VERSION,
        activeRole: 'support',
        roleOrder: ['surface', 'primary', 'support'],
        roleMeta: {
          support: {
            id: 'support',
            label: 'Support',
            isBuiltIn: false,
            kind: 'custom',
            deletable: true,
            capabilities: {
              tonalScale: true,
              materialSurfaces: true,
              appPreviewExamples: false,
            },
          },
        },
        roles: {
          surface: { baseHex: '#123456' },
          primary: { baseHex: '#abcdef' },
          support: { baseHex: '#224466' },
        },
        preview: {
          darkMode: true,
          roleSettings: {
            support: {
              contrast: 'high',
              lightSurfaceTone: 90,
              darkSurfaceTone: 25,
            },
          },
        },
      }),
    );

    await wrapper.find('button[data-cy="modal-import-btn"]').trigger('click');

    expect(store.activeRole).toBe('support');
    expect(store.roleOrder).toEqual([
      'surface',
      'primary',
      'support',
      'secondary',
      'tertiary',
      'error',
    ]);
    expect(store.roleMeta.support.label).toBe('Support');
    expect(store.baseHex).toBe('#224466');
    expect(store.getRolePreviewSettings('support')).toEqual({
      contrast: 'high',
      lightSurfaceTone: 90,
      darkSurfaceTone: 25,
    });
    expect(mockToastSuccess).toHaveBeenCalled();
  });
});
