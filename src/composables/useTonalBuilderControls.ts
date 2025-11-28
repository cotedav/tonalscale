import { reactive, ref } from 'vue';

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
};

const controlDefinitions: BlendControlDefinition[] = [
  {
    id: 'strength',
    labelKey: 'tonal_builder.controls.fields.strength',
    range: { id: 'strength-slider', min: 0, max: 100, step: 1 },
    number: { id: 'strength-value', min: 0, max: 100, step: 1 },
  },
  {
    id: 'middle',
    labelKey: 'tonal_builder.controls.fields.middle',
    range: { id: 'middle-slider', min: -50, max: 50, step: 1 },
    number: { id: 'middle-value', min: 0, max: 100, step: 1 },
  },
  {
    id: 'spread',
    labelKey: 'tonal_builder.controls.fields.spread',
    range: { id: 'spread-slider', min: 0, max: 100, step: 1 },
    number: { id: 'spread-value', min: 0, max: 1, step: 1 },
  },
  {
    id: 'satDarker',
    labelKey: 'tonal_builder.controls.fields.sat_darker',
    range: { id: 'satDarker-slider', min: 0, max: 100, step: 1 },
    number: { id: 'satDarker-value', min: 0, max: 100, step: 1 },
  },
  {
    id: 'satLighter',
    labelKey: 'tonal_builder.controls.fields.sat_lighter',
    range: { id: 'satLighter-slider', min: 0, max: 100, step: 1 },
    number: { id: 'satLighter-value', min: 0, max: 100, step: 1 },
  },
];

const defaultControlValues: Record<BlendControlId, number> = {
  strength: 0,
  middle: 0,
  spread: 0,
  satDarker: 0,
  satLighter: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const useTonalBuilderControls = (initialBlendMode: BlendMode = 'multiply') => {
  const blendMode = ref<BlendMode>(initialBlendMode);
  const controls = reactive<Record<BlendControlId, number>>({ ...defaultControlValues });

  const setBlendMode = (mode: BlendMode) => {
    blendMode.value = mode;
  };

  const updateControl = (id: BlendControlId, value: number) => {
    const definition = controlDefinitions.find((control) => control.id === id);
    if (!definition) return;

    const constrained = clamp(value, definition.number.min, definition.number.max);
    controls[id] = Number.isFinite(constrained) ? constrained : defaultControlValues[id];
  };

  const resetControls = () => {
    Object.entries(defaultControlValues).forEach(([id, value]) => {
      updateControl(id as BlendControlId, value);
    });
  };

  return {
    blendMode,
    controlDefinitions,
    controls,
    setBlendMode,
    updateControl,
    resetControls,
  } as const;
};
