<script setup lang="ts">
import { Separator, ToggleGroupItem, ToggleGroupRoot } from 'reka-ui';
import { useEditorState } from '../composables/useEditorState';
import ToggleSwitch from './ToggleSwitch.vue';

const { conversionMode, formatterOptions, showDiagnostics, prettyPrint, formatSource } =
  useEditorState();
</script>

<template lang="hsml">
aside(class="sidebar shrink-0 h-full overflow-hidden bg-sidebar border-r border-border")
  div(class="w-full px-6 overflow-y-auto h-full")
    nav(class="flex flex-col gap-6 py-6")
      div
        h3(class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3") Mode
        ToggleGroupRoot(
          :model-value="conversionMode"
          @update:model-value="(val) => { if (val) conversionMode = val }"
          class="flex rounded overflow-hidden border border-border"
        )
          ToggleGroupItem(
            value="compile"
            class="flex-1 px-3 py-1.5 text-xs font-medium transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-background data-[state=off]:text-foreground data-[state=off]:hover:bg-muted"
          ) HSML → HTML
          ToggleGroupItem(
            value="convert"
            class="flex-1 px-3 py-1.5 text-xs font-medium transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=off]:bg-background data-[state=off]:text-foreground data-[state=off]:hover:bg-muted"
          ) HTML → HSML
      Separator(class="h-px bg-border")
      template(v-if="conversionMode === 'compile'")
        div
          h3(class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3") Formatter
          div(class="space-y-3")
            div
              label(class="block text-sm text-sidebar-foreground mb-1" for="indent-size") Indent Size
              input#indent-size(
                class="w-full px-2 py-1 text-sm rounded border border-border bg-background text-foreground"
                type="number"
                min="1"
                max="8"
                v-model.number="formatterOptions.indentSize"
              )
            div
              label(class="block text-sm text-sidebar-foreground mb-1" for="print-width") Print Width
              input#print-width(
                class="w-full px-2 py-1 text-sm rounded border border-border bg-background text-foreground"
                type="number"
                min="40"
                max="200"
                v-model.number="formatterOptions.printWidth"
              )
            button(
              class="w-full px-3 py-1.5 text-sm font-medium rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              @click="formatSource"
            ) Format
        Separator(class="h-px bg-border")
        div
          h3(class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3") Compiler
          label(class="flex items-center gap-2 text-sm text-sidebar-foreground cursor-pointer")
            ToggleSwitch(v-model="prettyPrint")
            span Pretty print
        Separator(class="h-px bg-border")
        div
          h3(class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3") Diagnostics
          label(class="flex items-center gap-2 text-sm text-sidebar-foreground cursor-pointer")
            ToggleSwitch(v-model="showDiagnostics")
            span Show diagnostics
</template>
