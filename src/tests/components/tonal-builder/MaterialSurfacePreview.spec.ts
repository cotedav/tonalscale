import { mount } from '@vue/test-utils';

import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
import type { TonalStep } from '@/utils/tonal/scale';

const keyIndices = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];

const buildTones = (prefix: string): TonalStep[] =>
  keyIndices.map((index) => ({
    index,
    hex: `#${prefix}${index.toString(16).padStart(4, '0')}`.slice(0, 7),
  }));

const toneHex = (tones: TonalStep[], index: number) =>
  tones.find((tone) => tone.index === index)?.hex;

describe('MaterialSurfacePreview', () => {
  it('maps generated tones to Material surface roles and updates reactively', async () => {
    const tones = buildTones('11');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });

    const shell = wrapper.get('[data-cy="surface-preview-shell"]');
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(tones, 100)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${toneHex(tones, 100)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 80)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-lowest: ${toneHex(tones, 100)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(tones, 40)}`);
    [
      'surface',
      'surface-bright',
      'surface-dim',
      'surface-container-lowest',
      'surface-container-low',
      'surface-container',
      'surface-container-high',
      'surface-container-highest',
      'inverse-surface',
    ].forEach((role) => {
      expect(wrapper.find(`[data-surface-role="${role}"]`).exists()).toBe(true);
    });
    expect(wrapper.get('.preview-inspector').attributes('data-surface-role')).toBe(
      'surface-container-highest',
    );
    expect(wrapper.get('.preview-inspector').text()).toContain('Payment health');
    expect(wrapper.get('.preview-inspector').text()).toContain('Payment summary');
    expect(wrapper.get('.preview-inspector').text()).toContain('Internal note');
    expect(wrapper.get('.preview-inspector').text()).toContain('Invoice created');
    expect(wrapper.findAll('.preview-metric')).toHaveLength(4);
    expect(wrapper.findAll('.preview-table-row')).toHaveLength(7);

    const surfaceCards = wrapper.findAll('[data-surface-card]');
    expect(surfaceCards).toHaveLength(13);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 100');
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(toneHex(tones, 100));
    expect(wrapper.get('[data-surface-card="container"]').text()).toContain('Tone 95');
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 80');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 20');
    expect(wrapper.get('[data-surface-card="on_surface"]').text()).toContain('Tone 10');
    expect(wrapper.get('[data-surface-card="outline"]').text()).toContain('Tone 50');
    expect(wrapper.get('[data-surface-card="outline_variant"]').text()).toContain('Tone 80');

    const updatedTones = buildTones('aa');
    await wrapper.setProps({ tones: updatedTones });

    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(updatedTones, 100)}`);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(updatedTones, 40)}`);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(
      toneHex(updatedTones, 100),
    );
    expect(wrapper.text()).toContain('Reconciliation queue');
    expect(wrapper.text()).toContain('Collection health');
    expect(wrapper.text()).toContain('Settlement forecast');
  });

  it('inverts Material surface roles when dark mode is enabled', async () => {
    const tones = buildTones('33');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });

    const shell = wrapper.get('[data-cy="surface-preview-shell"]');
    const toggle = wrapper.get('[data-cy="surface-preview-dark-mode"]');
    await toggle.setValue(true);

    expect(shell.attributes('data-theme')).toBe('dark');
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(tones, 0)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${toneHex(tones, 30)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 0)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-lowest: ${toneHex(tones, 0)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-highest: ${toneHex(tones, 30)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-on-surface: ${toneHex(tones, 90)}`);
    expect(shell.attributes('style')).toContain(`--preview-outline: ${toneHex(tones, 60)}`);
    expect(shell.attributes('style')).toContain(`--preview-outline-variant: ${toneHex(tones, 30)}`);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(tones, 80)}`);
    expect(shell.attributes('style')).toContain(`--preview-on-primary: ${toneHex(tones, 20)}`);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 0');
    expect(wrapper.get('[data-surface-card="container"]').text()).toContain('Tone 20');
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 30');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 90');
    expect(wrapper.find('[data-cy="surface-role-inspector"]').exists()).toBe(false);
  });

  it('increases separation between surface tones at medium and high contrast', async () => {
    const tones = buildTones('44');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });
    const shell = wrapper.get('[data-cy="surface-preview-shell"]');

    const contrastSlider = wrapper.get('[data-cy="surface-contrast-slider"]');
    expect((contrastSlider.element as HTMLInputElement).value).toBe('0');
    expect(wrapper.get('[data-cy="surface-contrast-value"]').text()).toBe('Low');
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-highest: ${toneHex(tones, 80)}`,
    );

    await contrastSlider.setValue('1');
    expect(wrapper.get('[data-cy="surface-contrast-value"]').text()).toBe('Medium');
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 70)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container: ${toneHex(tones, 90)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-highest: ${toneHex(tones, 70)}`,
    );
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 70');

    await contrastSlider.setValue('2');
    expect(wrapper.get('[data-cy="surface-contrast-value"]').text()).toBe('High');
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 40)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container: ${toneHex(tones, 80)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-highest: ${toneHex(tones, 40)}`,
    );

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${toneHex(tones, 60)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container: ${toneHex(tones, 25)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-lowest: ${toneHex(tones, 0)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-highest: ${toneHex(tones, 60)}`,
    );
  });

  it('shifts surface roles through each extended key tone', async () => {
    const tones = buildTones('45');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });
    const shell = wrapper.get('[data-cy="surface-preview-shell"]');
    const toneSlider = wrapper.get('[data-cy="surface-tone-slider"]');

    expect((toneSlider.element as HTMLInputElement).min).toBe('0');
    expect((toneSlider.element as HTMLInputElement).max).toBe('5');
    expect((toneSlider.element as HTMLInputElement).value).toBe('5');
    expect(wrapper.get('[data-cy="surface-tone-value"]').text()).toBe('Tone 100');
    expect(wrapper.get('[data-cy="surface-tone-labels"]').text()).toContain('80');
    expect(wrapper.get('[data-cy="surface-tone-labels"]').text()).toContain('100');
    expect(wrapper.get('[data-cy="surface-tone-labels"] .preview-tone-active').text()).toBe('100');

    await toneSlider.setValue('4');
    expect(wrapper.get('[data-cy="surface-tone-value"]').text()).toBe('Tone 99');
    expect(wrapper.get('[data-cy="surface-tone-labels"] .preview-tone-active').text()).toBe('99');
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(tones, 99)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-low: ${toneHex(tones, 95)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container: ${toneHex(tones, 90)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-on-surface: ${toneHex(tones, 5)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-on-surface-variant: ${toneHex(tones, 30)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-outline: ${toneHex(tones, 40)}`);
    expect(shell.attributes('style')).toContain(`--preview-outline-variant: ${toneHex(tones, 70)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${toneHex(tones, 99)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 70)}`);

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    expect((toneSlider.element as HTMLInputElement).max).toBe('5');
    expect((toneSlider.element as HTMLInputElement).value).toBe('0');
    expect(wrapper.get('[data-cy="surface-tone-value"]').text()).toBe('Tone 0');
    expect(wrapper.get('[data-cy="surface-tone-labels"]').text()).toContain('25');
    expect(wrapper.get('[data-cy="surface-tone-labels"] .preview-tone-active').text()).toBe('0');

    await toneSlider.setValue('1');
    expect(wrapper.get('[data-cy="surface-tone-value"]').text()).toBe('Tone 5');
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(tones, 5)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-low: ${toneHex(tones, 15)}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container: ${toneHex(tones, 25)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-on-surface: ${toneHex(tones, 95)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-on-surface-variant: ${toneHex(tones, 90)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-outline: ${toneHex(tones, 70)}`);
    expect(shell.attributes('style')).toContain(`--preview-outline-variant: ${toneHex(tones, 35)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${toneHex(tones, 35)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 5)}`);
  });

  it('shows the hovered surface role and active tone', async () => {
    const tones = buildTones('55');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });

    const table = wrapper.get('[data-surface-role="surface-container-lowest"]');
    await table.trigger('pointermove', { clientX: 120, clientY: 180 });

    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Surface container lowest');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 100');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(tones, 100));

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    await table.trigger('pointermove', { clientX: 120, clientY: 180 });

    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 0');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(tones, 0));
  });

  it('reports nested table surfaces for the header and selected row', async () => {
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones: buildTones('66') },
    });

    const header = wrapper.get('.preview-table-header');
    await header.trigger('pointermove', { clientX: 200, clientY: 210 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Surface container low');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 98');

    const selectedRow = wrapper.get('.preview-table-row-selected');
    await selectedRow.trigger('pointermove', { clientX: 200, clientY: 280 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Inverse surface');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 20');
  });

  it('reports foreground and boundary roles used by the app preview', async () => {
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones: buildTones('77') },
    });

    await wrapper.get('[data-surface-role="on-surface"]').trigger('pointermove', {
      clientX: 220,
      clientY: 120,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('On surface');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 10');

    await wrapper.get('[data-surface-role="outline"]').trigger('pointermove', {
      clientX: 180,
      clientY: 360,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Outline');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 50');

    await wrapper.get('[data-surface-role="outline-variant"]').trigger('pointermove', {
      clientX: 320,
      clientY: 420,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Outline variant');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 80');
  });

  it('keeps the app shell surface-based while showcasing an independent primary surface family', async () => {
    const surfaceTones = buildTones('11');
    const primaryTones = buildTones('aa');
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones: surfaceTones,
        primaryTones,
        activeRole: 'primary',
        surfaceContrast: 'high',
        lightSurfaceTone: 98,
        darkSurfaceTone: 10,
        surfaceContrastSettings: { surface: 'low', primary: 'high' },
        lightSurfaceToneSettings: { surface: 100, primary: 98 },
        darkSurfaceToneSettings: { surface: 0, primary: 10 },
      },
    });
    const shell = wrapper.get('[data-cy="surface-preview-shell"]');

    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(surfaceTones, 100)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-surface-bright: ${toneHex(primaryTones, 98)}`,
    );
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Primary Surface');
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(
      toneHex(primaryTones, 98),
    );
    expect(wrapper.findAll('[data-surface-card]')).toHaveLength(13);
    expect(wrapper.find('[data-surface-card="primary"]').exists()).toBe(false);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(primaryTones, 40)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-container: ${toneHex(primaryTones, 90)}`,
    );

    const primaryLightExample = wrapper.get(
      '[data-surface-palette="primary"][data-surface-role="surface-bright"]',
    );
    const primaryInverseExample = wrapper.get(
      '[data-surface-palette="primary"][data-surface-role="inverse-surface"]',
    );
    await primaryLightExample.trigger('pointermove', {
      clientX: 200,
      clientY: 300,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Primary Surface bright');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 98');

    await primaryInverseExample.trigger('pointermove', {
      clientX: 220,
      clientY: 320,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Primary Inverse surface');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 20');

    await wrapper
      .get('[data-surface-palette="primary"][data-surface-role="outline"]')
      .trigger('pointermove', {
        clientX: 240,
        clientY: 340,
      });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Primary Outline');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 35');

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(surfaceTones, 0)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-surface-bright: ${toneHex(primaryTones, 80)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(primaryTones, 80)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-container: ${toneHex(primaryTones, 30)}`,
    );
  });

  it('showcases custom role surface families without replacing the surface shell', async () => {
    const surfaceTones = buildTones('11');
    const primaryTones = buildTones('aa');
    const secondaryTones = buildTones('bb');
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones: surfaceTones,
        primaryTones,
        rolePalettes: [
          { role: 'surface', label: 'Surface', tones: surfaceTones },
          { role: 'primary', label: 'Primary', tones: primaryTones },
          { role: 'secondary', label: 'Secondary', tones: secondaryTones },
        ],
        activeRole: 'secondary',
        surfaceContrast: 'medium',
        lightSurfaceTone: 95,
        darkSurfaceTone: 15,
        surfaceContrastSettings: { surface: 'low', primary: 'low', secondary: 'medium' },
        lightSurfaceToneSettings: { surface: 100, primary: 100, secondary: 95 },
        darkSurfaceToneSettings: { surface: 0, primary: 0, secondary: 15 },
      },
    });

    const shell = wrapper.get('[data-cy="surface-preview-shell"]');
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(surfaceTones, 100)}`);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Secondary Surface');
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(
      toneHex(secondaryTones, 95),
    );
    expect(
      wrapper
        .find('[data-surface-palette="secondary"][data-surface-role="surface-bright"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper
        .find('[data-surface-palette="secondary"][data-surface-role="inverse-surface"]')
        .exists(),
    ).toBe(true);

    await wrapper
      .get('[data-surface-palette="secondary"][data-surface-role="outline"]')
      .trigger('pointermove', {
        clientX: 240,
        clientY: 340,
      });

    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Secondary Outline');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 30');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      toneHex(secondaryTones, 30),
    );
  });

  it('showcases secondary, tertiary, and error Material role examples with hover metadata', async () => {
    const surfaceTones = buildTones('11');
    const primaryTones = buildTones('aa');
    const secondaryTones = buildTones('bb');
    const tertiaryTones = buildTones('cc');
    const errorTones = buildTones('dd');
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones: surfaceTones,
        primaryTones,
        rolePalettes: [
          { role: 'surface', label: 'Surface', tones: surfaceTones },
          { role: 'primary', label: 'Primary', tones: primaryTones },
          { role: 'secondary', label: 'Secondary', tones: secondaryTones },
          { role: 'tertiary', label: 'Tertiary', tones: tertiaryTones },
          { role: 'error', label: 'Error', tones: errorTones },
        ],
      },
    });

    const secondaryAction = wrapper.get('[data-cy="secondary-action"]');
    const tertiaryAction = wrapper.get('[data-cy="tertiary-action"]');
    const validation = wrapper.get('[data-cy="error-validation"]');
    const alert = wrapper.get('[data-cy="error-alert"]');

    expect(secondaryAction.text()).toContain('Send reminder');
    expect(secondaryAction.attributes('style')).toContain(
      `--preview-role-action: ${toneHex(secondaryTones, 40)}`,
    );
    expect(tertiaryAction.text()).toContain('Schedule follow-up');
    expect(tertiaryAction.attributes('style')).toContain(
      `--preview-role-action-container: ${toneHex(tertiaryTones, 90)}`,
    );
    expect(validation.text()).toContain('Customer email');
    expect(alert.text()).toContain('Invoice requires attention');
    expect(alert.attributes('style')).toContain(
      `--preview-role-action-container: ${toneHex(errorTones, 90)}`,
    );

    await secondaryAction.trigger('pointermove', { clientX: 240, clientY: 170 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Secondary');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 40');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      toneHex(secondaryTones, 40),
    );

    await tertiaryAction.trigger('pointermove', { clientX: 300, clientY: 170 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tertiary container');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 90');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(tertiaryTones, 90));

    await validation
      .get('[data-surface-palette="error"][data-surface-role="primary"]')
      .trigger('pointermove', {
        clientX: 140,
        clientY: 420,
      });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Error');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 40');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(errorTones, 40));

    await alert.trigger('pointermove', { clientX: 260, clientY: 360 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Error container');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 90');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(errorTones, 90));
  });
});
