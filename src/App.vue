<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import HsmlEditor from './components/HsmlEditor.vue';
import HsmlOutput from './components/HsmlOutput.vue';
import HtmlEditor from './components/HtmlEditor.vue';
import HtmlOutput from './components/HtmlOutput.vue';
import SidebarPanel from './components/SidebarPanel.vue';
import { useEditorState } from './composables/useEditorState';
import { useSidebar } from './composables/useSidebar';

const { sidebarOpen } = useSidebar();
const { conversionMode } = useEditorState();
</script>

<template lang="hsml">
div(class="h-screen flex flex-col bg-background")
  AppHeader
  div(class="flex flex-1 min-h-0")
    SidebarPanel(:class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'")
    main(class="flex flex-col md:flex-row flex-1 min-h-0 min-w-0")
      // Compile mode: HSML → HTML
      template(v-if="conversionMode === 'compile'")
        div(class="flex-1 min-w-0 min-h-0 basis-0 md:border-r border-b md:border-b-0 border-border")
          HsmlEditor
        div(class="flex-1 min-w-0 min-h-0 basis-0")
          HtmlOutput
      // Convert mode: HTML → HSML
      template(v-else)
        div(class="flex-1 min-w-0 min-h-0 basis-0 md:border-r border-b md:border-b-0 border-border")
          HtmlEditor
        div(class="flex-1 min-w-0 min-h-0 basis-0")
          HsmlOutput
</template>
