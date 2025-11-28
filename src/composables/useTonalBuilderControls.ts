import { computed, reactive, ref } from 'vue';

export type BlendMode =
  | 'darken'
  | 'multiply'
  | 'colorburn'
  | 'lighten'
  | 'screen'
  | 'colordodge'
  | 'overlay'
  | 'softlight'
  | 'hardlight'
  | 'vividlight'
  | 'hue';

export type BlendControlId = 'strength' | 'middle' | 'spread' | 'satDarker' | 'satLighter';

export type BlendControlDefinition = {
  id: BlendControlId;
  labelKey: string;
  range: {
    id: string;
    min: number;
    max: number;
    step: number;
  };
  number: {
    id: string;
    min: number;
    max: number;
    step: number;
  };
  defaultValue: number;
};

export type ControlError = {
  key:
    | 'tonal_builder.controls.errors.invalid_number'
    | 'tonal_builder.controls.errors.out_of_range';
  values?: Record<string, number>;
};

export type ControlErrorState = Record<BlendControlId, ControlError | null>;

export const BLEND_CONTROL_DEFINITIONS: BlendControlDefinition[] = [
  {
    id: 'strength',
    labelKey: 'tonal_builder.controls.fields.strength',
    range: { id: 'strength-slider', min: 0, max: 100, step: 1 },
    number: { id: 'strength-value', min: 0, max: 100, step: 1 },
    defaultValue: 85,
  },
  {
    id: 'middle',
    labelKey: 'tonal_builder.controls.fields.middle',
    range: { id: 'middle-slider', min: -50, max: 50, step: 1 },
    number: { id: 'middle-value', min: -50, max: 50, step: 1 },
    defaultValue: -35,
  },
  {
    id: 'spread',
    labelKey: 'tonal_builder.controls.fields.spread',
    range: { id: 'spread-slider', min: 0, max: 100, step: 1 },
    number: { id: 'spread-value', min: 0, max: 100, step: 1 },
    defaultValue: 100,
  },
  {
    id: 'satDarker',
    labelKey: 'tonal_builder.controls.fields.sat_darker',
    range: { id: 'satDarker-slider', min: 0, max: 100, step: 1 },
    number: { id: 'satDarker-value', min: 0, max: 100, step: 1 },
    defaultValue: 30,
  },
  {
    id: 'satLighter',
    labelKey: 'tonal_builder.controls.fields.sat_lighter',
    range: { id: 'satLighter-slider', min: 0, max: 100, step: 1 },
    number: { id: 'satLighter-value', min: 0, max: 100, step: 1 },
    defaultValue: 50,
  },
];

const buildDefaultValues = () =>
  BLEND_CONTROL_DEFINITIONS.reduce(
    (acc, control) => ({ ...acc, [control.id]: control.defaultValue }),
    {} as Record<BlendControlId, number>,
  );

const buildDefaultErrors = () =>
  BLEND_CONTROL_DEFINITIONS.reduce(
    (acc, control) => ({ ...acc, [control.id]: null }),
    {} as ControlErrorState,
  );

export const useTonalBuilderControls = (initialBlendMode: BlendMode = 'colordodge') => {
  const blendMode = ref<BlendMode>(initialBlendMode);
  const controls = reactive<Record<BlendControlId, number>>(buildDefaultValues());
  const controlErrors = reactive<ControlErrorState>(buildDefaultErrors());

  const setBlendMode = (mode: BlendMode) => {
    blendMode.value = mode;
  };

  const updateControl = (id: BlendControlId, value: number | string) => {
    const definition = BLEND_CONTROL_DEFINITIONS.find((control) => control.id === id);
    if (!definition) return false;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      controlErrors[id] = { key: 'tonal_builder.controls.errors.invalid_number' };
      return false;
    }

    if (numericValue < definition.number.min || numericValue > definition.number.max) {
      controlErrors[id] = {
        key: 'tonal_builder.controls.errors.out_of_range',
        values: { min: definition.number.min, max: definition.number.max },
      };
      return false;
    }

    controlErrors[id] = null;
    controls[id] = Math.round(numericValue);
    return true;
  };

  const resetControls = () => {
    const defaults = buildDefaultValues();
    Object.entries(defaults).forEach(([id, value]) => {
      controls[id as BlendControlId] = value as number;
      controlErrors[id as BlendControlId] = null;
    });
  };

  const hasErrors = computed(() => Object.values(controlErrors).some(Boolean));

  return {
    blendMode,
    controlDefinitions: BLEND_CONTROL_DEFINITIONS,
    controls,
    controlErrors,
    hasErrors,
    setBlendMode,
    updateControl,
    resetControls,
  } as const;
};
