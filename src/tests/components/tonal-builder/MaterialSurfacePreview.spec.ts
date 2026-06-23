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
    expect(shell.attributes('style')).toContain(`--preview-primary: ${tones[40].hex}`);
    expect(wrapper.findAll('[data-tone]').length).toBeGreaterThan(5);

    const updatedTones = buildTones('aa');
    await wrapper.setProps({ tones: updatedTones });

    expect(shell.attributes('style')).toContain(`--preview-surface: ${updatedTones[98].hex}`);
    expect(shell.attributes('style')).toContain(`--preview-primary: ${updatedTones[40].hex}`);
  });
});
