<script setup lang="ts">
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
  <v-card
    variant="tonal"
    class="validation-sample"
  >
    <v-card-title class="text-subtitle-1 font-weight-medium d-flex align-center gap-2">
      <v-icon icon="mdi-shield-check" />
      <span>{{ t('validation.sample.title') }}</span>
    </v-card-title>

    <v-card-text class="d-flex flex-column gap-4">
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ t('validation.sample.description') }}
      </p>

      <v-alert
        type="info"
        density="comfortable"
        variant="tonal"
        border="start"
        class="mb-0"
        data-cy="validation-helper"
      >
        <div class="text-body-2">{{ t('validation.sample.helper_copy') }}</div>
      </v-alert>

      <form
        class="d-flex flex-column gap-4"
        data-cy="validation-form"
        @submit.prevent="onSubmit"
      >
        <v-text-field
          v-model="fullName"
          :label="t('validation.sample.fields.full_name.label')"
          :error-messages="fullNameErrors"
          :error="fullNameErrors.length > 0"
          prepend-inner-icon="mdi-account"
          autocomplete="name"
          data-cy="full-name-input"
          @blur="handleFullNameBlur"
        />

        <v-text-field
          v-model="email"
          :label="t('validation.sample.fields.email.label')"
          :error-messages="emailErrors"
          :error="emailErrors.length > 0"
          prepend-inner-icon="mdi-email"
          autocomplete="email"
          data-cy="email-input"
          @blur="handleEmailBlur"
        />

        <div class="d-flex flex-wrap gap-2">
          <v-btn
            color="primary"
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-cy="submit-button"
          >
            {{ t('validation.sample.actions.submit') }}
          </v-btn>

          <v-btn
            variant="text"
            color="secondary"
            type="button"
            data-cy="reset-button"
            @click="onReset"
          >
            {{ t('validation.sample.actions.reset') }}
          </v-btn>
        </div>

        <v-alert
          v-if="visibleErrors.length"
          type="error"
          variant="tonal"
          density="comfortable"
          border="start"
          class="mb-0"
          data-cy="validation-errors"
        >
          <ul class="mb-0 ps-4">
            <li
              v-for="message in visibleErrors"
              :key="message"
              class="text-body-2"
            >
              {{ message }}
            </li>
          </ul>
        </v-alert>
      </form>

      <v-alert
        v-if="submissionMessage"
        type="success"
        variant="tonal"
        border="start"
        class="mb-0"
        data-cy="submission-message"
      >
        {{ submissionMessage }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>
