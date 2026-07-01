import { mount } from '@vue/test-utils';

import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
import type { TonalStep } from '@/utils/tonal/scale';

const keyIndices = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];

const buildTones = (prefix: string): TonalStep[] =>
  keyIndices.map((index) => ({
    index,
    hex: `#${prefix}${index.toString(16).padStart(4, '0')}`.slice(0, 7),
  }));

const buildFullTones = (prefix: string): TonalStep[] =>
  Array.from({ length: 101 }, (_, index) => ({
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
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(tones, 50)}`);
    [
      'surface',
      'surface-bright',
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
      'surface-container-low',
    );
    expect(wrapper.get('.preview-inspector').text()).toContain('Payment health');
    expect(wrapper.get('.preview-inspector').text()).toContain('Payment summary');
    expect(wrapper.get('.preview-inspector').text()).toContain('Internal note');
    expect(wrapper.get('.preview-inspector').text()).toContain('Invoice created');
    expect(wrapper.findAll('.preview-metric')).toHaveLength(4);
    expect(wrapper.findAll('.preview-table-row')).toHaveLength(7);

    const surfaceCards = wrapper.findAll('[data-surface-card]');
    expect(surfaceCards).toHaveLength(16);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 100');
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(toneHex(tones, 100));
    expect(wrapper.get('[data-surface-card="container"]').text()).toContain('Tone 95');
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 80');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 20');
    expect(wrapper.get('[data-surface-card="inverse_on_surface"]').text()).toContain('Tone 98');
    expect(wrapper.get('[data-surface-card="on_surface"]').text()).toContain('Tone 10');
    expect(wrapper.get('[data-surface-card="on_surface_container"]').text()).toContain('Tone 10');
    expect(wrapper.get('[data-surface-card="on_surface_container_variant"]').text()).toContain(
      'Tone 35',
    );
    expect(wrapper.get('[data-surface-card="outline"]').text()).toContain('Tone 50');
    expect(wrapper.get('[data-surface-card="outline_variant"]').text()).toContain('Tone 70');

    const updatedTones = buildTones('aa');
    await wrapper.setProps({ tones: updatedTones });

    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(updatedTones, 100)}`);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(updatedTones, 50)}`);
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
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(tones, 50)}`);
    expect(shell.attributes('style')).toContain(`--preview-on-primary: ${toneHex(tones, 95)}`);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 0');
    expect(wrapper.get('[data-surface-card="container"]').text()).toContain('Tone 20');
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 30');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 90');
    expect(wrapper.get('[data-surface-card="inverse_on_surface"]').text()).toContain('Tone 20');
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
    expect(shell.attributes('style')).toContain(`--preview-on-surface: ${toneHex(tones, 10)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-on-surface-variant: ${toneHex(tones, 35)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-outline: ${toneHex(tones, 50)}`);
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
    expect(shell.attributes('style')).toContain(`--preview-on-surface: ${toneHex(tones, 90)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-on-surface-variant: ${toneHex(tones, 80)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-outline: ${toneHex(tones, 60)}`);
    expect(shell.attributes('style')).toContain(`--preview-outline-variant: ${toneHex(tones, 30)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${toneHex(tones, 35)}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-dim: ${toneHex(tones, 5)}`);
  });

  it('customizes selected surface cards with the wheel and restores automatic tones', async () => {
    const tones = buildFullTones('4c');
    const surfaceTones = buildTones('4c');
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones,
        rolePalettes: [
          {
            role: 'surface',
            label: 'Surface',
            kind: 'surface',
            baseTone: 100,
            tones,
            surfaceTones,
          },
        ],
      },
    });
    const card = () => wrapper.get('[data-surface-card="container_highest"]');
    const shell = () => wrapper.get('[data-cy="surface-preview-shell"]');

    await card().trigger('click');
    expect(card().attributes('data-selected')).toBe('true');

    await card().trigger('wheel', { deltaY: -100 });
    expect(card().text()).toContain('Tone 81');
    expect(shell().attributes('style')).toContain(
      `--preview-surface-container-highest: ${toneHex(tones, 81)}`,
    );
    expect(card().attributes('data-customized')).toBe('true');
    expect(wrapper.emitted('update:lightCustomSurfaceTones')?.at(-1)?.[0]).toEqual({
      container_highest: 81,
    });

    await wrapper.get('[data-cy="surface-contrast-slider"]').setValue('2');
    expect(card().text()).toContain('Tone 81');

    await wrapper.get('[data-cy="surface-card-reset"]').trigger('click');
    expect(card().text()).toContain('Tone 40');
    expect(card().attributes('data-customized')).toBeUndefined();
    expect(wrapper.emitted('update:lightCustomSurfaceTones')?.at(-1)?.[0]).toEqual({});

    await card().trigger('click');
    window.dispatchEvent(new Event('pointerdown'));
    await wrapper.vm.$nextTick();
    expect(card().attributes('data-selected')).toBeUndefined();
  });

  it('keeps light and dark card customizations independent', async () => {
    const tones = buildFullTones('4d');
    const surfaceTones = buildTones('4d');
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones,
        rolePalettes: [
          {
            role: 'surface',
            label: 'Surface',
            kind: 'surface',
            baseTone: 100,
            tones,
            surfaceTones,
          },
        ],
      },
    });
    const card = () => wrapper.get('[data-surface-card="container"]');

    await card().trigger('click');
    await card().trigger('wheel', { deltaY: -100 });
    expect(card().text()).toContain('Tone 96');
    expect(wrapper.emitted('update:lightCustomSurfaceTones')?.at(-1)?.[0]).toEqual({
      container: 96,
    });

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    expect(card().text()).toContain('Tone 20');

    await card().trigger('click');
    await card().trigger('wheel', { deltaY: -100 });
    expect(card().text()).toContain('Tone 21');
    expect(wrapper.emitted('update:darkCustomSurfaceTones')?.at(-1)?.[0]).toEqual({
      container: 21,
    });

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(false);
    expect(card().text()).toContain('Tone 96');
  });

  it('allows page scrolling when the pointer is over an unselected surface card', () => {
    const tones = buildFullTones('4e');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });
    const card = wrapper.get('[data-surface-card="container"]');
    const event = new WheelEvent('wheel', { cancelable: true, deltaY: -100 });

    card.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
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

    await wrapper
      .get('.preview-table-tools [data-surface-role="on-surface"]')
      .trigger('pointermove', {
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
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 70');
  });

  it('reports exact foreground roles for shell, actions, validation, and inspector elements', async () => {
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones: buildTones('77'),
        rolePalettes: [
          { role: 'surface', label: 'Surface', kind: 'surface', tones: buildTones('77') },
          {
            role: 'primary',
            label: 'Primary',
            kind: 'accent',
            baseTone: 50,
            tones: buildTones('88'),
          },
          {
            role: 'secondary',
            label: 'Secondary',
            kind: 'accent',
            baseTone: 50,
            tones: buildTones('99'),
          },
          { role: 'error', label: 'Error', kind: 'accent', baseTone: 50, tones: buildTones('aa') },
        ],
      },
    });

    await wrapper.get('.preview-nav-active').trigger('pointermove', { clientX: 220, clientY: 80 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('On surface container');

    await wrapper.get('[data-cy="secondary-action"] span').trigger('pointermove', {
      clientX: 520,
      clientY: 150,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Secondary On surface');

    await wrapper.get('.preview-validation-helper').trigger('pointermove', {
      clientX: 140,
      clientY: 340,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Error container');

    await wrapper.get('.preview-health-card small').trigger('pointermove', {
      clientX: 830,
      clientY: 500,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      'On surface container variant',
    );

    await wrapper
      .get('.preview-role-showcase [data-surface-role="container"]')
      .trigger('pointermove', {
        clientX: 420,
        clientY: 640,
      });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Primary container');
  });

  it('keeps preview icon, activity, and payment roles readable and hoverable', async () => {
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones: buildTones('77'),
        rolePalettes: [
          { role: 'surface', label: 'Surface', kind: 'surface', tones: buildTones('77') },
          {
            role: 'primary',
            label: 'Primary',
            kind: 'accent',
            baseTone: 50,
            tones: buildTones('88'),
          },
          {
            role: 'tertiary',
            label: 'Tertiary',
            kind: 'accent',
            baseTone: 50,
            tones: buildTones('99'),
          },
          { role: 'error', label: 'Error', kind: 'accent', baseTone: 50, tones: buildTones('aa') },
        ],
      },
    });

    await wrapper.get('.preview-health-heading svg').trigger('pointermove', {
      clientX: 820,
      clientY: 460,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('On surface container');

    const activityRows = wrapper.findAll('.preview-activity p');
    expect(activityRows).toHaveLength(4);
    expect(activityRows[0].find('.preview-activity-dot').exists()).toBe(false);
    expect(
      activityRows[0]
        .get('[data-surface-role="on-surface-container"]')
        .attributes('data-surface-role'),
    ).toBe('on-surface-container');
    expect(activityRows[0].text()).toContain('Invoice approved by Finance');

    await wrapper.get('.preview-metric-icon').trigger('pointermove', {
      clientX: 760,
      clientY: 220,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('On surface container');

    await wrapper.get('.preview-reconciliation-icon-svg').trigger('pointermove', {
      clientX: 460,
      clientY: 620,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('On surface container');

    expect(wrapper.get('.preview-payment-card dd').text()).toContain('•••• 4832');

    await wrapper.get('.preview-validation-helper').trigger('pointermove', {
      clientX: 140,
      clientY: 340,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Error container');

    await wrapper.get('.preview-validation-helper span').trigger('pointermove', {
      clientX: 150,
      clientY: 342,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      'Error On surface container',
    );
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
    expect(wrapper.findAll('[data-surface-card]')).toHaveLength(16);
    expect(wrapper.find('[data-surface-card="primary"]').exists()).toBe(false);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(primaryTones, 98)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-container: ${toneHex(primaryTones, 50)}`,
    );

    const primaryLightExample = wrapper.get(
      '[data-surface-palette="primary"][data-surface-role="surface"]',
    );
    const primaryInverseExample = wrapper.get(
      '[data-surface-palette="primary"][data-surface-role="inverse-surface"]',
    );
    await primaryLightExample.trigger('pointermove', {
      clientX: 200,
      clientY: 300,
    });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Primary Surface');
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
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 50');

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    expect(shell.attributes('style')).toContain(`--preview-surface: ${toneHex(surfaceTones, 0)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-surface-bright: ${toneHex(primaryTones, 95)}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-primary: ${toneHex(primaryTones, 10)}`);
    expect(shell.attributes('style')).toContain(
      `--preview-primary-container: ${toneHex(primaryTones, 40)}`,
    );
  });

  it('keeps accent surface cards anchored while non-surface cards react to dark mode', async () => {
    const surfaceTones = buildTones('11');
    const primaryTones = buildTones('aa');
    const wrapper = mount(MaterialSurfacePreview, {
      props: {
        tones: surfaceTones,
        primaryTones,
        activeRole: 'primary',
        surfaceContrast: 'low',
        lightSurfaceTone: 40,
        darkSurfaceTone: 0,
        surfaceContrastSettings: { surface: 'low', primary: 'low' },
        lightSurfaceToneSettings: { surface: 100, primary: 40 },
        darkSurfaceToneSettings: { surface: 0, primary: 0 },
      },
    });

    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 40');
    expect(wrapper.get('[data-surface-card="container_lowest"]').text()).toContain('Tone 50');
    expect(wrapper.get('[data-surface-card="container"]').text()).toContain('Tone 70');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 20');

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);

    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 5');
    expect(wrapper.get('[data-surface-card="container_lowest"]').text()).toContain('Tone 10');
    expect(wrapper.get('[data-surface-card="container"]').text()).toContain('Tone 20');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 90');
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
          {
            role: 'surface',
            label: 'Surface',
            kind: 'surface',
            baseTone: 100,
            tones: surfaceTones,
            surfaceTones,
          },
          {
            role: 'primary',
            label: 'Primary',
            kind: 'accent',
            baseTone: 50,
            tones: primaryTones,
            surfaceTones: primaryTones,
          },
          {
            role: 'secondary',
            label: 'Secondary',
            kind: 'accent',
            baseTone: 50,
            tones: secondaryTones,
            surfaceTones: secondaryTones,
          },
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
      wrapper.find('[data-surface-palette="secondary"][data-surface-role="surface"]').exists(),
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
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 50');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      toneHex(secondaryTones, 50),
    );

    await wrapper.setProps({
      surfaceContrast: 'high',
      lightSurfaceTone: 90,
      surfaceContrastSettings: { surface: 'low', primary: 'low', secondary: 'high' },
      lightSurfaceToneSettings: { surface: 100, primary: 100, secondary: 90 },
    });

    const secondarySurfaceCard = wrapper.get('[data-surface-card="surface"]');
    const secondarySurfaceExample = wrapper.get(
      '.preview-role-showcase[data-surface-palette="secondary"][data-surface-role="surface"]',
    );
    const secondaryContainerExample = wrapper.get(
      '.preview-role-showcase [data-surface-palette="secondary"][data-surface-role="container"]',
    );

    expect(secondarySurfaceCard.text()).toContain('Secondary Surface');
    expect(secondarySurfaceCard.text()).toContain('Tone 90');
    expect(secondarySurfaceCard.text()).toContain(toneHex(secondaryTones, 90));
    expect(secondarySurfaceExample.attributes('style')).toContain(
      `--preview-role-surface: ${toneHex(secondaryTones, 90)}`,
    );
    expect(secondarySurfaceExample.attributes('style')).toContain(
      `--preview-role-container: ${toneHex(secondaryTones, 35)}`,
    );

    expect(secondarySurfaceExample.attributes('data-surface-tooltip')).toBe(
      'Secondary Surface, tone 90',
    );
    expect(secondaryContainerExample.attributes('data-surface-tooltip')).toBe(
      'Secondary container, tone 35',
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
      `--preview-role-action: ${toneHex(secondaryTones, 50)}`,
    );
    expect(tertiaryAction.text()).toContain('Schedule follow-up');
    expect(tertiaryAction.attributes('style')).toContain(
      `--preview-role-action-container: ${toneHex(tertiaryTones, 80)}`,
    );
    expect(validation.text()).toContain('Customer email');
    expect(alert.text()).toContain('Invoice requires attention');
    expect(alert.attributes('style')).toContain(
      `--preview-role-action-container: ${toneHex(errorTones, 80)}`,
    );

    await secondaryAction.trigger('pointermove', { clientX: 240, clientY: 170 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Secondary Surface');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 50');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      toneHex(secondaryTones, 50),
    );

    await tertiaryAction.trigger('pointermove', { clientX: 300, clientY: 170 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tertiary container');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 80');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(tertiaryTones, 80));

    await validation
      .get('[data-surface-palette="error"][data-surface-role="surface-container"]')
      .trigger('pointermove', {
        clientX: 140,
        clientY: 420,
      });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Error container');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 80');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(errorTones, 80));

    await validation
      .get('[data-surface-palette="error"][data-surface-role="on-surface-container"]')
      .trigger('pointermove', {
        clientX: 150,
        clientY: 422,
      });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(
      'Error On surface container',
    );

    await alert.trigger('pointermove', { clientX: 260, clientY: 360 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Error container');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 80');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(toneHex(errorTones, 80));
  });
});
