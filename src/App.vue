<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui';
import { computed } from 'vue';
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

const isMdAndUp = useMediaQuery('(min-width: 768px)');
const splitterDirection = computed(() => (isMdAndUp.value ? 'horizontal' : 'vertical'));
</script>

<template lang="hsml">
div(class="h-screen flex flex-col bg-background")
  AppHeader
  div(class="flex flex-1 min-h-0")
    SidebarPanel(:class="sidebarOpen ? 'sidebar-open' : 'sidebar-closed'")
    main(class="flex-1 min-h-0 min-w-0")
      SplitterGroup(:direction="splitterDirection" auto-save-id="hsml-playground-splitter" class="h-full")
        SplitterPanel(:default-size="50" :min-size="20")
          template(v-if="conversionMode === 'compile'")
            HsmlEditor
          template(v-else)
            HtmlEditor
        SplitterResizeHandle(class="splitter-handle")
        SplitterPanel(:default-size="50" :min-size="20")
          template(v-if="conversionMode === 'compile'")
            HtmlOutput
          template(v-else)
            HsmlOutput
</template>
