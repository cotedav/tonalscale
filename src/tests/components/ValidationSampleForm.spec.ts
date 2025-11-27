import { flushPromises, mount } from '@vue/test-utils';
import ValidationSampleForm from '@/components/forms/ValidationSampleForm.vue';

describe('ValidationSampleForm', () => {
  it('validates required fields and reports success once completed', async () => {
    const wrapper = mount(ValidationSampleForm);

    await wrapper.vm.onSubmit();
    await flushPromises();
    await wrapper.vm.$nextTick();

    const errorsAlert = wrapper.find('[data-cy="validation-errors"]');

    expect(errorsAlert.exists()).toBe(true);
    expect(errorsAlert.text()).toContain('This field is required.');

    await wrapper.get('[data-cy="full-name-input"] input').setValue('Ada Lovelace');
    await wrapper.get('[data-cy="email-input"] input').setValue('ada@example.com');
    await wrapper.vm.onSubmit();
    await flushPromises();
    await wrapper.vm.$nextTick();

    const submissionMessage = wrapper.get('[data-cy="submission-message"]').text();
    expect(submissionMessage).toContain('Ada Lovelace');
    expect(submissionMessage).toContain('ada@example.com');
  });
});
