<template>
  <div class="card">
    <div class="card-title">
      <span>📡 API 即時日誌與端點呼叫紀錄 (Debug Console)</span>
      <div class="btn-group">
        <button class="btn btn-sm" @click="clearLogs">清空日誌</button>
      </div>
    </div>

    <div
      v-if="apiLogs.length === 0"
      style="color: var(--text-muted); font-size: 13px"
    >
      尚未發送任何 API
      請求。在上方操作各項功能時，即時請求與回應資料將顯示於此。
    </div>

    <div v-else class="api-log-box">
      <div v-for="log in apiLogs" :key="log.id" class="api-log-entry">
        <div>
          <span style="color: #61afef">[{{ log.timestamp }}]</span>
          <strong :style="{ color: getMethodColor(log.method) }">
            {{ log.method }}
          </strong>
          <span style="color: #98c379">{{ log.url }}</span>
          <span
            v-if="log.status"
            :style="{
              color: log.status >= 400 ? '#e06c75' : '#98c379',
              marginLeft: '8px',
            }"
          >
            [{{ log.status }} {{ log.duration ? `${log.duration}ms` : '' }}]
          </span>
          <span v-if="log.error" style="color: #e06c75; margin-left: 8px">
            ❌ {{ log.error }}
          </span>
        </div>

        <div v-if="log.requestData" style="margin-top: 4px; color: #abb2bf">
          <span style="color: #e5c07b">Request:</span>
          {{ JSON.stringify(log.requestData) }}
        </div>

        <div v-if="log.responseData" style="margin-top: 2px; color: #abb2bf">
          <span style="color: #e5c07b">Response:</span>
          {{ JSON.stringify(log.responseData) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi';

const { apiLogs, clearLogs } = useApi();

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return '#61afef';
    case 'POST':
      return '#98c379';
    case 'PATCH':
    case 'PUT':
      return '#e5c07b';
    case 'DELETE':
      return '#e06c75';
    default:
      return '#abb2bf';
  }
};
</script>
