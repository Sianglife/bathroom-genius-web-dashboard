<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">📌 廁所詳細資料 (GET /api/toilets/:id)</h3>
        <button class="modal-close" @click="close">&times;</button>
      </div>

      <div
        v-if="loading"
        style="padding: 24px; text-align: center; color: var(--text-muted)"
      >
        正在載入詳細資料...
      </div>

      <div v-else-if="toilet" style="font-size: 14px">
        <div style="margin-bottom: 12px">
          <h2 style="font-size: 18px; margin-bottom: 4px">{{ toilet.name }}</h2>
          <div style="color: var(--text-muted); font-size: 13px">
            {{ toilet.address }}
          </div>
        </div>

        <div
          class="card"
          style="background-color: #f8f9fa; padding: 12px; margin-bottom: 12px"
        >
          <div class="form-row">
            <div class="form-col">
              <strong>乾淨度評分：</strong>
              <span>{{
                toilet.avgCleanScore
                  ? `${toilet.avgCleanScore.toFixed(1)} / 5.0 ⭐`
                  : '尚無評分'
              }}</span>
            </div>
            <div class="form-col">
              <strong>便利度評分：</strong>
              <span>{{
                toilet.avgConvenienceScore
                  ? `${toilet.avgConvenienceScore.toFixed(1)} / 5.0 ⭐`
                  : '尚無評分'
              }}</span>
            </div>
            <div class="form-col">
              <strong>評論總數：</strong>
              <span>{{ toilet.reviewCount || 0 }} 則</span>
            </div>
          </div>
        </div>

        <table class="table" style="margin-bottom: 16px">
          <tbody>
            <tr>
              <th style="width: 120px">ObjectID</th>
              <td>
                <code>{{ toilet._id || toilet.id }}</code>
              </td>
            </tr>
            <tr>
              <th>所在地標</th>
              <td>{{ toilet.landmark || '無' }}</td>
            </tr>
            <tr>
              <th>經緯度座標</th>
              <td>
                <span v-if="toilet.location?.coordinates">
                  經度: {{ toilet.location.coordinates[0] }}, 緯度:
                  {{ toilet.location.coordinates[1] }}
                </span>
                <span v-else>無座標資訊</span>
              </td>
            </tr>
            <tr>
              <th>開放時間</th>
              <td>
                {{ toilet.openInfo?.openType || '' }}
                {{ toilet.openInfo?.hours ? `(${toilet.openInfo.hours})` : '' }}
                <span
                  v-if="!toilet.openInfo?.openType && !toilet.openInfo?.hours"
                  >未提供</span
                >
              </td>
            </tr>
            <tr>
              <th>衛生紙提供</th>
              <td>
                <span
                  v-if="toilet.hasToiletPaper === true"
                  class="badge badge-success"
                  >提供衛生紙</span
                >
                <span
                  v-else-if="toilet.hasToiletPaper === false"
                  class="badge badge-danger"
                  >無衛生紙</span
                >
                <span v-else class="badge">未知</span>
              </td>
            </tr>
            <tr>
              <th>無障礙設施</th>
              <td>
                <span
                  v-if="toilet.isAccessible === true"
                  class="badge badge-success"
                  >具備無障礙設施</span
                >
                <span
                  v-else-if="toilet.isAccessible === false"
                  class="badge badge-danger"
                  >無設置無障礙設施</span
                >
                <span v-else class="badge">未知</span>
              </td>
            </tr>
            <tr>
              <th>標籤</th>
              <td>
                <span
                  v-for="tag in toilet.tags"
                  :key="tag"
                  class="badge badge-info"
                  >{{ tag }}</span
                >
                <span
                  v-if="!toilet.tags || toilet.tags.length === 0"
                  style="color: var(--text-muted)"
                  >無標籤</span
                >
              </td>
            </tr>
            <tr v-if="toilet.googleMapUrl">
              <th>地圖連結</th>
              <td>
                <a
                  :href="toilet.googleMapUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color: var(--primary-color)"
                >
                  開啟 Google Maps 📍
                </a>
              </td>
            </tr>
            <tr v-if="toilet.note">
              <th>備註說明</th>
              <td>{{ toilet.note }}</td>
            </tr>
          </tbody>
        </table>

        <div
          style="
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            flex-wrap: wrap;
          "
        >
          <button class="btn btn-primary" @click="$emit('openReviews', toilet)">
            💬 查看/撰寫評論 ({{ toilet.reviewCount || 0 }})
          </button>
          <button class="btn" @click="$emit('editToilet', toilet)">
            ✏️ 編輯資料
          </button>
          <button class="btn btn-danger" @click="handleDelete">
            🗑️ 刪除廁所
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn" @click="close">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useApi } from '~/composables/useApi';

const props = defineProps<{
  modelValue: boolean;
  toiletId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'openReviews', toilet: any): void;
  (e: 'editToilet', toilet: any): void;
  (e: 'toiletDeleted'): void;
}>();

const { callApi } = useApi();
const toilet = ref<any>(null);
const loading = ref(false);

const fetchDetail = async (id: string) => {
  loading.value = true;
  const { data, error } = await callApi<any>(`/toilets/${id}`);
  loading.value = false;
  if (!error && data) {
    toilet.value = data;
  }
};

watch(
  () => props.toiletId,
  (id) => {
    if (id && props.modelValue) {
      fetchDetail(id);
    }
  },
);

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.toiletId) {
      fetchDetail(props.toiletId);
    }
  },
);

const handleDelete = async () => {
  const id = toilet.value?._id || toilet.value?.id;
  if (!id) return;
  if (
    !confirm(
      `確定要刪除「${toilet.value.name}」嗎？此操作將一併刪除關聯評論 (DELETE /api/toilets/:id)`,
    )
  ) {
    return;
  }

  const { error } = await callApi(`/toilets/${id}`, { method: 'DELETE' });
  if (error) {
    alert(`刪除失敗: ${error}`);
  } else {
    emit('toiletDeleted');
    close();
  }
};

const close = () => {
  emit('update:modelValue', false);
};
</script>
