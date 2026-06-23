import { mount } from '@vue/test-utils';

import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
import type { TonalStep } from '@/utils/tonal/scale';

const buildTones = (prefix: string): TonalStep[] =>
  Array.from({ length: 101 }, (_, index) => ({
    index,
    hex: `#${prefix}${index.toString(16).padStart(4, '0')}`.slice(0, 7),
  }));

describe('MaterialSurfacePreview', () => {
  it('maps generated tones to Material surface roles and updates reactively', async () => {
    const tones = buildTones('11');
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones },
    });

    const shell = wrapper.get('[data-cy="surface-preview-shell"]');
    expect(shell.attributes('style')).toContain(`--preview-surface: ${tones[98].hex}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${tones[98].hex}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-lowest: ${tones[100].hex}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-primary: ${tones[40].hex}`);
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
    expect(wrapper.get('.preview-inspector').text()).toContain('Invoice created');

    const surfaceCards = wrapper.findAll('[data-surface-card]');
    expect(surfaceCards).toHaveLength(9);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 98');
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(tones[98].hex);
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 90');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 20');

    const updatedTones = buildTones('aa');
    await wrapper.setProps({ tones: updatedTones });

    expect(shell.attributes('style')).toContain(`--preview-surface: ${updatedTones[98].hex}`);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${updatedTones[40].hex}`);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain(updatedTones[98].hex);
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
    expect(shell.attributes('style')).toContain(`--preview-surface: ${tones[6].hex}`);
    expect(shell.attributes('style')).toContain(`--preview-surface-bright: ${tones[24].hex}`);
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-lowest: ${tones[4].hex}`,
    );
    expect(shell.attributes('style')).toContain(
      `--preview-surface-container-highest: ${tones[22].hex}`,
    );
    expect(shell.attributes('style')).toContain(`--preview-on-surface: ${tones[90].hex}`);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${tones[80].hex}`);
    expect(shell.attributes('style')).toContain(`--preview-on-primary: ${tones[20].hex}`);
    expect(wrapper.get('[data-surface-card="surface"]').text()).toContain('Tone 6');
    expect(wrapper.get('[data-surface-card="container_highest"]').text()).toContain('Tone 22');
    expect(wrapper.get('[data-surface-card="inverse_surface"]').text()).toContain('Tone 90');
    expect(wrapper.find('[data-cy="surface-role-inspector"]').exists()).toBe(false);
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
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(tones[100].hex);

    await wrapper.get('[data-cy="surface-preview-dark-mode"]').setValue(true);
    await table.trigger('pointermove', { clientX: 120, clientY: 180 });

    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 4');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain(tones[4].hex);
  });

  it('reports nested table surfaces for the header and selected row', async () => {
    const wrapper = mount(MaterialSurfacePreview, {
      props: { tones: buildTones('66') },
    });

    const header = wrapper.get('.preview-table-header');
    await header.trigger('pointermove', { clientX: 200, clientY: 210 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Surface container low');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 96');

    const selectedRow = wrapper.get('.preview-table-row-selected');
    await selectedRow.trigger('pointermove', { clientX: 200, clientY: 280 });
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Inverse surface');
    expect(wrapper.get('[data-cy="surface-tooltip"]').text()).toContain('Tone 20');
  });
});
