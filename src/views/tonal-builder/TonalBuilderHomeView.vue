<script setup lang="ts">
  import { useEventListener, useTitle } from '@vueuse/core';
  import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
  import { computed, nextTick, onBeforeUnmount, ref, watch, watchEffect } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { storeToRefs } from 'pinia';

  import ConfirmationDialog from '@/components/tonal-builder/ConfirmationDialog.vue';
  import ColorPickerCard from '@/components/tonal-builder/ColorPickerCard.vue';
  import BaseSwitch from '@/components/common/BaseSwitch.vue';
  import ContrastPreviewCard from '@/components/tonal-builder/ContrastPreviewCard.vue';
  import MaterialSurfacePreview from '@/components/tonal-builder/MaterialSurfacePreview.vue';
  import TonalStrip from '@/components/tonal-builder/TonalStrip.vue';
  import {
    ArrowPathIcon,
    ChevronDownIcon,
    DocumentDuplicateIcon,
    PlusIcon,
    TrashIcon,
  } from '@heroicons/vue/24/outline';
  import ThemeToggle from '@/components/common/ThemeToggle.vue';
  import {
    type BlendControlId,
    type ControlError,
    useTonalBuilderControls,
  } from '@/composables/useTonalBuilderControls';
  import {
    type TonalEnginePayload,
    useTonalBuilderEngine,
  } from '@/composables/useTonalBuilderEngine';
  import { useTonalBuilderColors } from '@/composables/useTonalBuilderColors';
  import { type TonalColorRole, useTonalScaleStore } from '@/stores/tonalScale';
  import { hexToRgb } from '@/utils/color';
  import type { TonalStep } from '@/utils/tonal/scale';
  import { buildSurfaceRoleTones, SURFACE_TONE_ROLES } from '@/utils/tonal/surface-roles';
  import { encodeShareState } from '@/utils/tonal/share-state';
  import { useClipboard } from '@/composables/useClipboard';
  import { useTonalExport } from '@/composables/useTonalExport';
  import useTonalUrlSync from '@/composables/useTonalUrlSync';
  import TheImportExportModal from '@/components/tonal-builder/TheImportExportModal.vue';
  import type { PairingSelection } from '@/components/tonal-builder/types';

  const { t } = useI18n();

  type MaterialPreviewRolePalette = {
    role: TonalColorRole;
    label: string;
    tones: TonalStep[];
  };

  type PendingConfirmation =
    | { type: 'delete-role'; role: TonalColorRole; label: string }
    | { type: 'reset' };

  const isImportModalOpen = ref(false);
  const isBlendEnabled = ref(true);
  const isAccessibilityDockCollapsed = ref(false);
  const pendingConfirmation = ref<PendingConfirmation | null>(null);
  const workspaceRef = ref<HTMLElement | null>(null);
  const controlsPanelWidth = ref(500);
  const isResizingControls = ref(false);

  const controlsPanelStyle = computed(() => ({
    '--controls-panel-width': `${controlsPanelWidth.value}px`,
  }));

  const stopControlsResize = () => {
    isResizingControls.value = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const resizeControlsPanel = (event: PointerEvent) => {
    if (!isResizingControls.value || !workspaceRef.value) return;

    const bounds = workspaceRef.value.getBoundingClientRect();
    const minimumPreviewWidth = 420;
    const minimumControlsWidth = 360;
    const maximumControlsWidth = Math.max(minimumControlsWidth, bounds.width - minimumPreviewWidth);
    controlsPanelWidth.value = Math.min(
      maximumControlsWidth,
      Math.max(minimumControlsWidth, bounds.right - event.clientX),
    );
  };

  const startControlsResize = (event: PointerEvent) => {
    if (window.matchMedia?.('(max-width: 1023px)').matches) return;

    event.preventDefault();
    isResizingControls.value = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleControlsResizeKeydown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 50 : 20;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      controlsPanelWidth.value = Math.min(900, controlsPanelWidth.value + step);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      controlsPanelWidth.value = Math.max(360, controlsPanelWidth.value - step);
    }
  };

  useEventListener(window, 'pointermove', resizeControlsPanel);
  useEventListener(window, 'pointerup', stopControlsResize);
  useEventListener(window, 'pointercancel', stopControlsResize);
  onBeforeUnmount(stopControlsResize);

  const pageTitle = computed(() => t('tonal_builder.meta.title'));
  const pageDescription = computed(() => t('tonal_builder.meta.description'));

  const tonalScale = useTonalScaleStore();
  useTonalUrlSync(tonalScale);
  const {
    activeRole,
    blendDistribution,
    extendedStrip,
    fullStrip,
    keyStrip,
    primaryExtendedStrip,
    scale,
    surfaceExtendedStrip,
  } = storeToRefs(tonalScale);

  const { baseHex, blendHex, sliderMode, updateBase, updateBlend, setSliderMode } =
    useTonalBuilderColors();
  updateBase(tonalScale.baseHex);
  updateBlend(tonalScale.blendHex);

  const {
    blendMode,
    controlDefinitions,
    controls,
    controlErrors,
    hasErrors,
    setBlendMode,
    updateControl,
  } = useTonalBuilderControls(tonalScale.blendMode);

  Object.entries(tonalScale.controls).forEach(([id, value]) => {
    updateControl(id as BlendControlId, value);
  });

  let isApplyingLocalState = false;

  watch(
    () => ({
      baseHex: tonalScale.baseHex,
      blendHex: tonalScale.blendHex,
      blendMode: tonalScale.blendMode,
      controls: { ...tonalScale.controls },
    }),
    (storeState) => {
      if (isApplyingLocalState) return;

      updateBase(storeState.baseHex);
      updateBlend(storeState.blendHex);
      setBlendMode(storeState.blendMode);
      Object.entries(storeState.controls).forEach(([id, value]) => {
        updateControl(id as BlendControlId, value);
      });
      isBlendEnabled.value = storeState.controls.strength > 0;
    },
    { deep: true, flush: 'sync' },
  );

  const baseHexModel = computed({
    get: () => baseHex.value,
    set: (value: string) => {
      updateBase(value);
    },
  });

  const blendHexModel = computed({
    get: () => blendHex.value,
    set: (value: string) => {
      updateBlend(value);
    },
  });

  const sliderModeModel = computed({
    get: () => sliderMode.value,
    set: (value: typeof sliderMode.value) => {
      setSliderMode(value);
    },
  });

  const baseLuminanceIndex = computed(() => scale.value.luminance);

  const blendModes = computed(() => [
    { label: t('tonal_builder.controls.blend_modes.darken'), value: 'darken' },
    { label: t('tonal_builder.controls.blend_modes.multiply'), value: 'multiply' },
    { label: t('tonal_builder.controls.blend_modes.color_burn'), value: 'colorburn' },
    { label: t('tonal_builder.controls.blend_modes.lighten'), value: 'lighten' },
    { label: t('tonal_builder.controls.blend_modes.screen'), value: 'screen' },
    { label: t('tonal_builder.controls.blend_modes.color_dodge'), value: 'colordodge' },
    { label: t('tonal_builder.controls.blend_modes.overlay'), value: 'overlay' },
    { label: t('tonal_builder.controls.blend_modes.soft_light'), value: 'softlight' },
    { label: t('tonal_builder.controls.blend_modes.hard_light'), value: 'hardlight' },
    { label: t('tonal_builder.controls.blend_modes.vivid_light'), value: 'vividlight' },
    { label: t('tonal_builder.controls.blend_modes.hue'), value: 'hue' },
  ]);

  const blendModeModel = computed({
    get: () => blendMode.value,
    set: (value: (typeof blendMode)['value']) => setBlendMode(value),
  });

  const sliderControls = computed(() =>
    controlDefinitions.map((control) => ({
      ...control,
      label: t(control.labelKey),
      value: controls[control.id] ?? control.defaultValue,
    })),
  );

  const previewSelection = ref<PairingSelection>(null);
  const selectedPreview = ref<PairingSelection>(null);
  const editingRole = ref<TonalColorRole | null>(null);
  const roleNameDraft = ref('');
  const roleNameError = ref<string | null>(null);
  const draggedRole = ref<TonalColorRole | null>(null);
  const fullStripRef = ref<InstanceType<typeof TonalStrip> | null>(null);
  const extendedStripRef = ref<InstanceType<typeof TonalStrip> | null>(null);
  const keyStripRef = ref<InstanceType<typeof TonalStrip> | null>(null);

  const blendOverlayActive = ref(false);
  const overlayAnnouncement = ref('');

  const activateBlendOverlay = () => {
    blendOverlayActive.value = true;
    overlayAnnouncement.value = t('tonal_builder.scales.blend_overlay_active');
  };

  const handlePairingChange = (payload: PairingSelection) => {
    previewSelection.value = payload ?? selectedPreview.value;
  };

  const handlePairingSelect = (payload: PairingSelection) => {
    selectedPreview.value = payload;
    previewSelection.value = payload;
  };

  const clearToneSelections = () => {
    fullStripRef.value?.clearSelection();
    extendedStripRef.value?.clearSelection();
    keyStripRef.value?.clearSelection();
    selectedPreview.value = null;
    previewSelection.value = null;
  };

  const handleSwatchesPanelClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-cy="tonal-swatch"]')) return;

    clearToneSelections();
  };

  const selectColorRole = (role: TonalColorRole) => {
    tonalScale.setActiveRole(role);
  };

  const roleLabel = (role: TonalColorRole) => {
    const meta = tonalScale.roleMeta[role];
    if (!meta) return role;
    return meta.isBuiltIn ? t(`tonal_builder.roles.${role}`) : meta.label;
  };

  const activeRoleMeta = computed(() => tonalScale.roleMeta[activeRole.value]);
  const isActiveRoleCustom = computed(() =>
    Boolean(activeRoleMeta.value && !activeRoleMeta.value.isBuiltIn),
  );

  const focusRoleTab = async (role: TonalColorRole) => {
    await nextTick();
    document.querySelector<HTMLButtonElement>(`[data-role-tab="${role}"]`)?.focus();
  };

  const focusRoleNameInput = async (role: TonalColorRole) => {
    await nextTick();
    const input = document.querySelector<HTMLInputElement>(`[data-role-name-input="${role}"]`);
    input?.focus();
    input?.select();
  };

  const startInlineRename = async (role: TonalColorRole) => {
    if (tonalScale.roleMeta[role]?.isBuiltIn) return;
    editingRole.value = role;
    roleNameDraft.value = roleLabel(role);
    roleNameError.value = null;
    await focusRoleNameInput(role);
  };

  const commitInlineRename = async (options: { allowRevert?: boolean } = {}) => {
    const role = editingRole.value;
    if (!role) return;

    const draft = roleNameDraft.value.trim();
    if (!draft && options.allowRevert) {
      roleNameDraft.value = roleLabel(role);
      roleNameError.value = null;
      editingRole.value = null;
      await focusRoleTab(role);
      return;
    }

    roleNameError.value = null;
    const result = tonalScale.renameRole(role, roleNameDraft.value);
    if (!result.success) {
      roleNameError.value = result.error ?? 'not_found';
      await focusRoleNameInput(role);
      return;
    }

    roleNameDraft.value = roleLabel(role);
    editingRole.value = null;
    await focusRoleTab(role);
  };

  const handleRoleTabClick = async (role: TonalColorRole) => {
    if (activeRole.value === role) {
      await startInlineRename(role);
      return;
    }

    selectColorRole(role);
  };

  const handleRoleTabKeydown = async (event: KeyboardEvent, role: TonalColorRole) => {
    if (event.ctrlKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const offset = event.key === 'ArrowLeft' ? -1 : 1;
      if (tonalScale.moveRoleByOffset(role, offset)) {
        selectColorRole(role);
        await focusRoleTab(role);
      }
      return;
    }

    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const roleIndex = tonalScale.roleOrder.indexOf(role);
    const lastIndex = tonalScale.roleOrder.length - 1;
    let nextIndex = roleIndex;
    if (event.key === 'ArrowLeft') nextIndex = Math.max(0, roleIndex - 1);
    if (event.key === 'ArrowRight') nextIndex = Math.min(lastIndex, roleIndex + 1);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = lastIndex;
    const nextRole = tonalScale.roleOrder[nextIndex] ?? role;
    selectColorRole(nextRole);
    await focusRoleTab(nextRole);
  };

  const handleRoleDragStart = (event: DragEvent, role: TonalColorRole) => {
    draggedRole.value = role;
    const { dataTransfer } = event;
    dataTransfer?.setData('text/plain', role);
    if (dataTransfer) dataTransfer.effectAllowed = 'move';
  };

  const handleRoleDragOver = (event: DragEvent) => {
    if (!draggedRole.value) return;
    event.preventDefault();
    const { dataTransfer } = event;
    if (dataTransfer) dataTransfer.dropEffect = 'move';
  };

  const handleRoleDrop = async (event: DragEvent, targetRole: TonalColorRole) => {
    event.preventDefault();
    const sourceRole = draggedRole.value;
    draggedRole.value = null;
    if (!sourceRole || sourceRole === targetRole) return;

    const targetIndex = tonalScale.roleOrder.indexOf(targetRole);
    if (targetIndex === -1) return;

    tonalScale.moveRole(sourceRole, targetIndex);
    selectColorRole(sourceRole);
    await focusRoleTab(sourceRole);
  };

  const handleAddRole = async () => {
    const role = tonalScale.addRole({ label: t('tonal_builder.roles.custom_default') });
    await startInlineRename(role);
  };

  const handleDuplicateRole = async () => {
    const role = tonalScale.duplicateRole(activeRole.value);
    await startInlineRename(role);
  };

  const handleDeleteRole = () => {
    const label = roleLabel(activeRole.value);
    pendingConfirmation.value = { type: 'delete-role', role: activeRole.value, label };
  };

  const resetBuilder = () => {
    tonalScale.loadDefaults();
    clearToneSelections();
    editingRole.value = null;
    roleNameDraft.value = '';
    roleNameError.value = null;
  };

  const handleResetBuilder = () => {
    if (tonalScale.isDefaultState) {
      resetBuilder();
      return;
    }

    pendingConfirmation.value = { type: 'reset' };
  };

  const closeConfirmation = () => {
    pendingConfirmation.value = null;
  };

  const confirmPendingAction = () => {
    const pending = pendingConfirmation.value;
    pendingConfirmation.value = null;
    if (!pending) return;

    if (pending.type === 'delete-role') {
      tonalScale.removeRole(pending.role);
      return;
    }

    resetBuilder();
  };

  const confirmationDialog = computed(() => {
    const pending = pendingConfirmation.value;
    if (!pending) return null;

    if (pending.type === 'delete-role') {
      return {
        title: t('tonal_builder.confirmations.delete_role.title', { role: pending.label }),
        body: t('tonal_builder.confirmations.delete_role.body', { role: pending.label }),
        confirmLabel: t('tonal_builder.confirmations.delete_role.confirm'),
        cancelLabel: t('tonal_builder.actions.cancel'),
        tone: 'danger' as const,
      };
    }

    return {
      title: t('tonal_builder.confirmations.reset.title'),
      body: t('tonal_builder.confirmations.reset.body'),
      confirmLabel: t('tonal_builder.confirmations.reset.confirm'),
      cancelLabel: t('tonal_builder.actions.cancel'),
      tone: 'danger' as const,
    };
  });

  const activePreviewContrast = computed({
    get: () => tonalScale.getRolePreviewSettings(activeRole.value).contrast,
    set: (value) => {
      tonalScale.updateRolePreviewSettings(activeRole.value, { contrast: value });
    },
  });

  const activeLightSurfaceTone = computed({
    get: () => tonalScale.getRolePreviewSettings(activeRole.value).lightSurfaceTone,
    set: (value) => {
      tonalScale.updateRolePreviewSettings(activeRole.value, { lightSurfaceTone: value });
    },
  });

  const activeDarkSurfaceTone = computed({
    get: () => tonalScale.getRolePreviewSettings(activeRole.value).darkSurfaceTone,
    set: (value) => {
      tonalScale.updateRolePreviewSettings(activeRole.value, { darkSurfaceTone: value });
    },
  });

  const surfaceContrastSettings = computed(() =>
    Object.fromEntries(
      tonalScale.roleOrder.map((role) => [role, tonalScale.getRolePreviewSettings(role).contrast]),
    ),
  );

  const lightSurfaceToneSettings = computed(() =>
    Object.fromEntries(
      tonalScale.roleOrder.map((role) => [
        role,
        tonalScale.getRolePreviewSettings(role).lightSurfaceTone,
      ]),
    ),
  );

  const darkSurfaceToneSettings = computed(() =>
    Object.fromEntries(
      tonalScale.roleOrder.map((role) => [
        role,
        tonalScale.getRolePreviewSettings(role).darkSurfaceTone,
      ]),
    ),
  );
  const previewRolePalettes = computed<MaterialPreviewRolePalette[]>(() =>
    tonalScale.roleOrder.map((role) => ({
      role,
      label: roleLabel(role),
      tones: tonalScale.getRoleExtendedStrip(role),
    })),
  );

  watch(activeRole, (role) => {
    fullStripRef.value?.clearSelection();
    extendedStripRef.value?.clearSelection();
    keyStripRef.value?.clearSelection();
    selectedPreview.value = null;
    previewSelection.value = null;
    if (editingRole.value !== role) {
      editingRole.value = null;
      roleNameDraft.value = '';
      roleNameError.value = null;
    }
  });

  watch(
    () => tonalScale.roleMeta[activeRole.value]?.label,
    () => {
      roleNameDraft.value = roleLabel(activeRole.value);
    },
    { immediate: true },
  );

  const previewCards = computed(() => {
    const base = previewSelection.value?.base ?? null;

    const pair = (background: TonalStep | null, text: TonalStep | null) => ({
      background,
      text,
    });

    return {
      darker45: pair(previewSelection.value?.darker45 ?? null, base),
      darker3: pair(previewSelection.value?.darker3 ?? null, base),
      lighter3: pair(base, previewSelection.value?.lighter3 ?? null),
      lighter45: pair(base, previewSelection.value?.lighter45 ?? null),
    };
  });

  const onControlInput = (
    id: BlendControlId,
    value: number | string,
    shouldActivateOverlay = false,
  ) => {
    updateControl(id, value);
    if (shouldActivateOverlay && ['middle', 'spread'].includes(id)) {
      activateBlendOverlay();
    }
  };

  const onBlendControlPointerDown = (id: BlendControlId) => {
    if (['middle', 'spread'].includes(id)) {
      activateBlendOverlay();
    }
  };

  const deactivateBlendOverlay = () => {
    if (!blendOverlayActive.value) return;
    blendOverlayActive.value = false;
    overlayAnnouncement.value = t('tonal_builder.scales.blend_overlay_inactive');
  };

  useEventListener(window, ['pointerup', 'pointercancel', 'touchend'], deactivateBlendOverlay);

  const applyTonalPayload = (payload: TonalEnginePayload) => {
    const blendChannels = hexToRgb(payload.blendHex);

    isApplyingLocalState = true;
    try {
      tonalScale.importRoleState(activeRole.value, {
        colorHex: payload.baseHex,
        blendMode: payload.blendMode,
        blendStrength: isBlendEnabled.value ? payload.strength : 0,
        blendR: blendChannels.r,
        blendG: blendChannels.g,
        blendB: blendChannels.b,
        middle: payload.middle,
        spread: payload.spread,
        satDarker: payload.satDarker,
        satLighter: payload.satLighter,
      });
    } finally {
      isApplyingLocalState = false;
    }
  };

  const tonalEngine = useTonalBuilderEngine(
    {
      colors: { baseHex, blendHex },
      controls: { blendMode, controls, hasErrors },
    },
    {
      onUpdate: applyTonalPayload,
    },
  );

  watch(isBlendEnabled, () => {
    if (tonalEngine.lastPayload.value) {
      applyTonalPayload(tonalEngine.lastPayload.value);
    }
  });

  useTitle(pageTitle);

  watchEffect(() => {
    const descriptionTag =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement | null) ??
      (() => {
        const tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
        return tag;
      })();

    descriptionTag.setAttribute('content', pageDescription.value);
  });

  // Export & Clipboard

  const { copyToClipboard } = useClipboard();
  const { generateScaleSvg, generateMultiRoleScaleSvg } = useTonalExport();

  const shareExportContext = () => {
    const { serializedState } = tonalScale;
    const { origin, pathname } = window.location;
    return {
      serializedState,
      shareUrl: `${origin}${pathname}${encodeShareState(serializedState)}`,
    };
  };

  const surfaceCardLabel = (role: string, palette: TonalColorRole) => {
    const roleName = t(`tonal_builder.surface_preview.roles.${role}`);
    return palette !== 'surface'
      ? t('tonal_builder.surface_preview.palette_role', {
          palette: roleLabel(palette),
          role: roleName,
        })
      : roleName;
  };

  const buildRoleExportInput = (role: TonalColorRole) => {
    const roleExtendedStrip = tonalScale.getRoleExtendedStrip(role);
    const previewSettings = tonalScale.getRolePreviewSettings(role);
    const roleTones = buildSurfaceRoleTones({
      tones: roleExtendedStrip,
      isDarkMode: tonalScale.preview.darkMode,
      contrast: previewSettings.contrast,
      lightTone: previewSettings.lightSurfaceTone,
      darkTone: previewSettings.darkSurfaceTone,
    });
    const surfaceCards = SURFACE_TONE_ROLES.map((surfaceRole) => {
      const tone = roleTones[surfaceRole];

      return {
        label: surfaceCardLabel(surfaceRole, role),
        tone,
        hex:
          roleExtendedStrip.find((step) => step.index === tone)?.hex ??
          tonalScale.getRoleParams(role).colorHex,
      };
    });

    return {
      params: tonalScale.getRoleParams(role),
      roleLabel: roleLabel(role),
      fullStrip: tonalScale.getRoleFullStrip(role),
      extendedStrip: roleExtendedStrip,
      keyStrip: tonalScale.getRoleKeyStrip(role),
      surfaceCards,
    };
  };

  const sharedExportLabels = () => ({
    exportedColorLabel: t('tonal_builder.export.exported_color'),
    surfaceCardsLabel: t('tonal_builder.export.surface_roles'),
    stripLabels: {
      full: t('tonal_builder.scales.full'),
      extended: t('tonal_builder.scales.extended'),
      key: t('tonal_builder.scales.key'),
    },
  });

  const handleCopyCurrentRoleSvg = async () => {
    const { serializedState, shareUrl } = shareExportContext();
    const svg = generateScaleSvg({
      ...buildRoleExportInput(activeRole.value),
      metadata: serializedState,
      sourceUrl: shareUrl,
      ...sharedExportLabels(),
    });

    await copyToClipboard(svg, 'SVG');
  };

  const handleCopyAllRolesSvg = async () => {
    const { serializedState, shareUrl } = shareExportContext();
    const svg = generateMultiRoleScaleSvg({
      roles: tonalScale.roleOrder.map((role) => buildRoleExportInput(role)),
      metadata: serializedState,
      sourceUrl: shareUrl,
      titleLabel: t('tonal_builder.export.all_roles_title'),
      ...sharedExportLabels(),
      exportedColorLabel: t('tonal_builder.export.exported_colors'),
    });

    await copyToClipboard(svg, 'SVG');
  };
</script>

<template>
  <main
    class="flex h-screen flex-col overflow-hidden bg-surface"
    aria-labelledby="tonal-builder-heading"
    data-cy="tonal-builder-home"
  >
    <TheImportExportModal
      :is-open="isImportModalOpen"
      @close="isImportModalOpen = false"
    />
    <h1
      id="tonal-builder-heading"
      class="sr-only"
      data-cy="tonal-builder-title"
    >
      {{ pageTitle }}
    </h1>

    <header
      id="toolbar"
      class="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-dim bg-surface-soft px-4 sm:px-8"
      :aria-label="t('tonal_builder.actions.toolbar_label')"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div
          class="flex h-full min-w-0 flex-1 items-end gap-1 overflow-x-auto"
          role="tablist"
          :aria-label="t('tonal_builder.roles.tabs_label')"
          data-cy="color-role-tabs"
        >
          <template
            v-for="role in tonalScale.roleOrder"
            :key="role"
          >
            <div
              v-if="editingRole === role"
              role="tab"
              class="relative flex h-12 shrink-0 items-center px-5 text-sm font-semibold text-primary"
              aria-selected="true"
              tabindex="0"
              :data-role-tab="role"
              :data-cy="`${role}-role-tab`"
            >
              <span
                class="mr-2 inline-block h-3.5 w-3.5 rounded-full border border-dim align-[-2px] shadow-sm"
                :style="{ backgroundColor: tonalScale.roles[role].state.baseHex }"
                :aria-label="
                  t('tonal_builder.roles.base_color_badge', {
                    role: roleLabel(role),
                    color: tonalScale.roles[role].state.baseHex,
                  })
                "
                :data-cy="`${role}-role-color-badge`"
              />
              <input
                v-model="roleNameDraft"
                type="text"
                class="h-8 w-40 rounded-lg border border-dim bg-surface px-2 text-sm text-primary shadow-inner focus:outline-none focus:ring-2 focus:ring-accent"
                :aria-label="t('tonal_builder.roles.rename_label')"
                :aria-invalid="Boolean(roleNameError)"
                :aria-describedby="roleNameError ? 'role-name-error' : undefined"
                :data-role-name-input="role"
                data-cy="role-name-input"
                @keydown.stop.enter.prevent="commitInlineRename()"
                @blur="commitInlineRename({ allowRevert: true })"
              />
              <span
                class="absolute inset-x-2 bottom-0 h-0.5 bg-accent"
                aria-hidden="true"
              />
              <span
                v-if="roleNameError"
                id="role-name-error"
                class="sr-only"
                role="alert"
                data-cy="role-name-error"
              >
                {{ t(`tonal_builder.roles.errors.${roleNameError}`) }}
              </span>
            </div>
            <button
              v-else
              type="button"
              role="tab"
              class="relative flex h-12 shrink-0 items-center px-5 text-sm font-semibold text-secondary transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              :class="{ 'text-primary': activeRole === role }"
              :aria-selected="activeRole === role"
              :tabindex="activeRole === role ? 0 : -1"
              draggable="true"
              :data-role-tab="role"
              :data-cy="`${role}-role-tab`"
              @click="handleRoleTabClick(role)"
              @dragstart="handleRoleDragStart($event, role)"
              @dragover="handleRoleDragOver"
              @drop="handleRoleDrop($event, role)"
              @dragend="draggedRole = null"
              @keydown="handleRoleTabKeydown($event, role)"
            >
              <span
                class="mr-2 inline-block h-3.5 w-3.5 rounded-full border border-dim align-[-2px] shadow-sm"
                :style="{ backgroundColor: tonalScale.roles[role].state.baseHex }"
                :aria-label="
                  t('tonal_builder.roles.base_color_badge', {
                    role: roleLabel(role),
                    color: tonalScale.roles[role].state.baseHex,
                  })
                "
                :data-cy="`${role}-role-color-badge`"
              />
              <span>{{ roleLabel(role) }}</span>
              <span
                v-if="activeRole === role"
                class="absolute inset-x-2 bottom-0 h-0.5 bg-accent"
                aria-hidden="true"
              />
            </button>
          </template>
          <button
            type="button"
            class="mb-1 ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dim bg-surface text-secondary transition hover:bg-surface-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :aria-label="t('tonal_builder.roles.add')"
            data-cy="role-add"
            @click="handleAddRole"
          >
            <PlusIcon class="h-4 w-4" />
          </button>
        </div>

        <div
          class="hidden shrink-0 items-center gap-1 lg:flex"
          :aria-label="t('tonal_builder.roles.management_label')"
          data-cy="role-management"
        >
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dim bg-surface text-secondary transition hover:bg-surface-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :aria-label="t('tonal_builder.roles.duplicate', { role: roleLabel(activeRole) })"
            data-cy="role-duplicate"
            @click="handleDuplicateRole"
          >
            <DocumentDuplicateIcon class="h-4 w-4" />
          </button>
          <template v-if="isActiveRoleCustom">
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              :aria-label="t('tonal_builder.roles.delete', { role: roleLabel(activeRole) })"
              data-cy="role-delete"
              @click="handleDeleteRole"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </template>
        </div>
      </div>

      <div
        class="flex shrink-0 flex-wrap items-center justify-end gap-3"
        :aria-label="t('tonal_builder.actions.actions_label')"
      >
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-none bg-accent-strong/15 px-5 text-sm font-semibold text-primary ring-1 ring-inset ring-accent-strong/20 transition hover:bg-accent-strong/25"
          data-cy="tonal-builder-import"
          @click="isImportModalOpen = true"
        >
          {{ t('tonal_builder.actions.import') }}
        </button>
        <Menu
          as="div"
          class="relative"
        >
          <MenuButton
            id="copy-button"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-none bg-accent-strong/15 px-5 text-sm font-semibold text-primary ring-1 ring-inset ring-accent-strong/20 transition hover:bg-accent-strong/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            data-cy="tonal-builder-copy"
          >
            {{ t('tonal_builder.actions.export') }}
            <ChevronDownIcon
              class="h-4 w-4"
              aria-hidden="true"
            />
          </MenuButton>
          <MenuItems
            class="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-glass/15 bg-surface-soft/95 p-1 text-sm shadow-card backdrop-blur-xl focus:outline-none"
            data-cy="export-menu"
          >
            <MenuItem v-slot="{ active }">
              <button
                type="button"
                class="flex w-full rounded-lg px-3 py-2 text-left font-semibold text-primary"
                :class="{ 'bg-glass/10': active }"
                data-cy="export-current-role"
                @click="handleCopyCurrentRoleSvg"
              >
                {{ t('tonal_builder.export.this_role_only') }}
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }">
              <button
                type="button"
                class="flex w-full rounded-lg px-3 py-2 text-left font-semibold text-primary"
                :class="{ 'bg-glass/10': active }"
                data-cy="export-all-roles"
                @click="handleCopyAllRolesSvg"
              >
                {{ t('tonal_builder.export.all_roles') }}
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-none bg-accent-strong/15 px-5 text-sm font-semibold text-primary ring-1 ring-inset ring-accent-strong/20 transition hover:bg-accent-strong/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          data-cy="tonal-builder-reset"
          @click="handleResetBuilder"
        >
          <ArrowPathIcon class="h-4 w-4" />
          {{ t('tonal_builder.actions.reset') }}
        </button>

        <ThemeToggle
          id="theme-toggle"
          class="!h-11 !w-auto !rounded-none !bg-accent-strong/15 !px-5 !text-primary ring-1 ring-inset ring-accent-strong/20 hover:!bg-accent-strong/25"
          data-cy="tonal-builder-theme-toggle"
        />
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col">
      <div
        ref="workspaceRef"
        class="builder-workspace grid min-h-0 flex-1"
        :style="controlsPanelStyle"
        data-cy="builder-workspace"
      >
        <div
          class="min-h-0 overflow-y-auto bg-surface-soft px-4 py-6 sm:px-8 lg:px-10"
          :aria-label="t('tonal_builder.scales.title')"
          data-cy="swatches-panel"
          @click="handleSwatchesPanelClick"
        >
          <section
            class="space-y-4"
            :aria-label="t('tonal_builder.scales.title')"
          >
            <p class="sr-only">{{ t('tonal_builder.scales.description') }}</p>
            <p
              class="sr-only"
              role="status"
              aria-live="polite"
            >
              {{ overlayAnnouncement }}
            </p>

            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-primary">
                    {{ t('tonal_builder.scales.full') }}
                  </span>
                  <span class="text-xs text-secondary">{{
                    t('tonal_builder.scales.full_helper')
                  }}</span>
                </div>
                <TonalStrip
                  id="color-scale-container-full"
                  ref="fullStripRef"
                  :tones="fullStrip"
                  :base-index="baseLuminanceIndex"
                  class="min-h-[96px]"
                  :blend-graph-active="blendOverlayActive"
                  :blend-graph-data="blendDistribution"
                  :show-blend-dist-graph="true"
                  data-cy="scale-strip-full"
                  @pairing-change="handlePairingChange"
                  @pairing-select="handlePairingSelect"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-primary">
                    {{ t('tonal_builder.scales.extended') }}
                  </span>
                  <span class="text-xs text-secondary">{{
                    t('tonal_builder.scales.extended_helper')
                  }}</span>
                </div>
                <TonalStrip
                  id="color-scale-container-custom"
                  ref="extendedStripRef"
                  :tones="extendedStrip"
                  :base-index="baseLuminanceIndex"
                  class="min-h-[72px]"
                  data-cy="scale-strip-extended"
                  @pairing-change="handlePairingChange"
                  @pairing-select="handlePairingSelect"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-primary">
                    {{ t('tonal_builder.scales.key') }}
                  </span>
                  <span class="text-xs text-secondary">{{
                    t('tonal_builder.scales.key_helper')
                  }}</span>
                </div>
                <TonalStrip
                  id="color-scale-container-key"
                  ref="keyStripRef"
                  :tones="keyStrip"
                  :base-index="baseLuminanceIndex"
                  class="min-h-[72px]"
                  data-cy="scale-strip-key"
                  @pairing-change="handlePairingChange"
                  @pairing-select="handlePairingSelect"
                />
              </div>
            </div>

            <MaterialSurfacePreview
              v-model:dark-mode="tonalScale.preview.darkMode"
              v-model:surface-contrast="activePreviewContrast"
              v-model:light-surface-tone="activeLightSurfaceTone"
              v-model:dark-surface-tone="activeDarkSurfaceTone"
              class="pt-4"
              :tones="surfaceExtendedStrip"
              :primary-tones="primaryExtendedStrip"
              :role-palettes="previewRolePalettes"
              :active-role="activeRole"
              :surface-contrast-settings="surfaceContrastSettings"
              :light-surface-tone-settings="lightSurfaceToneSettings"
              :dark-surface-tone-settings="darkSurfaceToneSettings"
            />
          </section>
        </div>

        <div
          class="builder-resize-handle"
          :class="{ 'builder-resize-handle-active': isResizingControls }"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          :aria-label="t('tonal_builder.regions.resize_controls')"
          :aria-valuenow="controlsPanelWidth"
          aria-valuemin="360"
          data-cy="controls-resize-handle"
          @pointerdown="startControlsResize"
          @keydown="handleControlsResizeKeydown"
        >
          <span aria-hidden="true" />
        </div>

        <div
          class="min-h-0 overflow-y-auto bg-surface px-4 py-6 sm:px-8 lg:px-10"
          :aria-label="t('tonal_builder.regions.pickers_label')"
          data-cy="color-controls-panel"
        >
          <span
            id="baseColorPickerInput"
            class="sr-only"
          >
            {{ baseHex }}
          </span>

          <section
            class="space-y-5"
            :aria-label="t('tonal_builder.actions.toolbar_label')"
          >
            <ColorPickerCard
              id="baseColorPicker"
              v-model="baseHexModel"
              v-model:slider-mode="sliderModeModel"
              :label="t('tonal_builder.pickers.base.title')"
              :description="t('tonal_builder.pickers.base.description')"
              :swatch-label="t('tonal_builder.pickers.base.badge')"
              data-cy="base-color-picker"
            />
          </section>

          <section
            class="mt-10 space-y-3"
            :aria-label="t('tonal_builder.controls.title')"
          >
            <div
              id="gradient-controls"
              class="grid grid-cols-1 items-center gap-3 rounded-none border border-dim bg-surface-soft/80 p-4 sm:grid-cols-[auto_minmax(0,1fr)_88px]"
              data-cy="gradient-controls"
            >
              <div class="flex flex-wrap items-center justify-between gap-3 sm:col-span-3">
                <p class="text-sm font-semibold text-primary">
                  {{ t('tonal_builder.controls.title') }}
                </p>
                <BaseSwitch
                  id="blend-enabled"
                  v-model="isBlendEnabled"
                  :label="t('tonal_builder.controls.labels.blend_enabled')"
                  data-cy="blend-enabled-toggle"
                >
                  {{ t('tonal_builder.controls.labels.blend_enabled') }}
                </BaseSwitch>
              </div>

              <ColorPickerCard
                id="blendColorPicker"
                v-model="blendHexModel"
                v-model:slider-mode="sliderModeModel"
                class="sm:col-span-3"
                :label="t('tonal_builder.pickers.blend.title')"
                :description="t('tonal_builder.pickers.blend.description')"
                :swatch-label="t('tonal_builder.pickers.blend.badge')"
                data-cy="blend-color-picker"
              />

              <label
                class="text-sm font-semibold text-primary"
                for="blendmode"
              >
                {{ t('tonal_builder.controls.labels.blend_mode') }}
              </label>
              <select
                id="blendmode"
                v-model="blendModeModel"
                name="blendmode"
                class="h-11 w-full rounded-xl border border-dim bg-surface px-3 text-sm text-primary shadow-inner"
                data-cy="blendmode-select"
              >
                <option
                  v-for="mode in blendModes"
                  :key="mode.value"
                  :value="mode.value"
                >
                  {{ mode.label }}
                </option>
              </select>
              <span
                aria-hidden="true"
                class="hidden sm:block"
              />

              <span
                id="blendColorPickerInput"
                class="sr-only"
              >
                {{ blendHex }}
              </span>

              <template
                v-for="control in sliderControls"
                :key="control.id"
              >
                <label
                  :for="control.range.id"
                  class="text-sm font-semibold text-primary"
                >
                  {{ control.label }}
                </label>
                <input
                  :id="control.range.id"
                  :value="control.value"
                  type="range"
                  :min="control.range.min"
                  :max="control.range.max"
                  :step="control.range.step"
                  class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-accent"
                  :aria-label="control.label"
                  :data-cy="`${control.id}-slider`"
                  @pointerdown="onBlendControlPointerDown(control.id)"
                  @pointerup="deactivateBlendOverlay"
                  @pointercancel="deactivateBlendOverlay"
                  @blur="deactivateBlendOverlay"
                  @input="
                    onControlInput(control.id, ($event.target as HTMLInputElement).value, true)
                  "
                  @change="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
                />
                <input
                  :id="control.number.id"
                  :value="control.value"
                  type="number"
                  :min="control.number.min"
                  :max="control.number.max"
                  :step="control.number.step"
                  class="h-11 w-full rounded-xl border border-dim bg-surface px-3 text-sm text-primary shadow-inner"
                  :aria-label="control.label"
                  :data-cy="`${control.id}-value`"
                  @input="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
                  @change="onControlInput(control.id, ($event.target as HTMLInputElement).value)"
                  @blur="deactivateBlendOverlay"
                />
                <p
                  v-if="controlErrors[control.id]"
                  class="text-xs text-rose-300 sm:col-start-2 sm:col-span-2"
                  role="alert"
                >
                  {{
                    t(
                      (controlErrors[control.id] as ControlError).key,
                      (controlErrors[control.id] as ControlError).values ?? {},
                    )
                  }}
                </p>
              </template>
            </div>
          </section>
        </div>
      </div>

      <section
        class="shrink-0 border-t border-dim bg-surface-soft transition-all duration-300"
        :aria-label="t('tonal_builder.accessibility.title')"
        data-cy="accessibility-dock"
      >
        <div
          class="flex items-center justify-between px-4 py-3 sm:px-8 lg:px-10"
          :class="{ 'border-b border-dim': !isAccessibilityDockCollapsed }"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-primary">
              {{ t('tonal_builder.accessibility.title') }}
            </h2>
            <span class="hidden text-xs text-secondary sm:inline">
              {{ t('tonal_builder.accessibility.description') }}
            </span>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-strong hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :aria-label="
              isAccessibilityDockCollapsed
                ? t('tonal_builder.accessibility.expand')
                : t('tonal_builder.accessibility.collapse')
            "
            :aria-expanded="!isAccessibilityDockCollapsed"
            data-cy="accessibility-dock-toggle"
            @click="isAccessibilityDockCollapsed = !isAccessibilityDockCollapsed"
          >
            <ChevronDownIcon
              class="h-5 w-5 transition-transform duration-200"
              :class="{ 'rotate-180': isAccessibilityDockCollapsed }"
            />
          </button>
        </div>

        <div
          v-show="!isAccessibilityDockCollapsed"
          class="px-4 py-4 sm:px-8 lg:px-10"
          data-cy="accessibility-dock-content"
        >
          <div class="grid grid-cols-4 gap-4 overflow-hidden">
            <ContrastPreviewCard
              id="colorcard-darker45"
              :title-key="'tonal_builder.accessibility.cards.darker_45'"
              ratio-label="4.5:1"
              :background="previewCards.darker45.background"
              :text="previewCards.darker45.text"
            />

            <ContrastPreviewCard
              id="colorcard-darker3"
              :title-key="'tonal_builder.accessibility.cards.darker_3'"
              ratio-label="3:1"
              :background="previewCards.darker3.background"
              :text="previewCards.darker3.text"
            />

            <ContrastPreviewCard
              id="colorcard-lighter3"
              :title-key="'tonal_builder.accessibility.cards.lighter_3'"
              ratio-label="3:1"
              :background="previewCards.lighter3.background"
              :text="previewCards.lighter3.text"
            />

            <ContrastPreviewCard
              id="colorcard-lighter45"
              :title-key="'tonal_builder.accessibility.cards.lighter_45'"
              ratio-label="4.5:1"
              :background="previewCards.lighter45.background"
              :text="previewCards.lighter45.text"
            />
          </div>
        </div>
      </section>
    </div>

    <ConfirmationDialog
      :is-open="Boolean(confirmationDialog)"
      :title="confirmationDialog?.title ?? ''"
      :body="confirmationDialog?.body ?? ''"
      :confirm-label="confirmationDialog?.confirmLabel ?? ''"
      :cancel-label="confirmationDialog?.cancelLabel ?? ''"
      :tone="confirmationDialog?.tone"
      @cancel="closeConfirmation"
      @confirm="confirmPendingAction"
    />
  </main>
</template>

<style scoped>
  .builder-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .builder-resize-handle {
    display: none;
  }

  @media (width >= 1024px) {
    .builder-workspace {
      grid-template-columns: minmax(0, 1fr) 9px var(--controls-panel-width);
    }

    .builder-resize-handle {
      position: relative;
      z-index: 10;
      display: grid;
      cursor: col-resize;
      place-items: center;
      background: rgb(var(--color-border-dim));
      touch-action: none;
    }

    .builder-resize-handle::before {
      position: absolute;
      inset: 0 -4px;
      content: '';
    }

    .builder-resize-handle > span {
      width: 2px;
      height: 42px;
      border-radius: 999px;
      background: rgb(var(--color-text-tertiary));
      opacity: 0.65;
      transition:
        height 140ms ease,
        background-color 140ms ease,
        opacity 140ms ease;
    }

    .builder-resize-handle-active > span,
    .builder-resize-handle:hover > span,
    .builder-resize-handle:focus-visible > span {
      height: 64px;
      background: rgb(var(--color-accent));
      opacity: 1;
    }

    .builder-resize-handle:focus-visible {
      outline: 2px solid rgb(var(--color-accent));
      outline-offset: -2px;
    }
  }
</style>
