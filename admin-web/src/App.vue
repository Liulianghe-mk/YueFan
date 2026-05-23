<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style>
:root {
  --yf-bg: #f4f1ec;
  --yf-surface: #ffffff;
  --yf-text: #2a2220;
  --yf-muted: #6b625c;
  --yf-accent: #c45c26;
  --yf-accent-soft: rgba(196, 92, 38, 0.12);
  --yf-sidebar: #2a2220;
  --yf-radius: 12px;
  --yf-shadow: 0 4px 24px rgba(42, 34, 32, 0.08);
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  font-family:
    'Source Han Sans SC',
    'PingFang SC',
    'Microsoft YaHei',
    system-ui,
    -apple-system,
    sans-serif;
  color: var(--yf-text);
  background: var(--yf-bg);
  -webkit-font-smoothing: antialiased;
}
</style>
