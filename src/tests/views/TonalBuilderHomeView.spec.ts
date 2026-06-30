import { afterEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';

import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
import { TONAL_PERSISTENCE_SCHEMA_VERSION, useTonalScaleStore } from '@/stores/tonalScale';
import TonalBuilderHomeView from '@/views/tonal-builder/TonalBuilderHomeView.vue';

// Mock useTonalUrlSync to avoid router dependency
vi.mock('@/composables/useTonalUrlSync', () => ({
  default: vi.fn(),
}));

const getBodyElement = (selector: string) => {
  const elements = document.body.querySelectorAll(selector);
  const element = elements.item(elements.length - 1);
  expect(element).not.toBeNull();
  return element as HTMLElement;
};

describe('TonalBuilderHomeView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tonal builder shell aligned to the prototype layout', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.find('[data-cy="tonal-builder-title"]').text()).toContain('Tonal Builder');

    [
      '#toolbar',
      '#baseColorPickerInput',
      '#blendColorPickerInput',
      '#baseColorPicker',
      '#blendColorPicker',
      '#color-scale-container-full',
      '#color-scale-container-custom',
      '#color-scale-container-key',
      '[data-cy="material-surface-preview"]',
      '#gradient-controls',
      '[data-cy="accessibility-dock"]',
      '#colorcard-darker45',
      '#colorcard-darker3',
      '#colorcard-lighter3',
      '#colorcard-lighter45',
    ].forEach((selector) => {
      expect(wrapper.find(selector).exists()).toBe(true);
    });

    expect(wrapper.find('[data-cy="base-color-picker"]').exists()).toBe(true);
    expect(wrapper.find('[data-cy="blend-color-picker"]').exists()).toBe(true);
    expect(wrapper.get('#gradient-controls').find('#blendColorPicker').exists()).toBe(true);
    expect(wrapper.find('[data-cy="blend-mode-summary"]').exists()).toBe(false);
    expect(wrapper.find('[data-cy="blend-enabled-toggle"]').exists()).toBe(true);
    expect(wrapper.find('#baseColorPickerInput').text()).toContain('#8000ff');
    expect(wrapper.get('[data-cy="builder-workspace"]').attributes('style')).toContain(
      '--controls-panel-width: 500px',
    );
    expect(wrapper.find('[data-cy="controls-resize-handle"]').exists()).toBe(true);
    expect(wrapper.get('[data-cy="surface-role-tab"]').attributes('aria-selected')).toBe('true');
    expect(wrapper.get('[data-cy="primary-role-tab"]').attributes('aria-selected')).toBe('false');
    expect(wrapper.get('[data-cy="color-role-tabs"]').find('[data-cy="role-add"]').exists()).toBe(
      true,
    );
    expect(wrapper.get('[data-cy="role-management"]').find('[data-cy="role-add"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-cy="role-move-left"]').exists()).toBe(false);
    expect(wrapper.find('[data-cy="role-move-right"]').exists()).toBe(false);
    expect(wrapper.find('[data-cy="role-rename-submit"]').exists()).toBe(false);
    expect(wrapper.get('[data-cy="surface-role-color-badge"]').attributes('aria-label')).toContain(
      '#8000ff',
    );
    expect(wrapper.get('[data-cy="primary-role-color-badge"]').attributes('aria-label')).toContain(
      '#6750a4',
    );

    expect(wrapper.findAll('#gradient-controls [type="range"]').length).toBe(5);
    expect(wrapper.findAll('#gradient-controls [data-cy$="-value"]').length).toBe(5);

    const fullStrip = wrapper.get('[data-cy="scale-strip-full"]');
    expect(fullStrip.findAll('[data-cy="tonal-swatch"]').length).toBeGreaterThan(0);
    expect(wrapper.getComponent(MaterialSurfacePreview).props('tones')).toEqual(
      useTonalScaleStore().surfaceExtendedStrip,
    );
    expect(wrapper.getComponent(MaterialSurfacePreview).props('primaryTones')).toEqual(
      useTonalScaleStore().primaryExtendedStrip,
    );
    expect(wrapper.getComponent(MaterialSurfacePreview).props('rolePalettes')).toEqual([
      {
        role: 'surface',
        label: 'Surface',
        tones: useTonalScaleStore().surfaceExtendedStrip,
      },
      {
        role: 'primary',
        label: 'Primary',
        tones: useTonalScaleStore().primaryExtendedStrip,
      },
      {
        role: 'secondary',
        label: 'Secondary',
        tones: useTonalScaleStore().getRoleExtendedStrip('secondary'),
      },
      {
        role: 'tertiary',
        label: 'Tertiary',
        tones: useTonalScaleStore().getRoleExtendedStrip('tertiary'),
      },
      {
        role: 'error',
        label: 'Error',
        tones: useTonalScaleStore().getRoleExtendedStrip('error'),
      },
    ]);
  });

  it('switches between independent surface and primary workspaces', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    store.importState({
      version: 2,
      activeRole: 'surface',
      roles: {
        surface: {
          baseHex: '#123456',
          blendHex: '#000032',
          blendMode: 'colordodge',
          controls: { strength: 0, middle: 0, spread: 50, satDarker: 0, satLighter: 0 },
        },
        primary: {
          baseHex: '#abcdef',
          blendHex: '#112233',
          blendMode: 'multiply',
          controls: { strength: 25, middle: 10, spread: 60, satDarker: 5, satLighter: 7 },
        },
      },
      preview: {
        darkMode: false,
        surfaceContrast: 'low',
        lightSurfaceTone: 100,
        darkSurfaceTone: 0,
        primarySurfaceContrast: 'low',
        primaryLightSurfaceTone: 100,
        primaryDarkSurfaceTone: 0,
      },
    });

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.get('#baseColorPickerInput').text()).toContain('#123456');
    expect(wrapper.get('[data-cy="surface-role-color-badge"]').attributes('aria-label')).toContain(
      '#123456',
    );
    expect(wrapper.get('[data-cy="primary-role-color-badge"]').attributes('aria-label')).toContain(
      '#abcdef',
    );
    await wrapper.get('[data-cy="primary-role-tab"]').trigger('click');
    await nextTick();

    expect(store.activeRole).toBe('primary');
    expect(wrapper.get('#baseColorPickerInput').text()).toContain('#abcdef');
    expect((wrapper.get('#blendmode').element as HTMLSelectElement).value).toBe('multiply');
    expect((wrapper.get('[data-cy="strength-value"]').element as HTMLInputElement).value).toBe(
      '25',
    );

    await wrapper.get('[data-cy="surface-role-tab"]').trigger('click');
    await nextTick();
    expect(wrapper.get('#baseColorPickerInput').text()).toContain('#123456');
  });

  it('renders dynamic role tabs and supports ordered keyboard navigation', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    const secondaryRole = store.addRole({ label: 'Support', baseHex: '#224466' });
    const tertiaryRole = store.addRole({ label: 'Accent', baseHex: '#663399' });
    store.setActiveRole('surface');

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    expect(wrapper.get(`[data-cy="${secondaryRole}-role-tab"]`).text()).toContain('Support');
    expect(wrapper.get(`[data-cy="${tertiaryRole}-role-tab"]`).text()).toContain('Accent');
    expect(
      wrapper.get(`[data-cy="${secondaryRole}-role-color-badge"]`).attributes('aria-label'),
    ).toContain('#224466');

    await wrapper.get('[data-cy="surface-role-tab"]').trigger('keydown', { key: 'End' });
    await nextTick();

    expect(store.activeRole).toBe(tertiaryRole);
    expect(wrapper.get(`[data-cy="${tertiaryRole}-role-tab"]`).attributes('aria-selected')).toBe(
      'true',
    );

    await wrapper.get(`[data-cy="${tertiaryRole}-role-tab"]`).trigger('keydown', {
      key: 'ArrowLeft',
    });
    await nextTick();

    expect(store.activeRole).toBe(secondaryRole);
  });

  it('adds and duplicates roles from the tab toolbar into inline edit mode', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    await wrapper.get('[data-cy="role-add"]').trigger('click');
    await nextTick();

    expect(store.activeRole).toBe('custom_role');
    expect(
      wrapper.find('[data-cy="custom_role-role-tab"] [data-cy="role-name-input"]').exists(),
    ).toBe(true);
    expect((wrapper.get('[data-cy="role-name-input"]').element as HTMLInputElement).value).toBe(
      'Custom role',
    );

    await wrapper.get('[data-cy="role-name-input"]').setValue('Support custom');
    await wrapper.get('[data-cy="role-name-input"]').trigger('keydown.enter');
    await nextTick();

    expect(store.roleMeta.custom_role.label).toBe('Support custom');
    expect(wrapper.get('[data-cy="custom_role-role-tab"]').text()).toContain('Support custom');

    await wrapper.get('[data-cy="role-duplicate"]').trigger('click');
    await nextTick();

    expect(store.activeRole).toBe('support_custom_copy');
    expect(
      wrapper.find('[data-cy="support_custom_copy-role-tab"] [data-cy="role-name-input"]').exists(),
    ).toBe(true);
    expect((wrapper.get('[data-cy="role-name-input"]').element as HTMLInputElement).value).toBe(
      'Support custom copy',
    );
    expect(store.roles.support_custom_copy.state.baseHex).toBe(
      store.roles.custom_role.state.baseHex,
    );
    expect(store.roleMeta.support_custom_copy.label).not.toBe(store.roleMeta.custom_role.label);
  });

  it('renames selected custom tabs inline and deletes custom roles from the toolbar', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    store.addRole({ label: 'Support' });
    const tertiaryRole = store.addRole({ label: 'Accent' });
    const confirmSpy = vi.spyOn(window, 'confirm');

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    await wrapper.get(`[data-cy="${tertiaryRole}-role-tab"]`).trigger('click');
    await nextTick();

    await wrapper.get('[data-cy="role-name-input"]').setValue('Primary');
    await wrapper.get('[data-cy="role-name-input"]').trigger('keydown.enter');
    await nextTick();

    expect(store.roleMeta[tertiaryRole].label).toBe('Accent');
    expect(wrapper.get('[data-cy="role-name-error"]').text()).toContain('unique');

    await wrapper.get('[data-cy="role-name-input"]').setValue('Accent renamed');
    await wrapper.get('[data-cy="role-name-input"]').trigger('keydown.enter');
    await nextTick();

    expect(store.roleMeta[tertiaryRole].label).toBe('Accent renamed');
    expect(wrapper.get(`[data-cy="${tertiaryRole}-role-tab"]`).text()).toContain('Accent renamed');

    await wrapper.get('[data-cy="role-delete"]').trigger('click');
    await nextTick();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(getBodyElement('[data-cy="confirmation-dialog-title"]').textContent).toContain(
      'Delete Accent renamed?',
    );
    expect(getBodyElement('[data-cy="confirmation-dialog-body"]').textContent).toContain(
      'tonal settings',
    );
    getBodyElement('[data-cy="confirmation-cancel"]').click();
    await nextTick();

    expect(store.roles[tertiaryRole]).toBeDefined();

    await wrapper.get('[data-cy="role-delete"]').trigger('click');
    await nextTick();
    getBodyElement('[data-cy="confirmation-confirm"]').click();
    await nextTick();

    expect(store.roles[tertiaryRole]).toBeUndefined();
    expect(store.activeRole).toBe('support');
  });

  it('reorders role tabs with drag-and-drop and keyboard shortcuts', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    const supportRole = store.addRole({ label: 'Support' });
    const accentRole = store.addRole({ label: 'Accent' });
    store.setActiveRole('surface');

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });
    const dataTransfer = {
      dropEffect: '',
      effectAllowed: '',
      setData: vi.fn(),
    };

    await wrapper.get(`[data-cy="${accentRole}-role-tab"]`).trigger('dragstart', { dataTransfer });
    await wrapper.get('[data-cy="primary-role-tab"]').trigger('dragover', { dataTransfer });
    await wrapper.get('[data-cy="primary-role-tab"]').trigger('drop', { dataTransfer });
    await nextTick();

    expect(store.roleOrder).toEqual([
      'surface',
      accentRole,
      'primary',
      'secondary',
      'tertiary',
      'error',
      supportRole,
    ]);
    expect(store.activeRole).toBe(accentRole);

    await wrapper.get(`[data-cy="${accentRole}-role-tab"]`).trigger('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
    });
    await nextTick();

    expect(store.roleOrder).toEqual([
      'surface',
      'primary',
      accentRole,
      'secondary',
      'tertiary',
      'error',
      supportRole,
    ]);
    expect(store.activeRole).toBe(accentRole);
  });

  it('resets the builder from the toolbar after confirmation', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    const defaultState = store.exportState();
    const customRole = store.addRole({ label: 'Support', baseHex: '#224466' });
    store.setActiveRole(customRole);
    store.setBlendHex('#654321');
    store.updateRolePreviewSettings(customRole, { contrast: 'high', lightSurfaceTone: 90 });
    store.preview.darkMode = true;

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    expect(store.isDefaultState).toBe(false);

    await wrapper.get('[data-cy="tonal-builder-reset"]').trigger('click');
    await nextTick();

    expect(getBodyElement('[data-cy="confirmation-dialog-title"]').textContent).toContain(
      'Reset the builder?',
    );

    getBodyElement('[data-cy="confirmation-cancel"]').click();
    await nextTick();

    expect(store.roles[customRole]).toBeDefined();
    expect(store.activeRole).toBe(customRole);
    expect(store.isDefaultState).toBe(false);

    await wrapper.get('[data-cy="tonal-builder-reset"]').trigger('click');
    await nextTick();
    getBodyElement('[data-cy="confirmation-confirm"]').click();
    await nextTick();

    expect(store.exportState()).toBe(defaultState);
    expect(store.isDefaultState).toBe(true);
    expect(store.activeRole).toBe('surface');
    expect(store.roles[customRole]).toBeUndefined();
    expect(store.preview.darkMode).toBe(false);
  });

  it('exports the active color role with tonal labels and surface cards', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    await wrapper.get('[data-cy="primary-role-tab"]').trigger('click');
    await wrapper.get('[data-cy="tonal-builder-copy"]').trigger('click');
    await nextTick();
    expect(wrapper.get('[data-cy="export-menu"]').text()).toContain('This role only');
    expect(wrapper.get('[data-cy="export-menu"]').text()).toContain('All roles');
    await wrapper.get('[data-cy="export-current-role"]').trigger('click');
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());

    const svg = writeText.mock.calls[0]?.[0] as string;
    expect(svg).toContain('Exported color');
    expect(svg).toContain('>Primary</text>');
    expect(svg).toContain('Extended key strip');
    expect(svg).toContain('Primary Surface');
    expect(svg).toContain('Surface role mapping');
    expect(svg).toContain('#v2=');
    expect(svg).toContain('class="footer-text"');
    expect(svg).toContain(`"version":${TONAL_PERSISTENCE_SCHEMA_VERSION}`);
    expect(svg).toContain('inline-size:');
    expect(svg).not.toContain('<foreignObject');
    expect(svg).not.toContain('footer-frame');
    expect(svg).not.toContain('Link:');
    expect(svg).not.toContain('Import:');
    expect(svg).not.toContain('<tspan');
  });

  it('exports custom roles to SVG metadata with the active custom role label', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    const customRole = store.addRole({
      label: 'Secondary & "Accent" <Role>',
      baseHex: '#224466',
    });
    store.updateRolePreviewSettings(customRole, { contrast: 'high', lightSurfaceTone: 90 });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    await wrapper.get('[data-cy="tonal-builder-copy"]').trigger('click');
    await nextTick();
    await wrapper.get('[data-cy="export-current-role"]').trigger('click');
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());

    const svg = writeText.mock.calls[0]?.[0] as string;
    expect(svg).toContain('>Secondary &amp; "Accent" &lt;Role&gt;</text>');
    expect(svg).toContain('<title>Secondary &amp; "Accent" &lt;Role&gt; tonal scale</title>');
    expect(svg).toContain('Secondary &amp; "Accent" &lt;Role&gt; Surface');
    expect(svg).toContain(`"version":${TONAL_PERSISTENCE_SCHEMA_VERSION}`);
    expect(svg).toContain('"activeRole":"secondary_accent_role"');
    expect(svg).toContain(
      '"roleOrder":["surface","primary","secondary","tertiary","error","secondary_accent_role"]',
    );
    expect(svg).toContain('"label":"Secondary &amp; \\"Accent\\" &lt;Role&gt;"');
    expect(svg).toContain('"baseHex":"#224466"');
    expect(svg).toContain('#v2=');
  });

  it('exports all roles from the export menu in role order', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useTonalScaleStore();
    const customRole = store.addRole({ label: 'Support custom', baseHex: '#224466' });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const wrapper = mount(TonalBuilderHomeView, {
      global: { plugins: [pinia] },
    });

    await wrapper.get('[data-cy="tonal-builder-copy"]').trigger('click');
    await nextTick();
    await wrapper.get('[data-cy="export-all-roles"]').trigger('click');
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());

    const svg = writeText.mock.calls[0]?.[0] as string;
    expect(svg).toContain('Exported colors');
    expect(svg).toContain('All color roles tonal scales');
    expect(svg).toContain('>Surface</text>');
    expect(svg).toContain('>Primary</text>');
    expect(svg).toContain('>Secondary</text>');
    expect(svg).toContain('>Tertiary</text>');
    expect(svg).toContain('>Error</text>');
    expect(svg).toContain('>Support custom</text>');
    expect(svg).toContain('Support custom Surface');
    expect(svg).toContain('"activeRole":"support_custom"');
    expect(svg).toContain(
      `"roleOrder":["surface","primary","secondary","tertiary","error","${customRole}"]`,
    );
    expect(svg).toContain('"baseHex":"#224466"');
    expect(svg).toContain('#v2=');
    expect(svg).toContain('<metadata>');
  });

  it('resizes the color controls panel with the split-pane handle', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });
    const workspace = wrapper.get('[data-cy="builder-workspace"]');
    vi.spyOn(workspace.element, 'getBoundingClientRect').mockReturnValue({
      bottom: 800,
      height: 700,
      left: 0,
      right: 1200,
      top: 100,
      width: 1200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });

    await wrapper.get('[data-cy="controls-resize-handle"]').trigger('pointerdown');
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 620 }));
    window.dispatchEvent(new MouseEvent('pointerup'));
    await nextTick();

    expect(workspace.attributes('style')).toContain('--controls-panel-width: 580px');

    await wrapper.get('[data-cy="controls-resize-handle"]').trigger('keydown', {
      key: 'ArrowRight',
    });
    expect(workspace.attributes('style')).toContain('--controls-panel-width: 560px');
  });

  it('initializes blend controls to the expected defaults', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    const expectedDefaults: Record<string, string> = {
      strength: '0',
      middle: '0',
      spread: '50',
      satDarker: '0',
      satLighter: '0',
    };

    Object.entries(expectedDefaults).forEach(([id, value]) => {
      const slider = wrapper.get(`[data-cy="${id}-slider"]`);
      const number = wrapper.get(`[data-cy="${id}-value"]`);

      expect((slider.element as HTMLInputElement).value).toBe(value);
      expect((number.element as HTMLInputElement).value).toBe(value);
    });
  });

  it('uses production-ready labels in the color controls panel', () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });
    const controlsPanel = wrapper.get('#gradient-controls');

    expect(controlsPanel.text()).toContain('Color adjustment');
    expect(controlsPanel.text()).toContain('Modifier color');
    expect(controlsPanel.text()).toContain('Use modifier');
    expect(controlsPanel.text()).toContain('Strength');
    expect(controlsPanel.text()).toContain('Peak');
    expect(controlsPanel.text()).toContain('Spread');
    expect(controlsPanel.text()).toContain('Darker saturation');
    expect(controlsPanel.text()).toContain('Lighter saturation');
    expect(controlsPanel.text()).not.toContain('Blend Strength');
    expect(controlsPanel.text()).not.toContain('Blend Peak');
    expect(controlsPanel.text()).not.toContain('Blend Spread');
  });

  it('clears a selected tone only when clicking outside a tone in the swatches panel', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    const swatch = wrapper.get('[data-cy="scale-strip-key"] [data-cy="tonal-swatch"]');
    await swatch.trigger('click');
    await nextTick();

    expect(swatch.attributes('data-selected')).toBe('true');

    await wrapper.get('#gradient-controls').trigger('click');
    await nextTick();

    expect(swatch.attributes('data-selected')).toBe('true');

    await wrapper.get('[data-cy="swatches-panel"]').trigger('click');
    await nextTick();

    expect(swatch.attributes('data-selected')).toBe('false');
    wrapper.findAll('[data-cy="contrast-preview-card"]').forEach((card) => {
      expect(card.attributes('style')).toContain('opacity: 0.2');
    });
  });

  it('reflects imported store parameters in every color and blend control', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });
    const store = useTonalScaleStore();

    store.importState({
      colorHex: '#123456',
      blendMode: 'multiply',
      blendStrength: 64,
      blendR: 101,
      blendG: 67,
      blendB: 33,
      middle: -18,
      spread: 72,
      satDarker: 23,
      satLighter: 41,
    });
    await nextTick();

    expect(wrapper.get('#baseColorPickerInput').text()).toContain('#123456');
    expect(wrapper.get('#blendColorPickerInput').text()).toContain('#654321');
    expect((wrapper.get('#blendmode').element as HTMLSelectElement).value).toBe('multiply');
    expect((wrapper.get('[data-cy="strength-value"]').element as HTMLInputElement).value).toBe(
      '64',
    );
    expect((wrapper.get('[data-cy="middle-value"]').element as HTMLInputElement).value).toBe('-18');
    expect((wrapper.get('[data-cy="spread-value"]').element as HTMLInputElement).value).toBe('72');
    expect((wrapper.get('[data-cy="satDarker-value"]').element as HTMLInputElement).value).toBe(
      '23',
    );
    expect((wrapper.get('[data-cy="satLighter-value"]').element as HTMLInputElement).value).toBe(
      '41',
    );
    expect(
      (wrapper.get('[data-cy="blend-enabled-toggle"]').element as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('collapses and expands the accessibility dock when clicking the toggle button', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(TonalBuilderHomeView, {
      global: {
        plugins: [pinia],
      },
    });

    const toggleBtn = wrapper.get('[data-cy="accessibility-dock-toggle"]');
    const content = wrapper.get('[data-cy="accessibility-dock-content"]');

    // Initially expanded (visible)
    expect(toggleBtn.attributes('aria-expanded')).toBe('true');
    expect((content.element as HTMLElement).style.display).not.toBe('none');

    // Click toggle to collapse
    await toggleBtn.trigger('click');
    await nextTick();

    expect(toggleBtn.attributes('aria-expanded')).toBe('false');
    expect((content.element as HTMLElement).style.display).toBe('none');

    // Click toggle to expand again
    await toggleBtn.trigger('click');
    await nextTick();

    expect(toggleBtn.attributes('aria-expanded')).toBe('true');
    expect((content.element as HTMLElement).style.display).not.toBe('none');
  });
});
