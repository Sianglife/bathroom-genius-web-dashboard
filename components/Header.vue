<template>
  <header class="app-header">
    <div>
      <h1 class="app-title">🚽 廁所達人 (Bathroom Genius) - API 基本使用器</h1>
      <small style="color: var(--text-muted)"
        >提供後端 NestJS API 端點操作與測試介面</small
      >
    </div>

    <div style="display: flex; align-items: center; gap: 12px">
      <div :class="['status-badge', healthStatus === 'ok' ? 'ok' : 'error']">
        <span class="status-dot"></span>
        <span
          >後端狀態:
          {{
            healthStatus === 'ok' ? '正常連線中' : '無法連線 (GET /api/health)'
          }}</span
        >
      </div>
      <button class="btn btn-sm" @click="checkHealth">重新檢查</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

const { callApi } = useApi();
const healthStatus = ref<'checking' | 'ok' | 'error'>('checking');

const checkHealth = async () => {
  const { data, error } = await callApi<{ status: string }>('/health');
  if (!error && data?.status === 'ok') {
    healthStatus.value = 'ok';
  } else {
    healthStatus.value = 'error';
  }
};

onMounted(() => {
  checkHealth();
});
</script>
