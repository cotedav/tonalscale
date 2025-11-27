<script setup lang="ts">
  import { ShieldCheckIcon } from '@heroicons/vue/24/solid';
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useField, useForm } from 'vee-validate';
  import { object, string } from 'yup';
  import { buildValidationSchema, toErrorMessages } from '@/utils/validation';

  interface SampleFormValues {
    fullName: string;
    email: string;
  }

  const { t } = useI18n();

  const validationSchema = buildValidationSchema<SampleFormValues>(
    object({
      fullName: string().required(t('validation.rules.required')),
      email: string().required(t('validation.rules.required')).email(t('validation.rules.email')),
    }),
  );

  const { resetForm, isSubmitting, validate } = useForm<SampleFormValues>({
    validationSchema,
    initialValues: {
      fullName: '',
      email: '',
    },
  });

  const { value: fullName, handleBlur: handleFullNameBlur } = useField<string>('fullName');
  const { value: email, handleBlur: handleEmailBlur } = useField<string>('email');

  const fieldErrors = ref<Record<keyof SampleFormValues, string[]>>({
    fullName: [],
    email: [],
  });

  const fullNameErrors = computed(() => fieldErrors.value.fullName);
  const emailErrors = computed(() => fieldErrors.value.email);
  const visibleErrors = ref<string[]>([]);
  const submissionMessage = ref('');

  const onSubmit = async () => {
    const result = await validate();

    fieldErrors.value = {
      fullName: toErrorMessages(result.errors?.fullName),
      email: toErrorMessages(result.errors?.email),
    };

    visibleErrors.value = [...fieldErrors.value.fullName, ...fieldErrors.value.email];

    if (!result.valid) {
      return;
    }

    submissionMessage.value = t('validation.sample.success', {
      name: fullName.value,
      email: email.value,
    });

    fieldErrors.value = {
      fullName: [],
      email: [],
    };

    visibleErrors.value = [];
  };

  const onReset = () => {
    submissionMessage.value = '';
    resetForm({
      values: {
        fullName: '',
        email: '',
      },
      errors: {},
    });
    fieldErrors.value = {
      fullName: [],
      email: [],
    };
  };

  defineExpose({ onSubmit });
</script>

<template>
  <div class="card-surface space-y-4">
    <div class="flex items-center gap-2 text-sm font-semibold text-slate-100">
      <ShieldCheckIcon class="h-5 w-5 text-accent-strong" />
      <span>{{ t('validation.sample.title') }}</span>
    </div>

    <p class="text-sm text-slate-400">
      {{ t('validation.sample.description') }}
    </p>

    <div
      class="rounded-xl border border-accent-strong/30 bg-accent-strong/10 px-4 py-3 text-sm text-accent-soft"
      data-cy="validation-helper"
    >
      {{ t('validation.sample.helper_copy') }}
    </div>

    <form
      class="space-y-4"
      data-cy="validation-form"
      @submit.prevent="onSubmit"
    >
      <label class="flex flex-col gap-2 text-sm text-slate-200">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {{ t('validation.sample.fields.full_name.label') }}
        </span>
        <input
          v-model="fullName"
          type="text"
          class="rounded-lg border border-slate-700 bg-surface-soft px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-strong/30"
          autocomplete="name"
          data-cy="full-name-input"
          :aria-invalid="fullNameErrors.length > 0"
          @blur="handleFullNameBlur"
        />
        <p
          v-if="fullNameErrors.length"
          class="text-xs text-rose-300"
        >
          {{ fullNameErrors[0] }}
        </p>
      </label>

      <label class="flex flex-col gap-2 text-sm text-slate-200">
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {{ t('validation.sample.fields.email.label') }}
        </span>
        <input
          v-model="email"
          type="email"
          class="rounded-lg border border-slate-700 bg-surface-soft px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-strong/30"
          autocomplete="email"
          data-cy="email-input"
          :aria-invalid="emailErrors.length > 0"
          @blur="handleEmailBlur"
        />
        <p
          v-if="emailErrors.length"
          class="text-xs text-rose-300"
        >
          {{ emailErrors[0] }}
        </p>
      </label>

      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          class="rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isSubmitting"
          data-cy="submit-button"
        >
          {{ t('validation.sample.actions.submit') }}
        </button>

        <button
          type="button"
          class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-slate-700 transition hover:bg-slate-700"
          data-cy="reset-button"
          @click="onReset"
        >
          {{ t('validation.sample.actions.reset') }}
        </button>
      </div>

      <div
        v-if="visibleErrors.length"
        class="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-50"
        data-cy="validation-errors"
      >
        <ul class="list-disc space-y-1 pl-4">
          <li
            v-for="message in visibleErrors"
            :key="message"
          >
            {{ message }}
          </li>
        </ul>
      </div>
    </form>

    <div
      v-if="submissionMessage"
      class="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50"
      data-cy="submission-message"
    >
      {{ submissionMessage }}
    </div>
  </div>
</template>
