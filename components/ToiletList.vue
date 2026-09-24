<template>
  <div>
    <!-- Search & Filter Card -->
    <div class="card">
      <div class="card-title">
        <span>🔍 廁所列表查詢與條件篩選 (GET /api/toilets)</span>
        <button class="btn btn-sm btn-primary" @click="$emit('addNew')">
          ➕ 新增廁所
        </button>
      </div>

      <form @submit.prevent="onSearch">
        <div class="form-row">
          <div class="form-col" style="flex: 2 1 250px">
            <div class="form-group">
              <label class="form-label">關鍵字搜尋 (名稱 / 地址 / 地標)</label>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="輸入關鍵字，如：公園、車站..."
              />
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">最低乾淨分數</label>
              <select
                v-model.number="filters.minCleanScore"
                class="form-select"
              >
                <option :value="undefined">不限</option>
                <option :value="3">3 分以上</option>
                <option :value="4">4 分以上</option>
                <option :value="5">5 分 (最高)</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">最低便利分數</label>
              <select
                v-model.number="filters.minConvenienceScore"
                class="form-select"
              >
                <option :value="undefined">不限</option>
                <option :value="3">3 分以上</option>
                <option :value="4">4 分以上</option>
                <option :value="5">5 分 (最高)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">衛生紙提供</label>
              <select v-model="filters.hasToiletPaper" class="form-select">
                <option :value="undefined">不限</option>
                <option :value="true">僅有衛生紙</option>
                <option :value="false">僅無衛生紙</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">無障礙設施</label>
              <select v-model="filters.isAccessible" class="form-select">
                <option :value="undefined">不限</option>
                <option :value="true">僅有無障礙</option>
                <option :value="false">僅無無障礙</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">標籤篩選 (逗號分隔)</label>
              <input
                v-model="filters.tags"
                type="text"
                class="form-control"
                placeholder="如: 24h, 親子"
              />
            </div>
          </div>
        </div>

        <div
          style="
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 4px;
          "
        >
          <button type="button" class="btn btn-sm" @click="resetFilters">
            重置條件
          </button>
          <button type="submit" class="btn btn-sm btn-primary">查詢列表</button>
        </div>
      </form>
    </div>

    <!-- Data List Card -->
    <div class="card">
      <div class="card-title">
        <span>查詢結果 (共 {{ pagination.total }} 筆資料)</span>
        <button class="btn btn-sm" @click="fetchData">重新整理</button>
      </div>

      <div
        v-if="loading"
        style="padding: 24px; text-align: center; color: var(--text-muted)"
      >
        資料載入中...
      </div>

      <div
        v-else-if="items.length === 0"
        style="
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          border: 1px dashed var(--border-color);
        "
      >
        查無符合條件的廁所資料
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 22%">名稱 / 地標</th>
              <th style="width: 28%">地址</th>
              <th style="width: 15%">評分 (乾淨 / 便利)</th>
              <th style="width: 15%">設施狀態</th>
              <th style="width: 20%; text-align: center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t._id || t.id">
              <td>
                <strong>{{ t.name }}</strong>
                <div
                  v-if="t.landmark"
                  style="font-size: 12px; color: var(--text-muted)"
                >
                  📍 {{ t.landmark }}
                </div>
              </td>
              <td style="font-size: 13px">
                {{ t.address }}
              </td>
              <td style="font-size: 13px">
                <div>
                  乾淨:
                  <strong>{{
                    t.avgCleanScore ? t.avgCleanScore.toFixed(1) : '-'
                  }}</strong>
                  ⭐
                </div>
                <div>
                  便利:
                  <strong>{{
                    t.avgConvenienceScore
                      ? t.avgConvenienceScore.toFixed(1)
                      : '-'
                  }}</strong>
                  ⭐
                </div>
                <small style="color: var(--text-muted)"
                  >({{ t.reviewCount || 0 }} 則評論)</small
                >
              </td>
              <td>
                <div>
                  <span
                    v-if="t.hasToiletPaper === true"
                    class="badge badge-success"
                    >衛生紙: 有</span
                  >
                  <span
                    v-else-if="t.hasToiletPaper === false"
                    class="badge badge-danger"
                    >衛生紙: 無</span
                  >
                  <span v-else class="badge">衛生紙: 未知</span>
                </div>
                <div>
                  <span
                    v-if="t.isAccessible === true"
                    class="badge badge-success"
                    >無障礙: 具備</span
                  >
                  <span
                    v-else-if="t.isAccessible === false"
                    class="badge badge-danger"
                    >無障礙: 無</span
                  >
                </div>
              </td>
              <td style="text-align: center">
                <div class="btn-group">
                  <button
                    class="btn btn-sm"
                    @click="$emit('viewDetail', t._id || t.id)"
                  >
                    詳情
                  </button>
                  <button class="btn btn-sm" @click="$emit('openReviews', t)">
                    評論 ({{ t.reviewCount || 0 }})
                  </button>
                  <button class="btn btn-sm" @click="$emit('editToilet', t)">
                    編輯
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="handleDelete(t)"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <div>
          第 {{ pagination.page }} / {{ pagination.totalPages }} 頁 (每頁
          {{ pagination.limit }} 筆)
        </div>
        <div class="btn-group">
          <button
            class="btn btn-sm"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            上一頁
          </button>
          <button
            class="btn btn-sm"
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

const emit = defineEmits<{
  (e: 'viewDetail', id: string): void;
  (e: 'openReviews', toilet: any): void;
  (e: 'editToilet', toilet: any): void;
  (e: 'addNew'): void;
}>();

const { callApi } = useApi();
const loading = ref(false);
const items = ref<any[]>([]);

const filters = ref({
  search: '',
  minCleanScore: undefined as number | undefined,
  minConvenienceScore: undefined as number | undefined,
  hasToiletPaper: undefined as boolean | undefined,
  isAccessible: undefined as boolean | undefined,
  tags: '',
  limit: 10,
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
});

const fetchData = async () => {
  loading.value = true;

  const params: any = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  if (filters.value.search) params.search = filters.value.search;
  if (filters.value.minCleanScore !== undefined)
    params.minCleanScore = filters.value.minCleanScore;
  if (filters.value.minConvenienceScore !== undefined)
    params.minConvenienceScore = filters.value.minConvenienceScore;
  if (filters.value.hasToiletPaper !== undefined)
    params.hasToiletPaper = filters.value.hasToiletPaper;
  if (filters.value.isAccessible !== undefined)
    params.isAccessible = filters.value.isAccessible;
  if (filters.value.tags) params.tags = filters.value.tags;

  const { data, error } = await callApi<any>('/toilets', { params });
  loading.value = false;

  if (!error && data) {
    if (Array.isArray(data)) {
      items.value = data;
      pagination.value.total = data.length;
      pagination.value.totalPages = 1;
    } else {
      items.value = data.data || [];
      pagination.value.total = data.total ?? items.value.length;
      pagination.value.page = data.page ?? pagination.value.page;
      pagination.value.totalPages = data.totalPages ?? 1;
    }
  }
};

const onSearch = () => {
  pagination.value.page = 1;
  fetchData();
};

const resetFilters = () => {
  filters.value = {
    search: '',
    minCleanScore: undefined,
    minConvenienceScore: undefined,
    hasToiletPaper: undefined,
    isAccessible: undefined,
    tags: '',
    limit: 10,
  };
  pagination.value.page = 1;
  fetchData();
};

const changePage = (newPage: number) => {
  pagination.value.page = newPage;
  fetchData();
};

const handleDelete = async (toilet: any) => {
  const id = toilet._id || toilet.id;
  if (!confirm(`確定要刪除「${toilet.name}」嗎？ (DELETE /api/toilets/:id)`))
    return;

  const { error } = await callApi(`/toilets/${id}`, { method: 'DELETE' });
  if (error) {
    alert(`刪除失敗: ${error}`);
  } else {
    fetchData();
  }
};

defineExpose({
  fetchData,
});

onMounted(() => {
  fetchData();
});
</script>
