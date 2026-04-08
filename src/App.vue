<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import HsmlEditor from './components/HsmlEditor.vue';
import HtmlOutput from './components/HtmlOutput.vue';
import SidebarPanel from './components/SidebarPanel.vue';
import { useSidebar } from './composables/useSidebar';

const { sidebarOpen } = useSidebar();
</script>

<template lang="hsml">
div(class="h-screen flex flex-col bg-background")
  AppHeader
  div(class="flex flex-1 min-h-0")
    SidebarPanel(:class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'")
    main(class="flex flex-1 min-h-0 min-w-0")
      div(class="flex-1 min-w-0 basis-0 border-r border-border")
        HsmlEditor
      div(class="flex-1 min-w-0 basis-0")
        HtmlOutput
</template>
