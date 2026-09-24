<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">💬 評論與評分管理 - {{ toilet?.name }}</h3>
        <button class="modal-close" @click="close">&times;</button>
      </div>

      <!-- Add or Edit Review Section -->
      <div class="card" style="background-color: #f8f9fa">
        <h4 style="font-size: 14px; margin-bottom: 8px">
          {{
            editingReviewId
              ? '修改評論 (PATCH /api/reviews/:id)'
              : '新增評論 (POST /api/toilets/:id/reviews)'
          }}
        </h4>

        <form @submit.prevent="submitReview">
          <div class="form-row">
            <div class="form-col">
              <div class="form-group">
                <label class="form-label">乾淨度評分 (1~5 星)</label>
                <select
                  v-model.number="reviewForm.cleanScore"
                  class="form-select"
                >
                  <option :value="undefined">不評分</option>
                  <option :value="5">⭐⭐⭐⭐⭐ 5 分 (極乾淨)</option>
                  <option :value="4">⭐⭐⭐⭐ 4 分 (乾淨)</option>
                  <option :value="3">⭐⭐⭐ 3 分 (普通)</option>
                  <option :value="2">⭐⭐ 2 分 (偏髒)</option>
                  <option :value="1">⭐ 1 分 (極髒)</option>
                </select>
              </div>
            </div>
            <div class="form-col">
              <div class="form-group">
                <label class="form-label">便利度評分 (1~5 星)</label>
                <select
                  v-model.number="reviewForm.convenienceScore"
                  class="form-select"
                >
                  <option :value="undefined">不評分</option>
                  <option :value="5">⭐⭐⭐⭐⭐ 5 分 (極便利)</option>
                  <option :value="4">⭐⭐⭐⭐ 4 分 (便利)</option>
                  <option :value="3">⭐⭐⭐ 3 分 (普通)</option>
                  <option :value="2">⭐⭐ 2 分 (偏不便)</option>
                  <option :value="1">⭐ 1 分 (極不便)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-col">
              <div class="form-group">
                <label class="form-label">現場衛生紙回報</label>
                <select v-model="reviewForm.hasToiletPaper" class="form-select">
                  <option :value="undefined">未特別注意</option>
                  <option :value="true">🧻 有衛生紙</option>
                  <option :value="false">❌ 無衛生紙</option>
                </select>
              </div>
            </div>
            <div class="form-col">
              <div class="form-group">
                <label class="form-label">評論者暱稱</label>
                <input
                  v-model="reviewForm.authorName"
                  type="text"
                  class="form-control"
                  placeholder="預設為: 訪客"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label"
              >評論心得 (評分與評語至少二擇一填寫)</label
            >
            <textarea
              v-model="reviewForm.comment"
              class="form-control"
              rows="2"
              placeholder="請分享您的如廁體驗或衛生情況..."
            ></textarea>
          </div>

          <div
            v-if="formError"
            style="
              color: var(--danger-color);
              margin-bottom: 8px;
              font-size: 13px;
            "
          >
            ❌ {{ formError }}
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end">
            <button
              v-if="editingReviewId"
              type="button"
              class="btn btn-sm"
              @click="cancelEdit"
            >
              取消修改
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="submitting"
            >
              {{
                submitting
                  ? '送出中...'
                  : editingReviewId
                    ? '儲存修改'
                    : '發表評論'
              }}
            </button>
          </div>
        </form>
      </div>

      <!-- Reviews List Section -->
      <div style="margin-top: 16px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          "
        >
          <h4 style="font-size: 14px">
            現有評論列表 (GET /api/toilets/:id/reviews)
          </h4>
          <button class="btn btn-sm" @click="fetchReviews">重新整理</button>
        </div>

        <div
          v-if="loading"
          style="padding: 16px; text-align: center; color: var(--text-muted)"
        >
          載入評論中...
        </div>

        <div
          v-else-if="reviews.length === 0"
          style="
            padding: 16px;
            text-align: center;
            color: var(--text-muted);
            border: 1px dashed var(--border-color);
          "
        >
          目前尚無評論，歡迎留下第一則評論！
        </div>

        <div
          v-else
          style="
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 280px;
            overflow-y: auto;
          "
        >
          <div
            v-for="rev in reviews"
            :key="rev._id"
            style="
              border: 1px solid var(--border-color);
              padding: 10px;
              border-radius: 4px;
              background: #fff;
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              "
            >
              <div>
                <strong>{{ rev.authorName || '匿名訪客' }}</strong>
                <small style="color: var(--text-muted); margin-left: 8px">{{
                  formatDate(rev.createdAt)
                }}</small>
              </div>
              <div class="btn-group">
                <button class="btn btn-sm" @click="startEdit(rev)">編輯</button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="deleteReview(rev._id)"
                >
                  刪除
                </button>
              </div>
            </div>

            <div style="margin: 6px 0; font-size: 13px">
              <span v-if="rev.cleanScore" class="badge badge-info"
                >乾淨: {{ rev.cleanScore }}⭐</span
              >
              <span v-if="rev.convenienceScore" class="badge badge-info"
                >便利: {{ rev.convenienceScore }}⭐</span
              >
              <span
                v-if="rev.hasToiletPaper === true"
                class="badge badge-success"
                >有衛生紙</span
              >
              <span
                v-else-if="rev.hasToiletPaper === false"
                class="badge badge-danger"
                >無衛生紙</span
              >
            </div>

            <p
              v-if="rev.comment"
              style="font-size: 13px; color: #333; margin-top: 4px"
            >
              {{ rev.comment }}
            </p>
          </div>
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
  toilet: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'reviewChanged'): void;
}>();

const { callApi } = useApi();
const reviews = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const formError = ref('');
const editingReviewId = ref<string | null>(null);

const reviewForm = ref({
  cleanScore: undefined as number | undefined,
  convenienceScore: undefined as number | undefined,
  hasToiletPaper: undefined as boolean | undefined,
  authorName: '',
  comment: '',
});

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleString();
};

const fetchReviews = async () => {
  const toiletId = props.toilet?._id || props.toilet?.id;
  if (!toiletId) return;

  loading.value = true;
  const { data, error } = await callApi<any>(`/toilets/${toiletId}/reviews`);
  loading.value = false;
  if (!error && data) {
    reviews.value = Array.isArray(data) ? data : data.data || [];
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.toilet) {
      cancelEdit();
      fetchReviews();
    }
  },
);

const startEdit = (rev: any) => {
  editingReviewId.value = rev._id;
  reviewForm.value = {
    cleanScore: rev.cleanScore,
    convenienceScore: rev.convenienceScore,
    hasToiletPaper: rev.hasToiletPaper,
    authorName: rev.authorName || '',
    comment: rev.comment || '',
  };
};

const cancelEdit = () => {
  editingReviewId.value = null;
  reviewForm.value = {
    cleanScore: undefined,
    convenienceScore: undefined,
    hasToiletPaper: undefined,
    authorName: '',
    comment: '',
  };
  formError.value = '';
};

const submitReview = async () => {
  formError.value = '';
  const toiletId = props.toilet?._id || props.toilet?.id;
  if (!toiletId) return;

  const payload: any = {};
  if (reviewForm.value.cleanScore !== undefined)
    payload.cleanScore = reviewForm.value.cleanScore;
  if (reviewForm.value.convenienceScore !== undefined)
    payload.convenienceScore = reviewForm.value.convenienceScore;
  if (reviewForm.value.hasToiletPaper !== undefined)
    payload.hasToiletPaper = reviewForm.value.hasToiletPaper;
  if (reviewForm.value.authorName)
    payload.authorName = reviewForm.value.authorName;
  if (reviewForm.value.comment) payload.comment = reviewForm.value.comment;

  // Validate at least one score or comment
  if (
    !payload.cleanScore &&
    !payload.convenienceScore &&
    (!payload.comment || !payload.comment.trim())
  ) {
    formError.value = '請至少填寫一項評分（乾淨/便利）或填寫評語內容';
    return;
  }

  submitting.value = true;
  let res;
  if (editingReviewId.value) {
    res = await callApi(`/reviews/${editingReviewId.value}`, {
      method: 'PATCH',
      body: payload,
    });
  } else {
    res = await callApi(`/toilets/${toiletId}/reviews`, {
      method: 'POST',
      body: payload,
    });
  }
  submitting.value = false;

  if (res.error) {
    formError.value = res.error;
  } else {
    cancelEdit();
    await fetchReviews();
    emit('reviewChanged');
  }
};

const deleteReview = async (reviewId: string) => {
  if (!confirm('確定要刪除此筆評論嗎？ (DELETE /api/reviews/:id)')) return;

  const { error } = await callApi(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });

  if (error) {
    alert(`刪除失敗: ${error}`);
  } else {
    await fetchReviews();
    emit('reviewChanged');
  }
};

const close = () => {
  emit('update:modelValue', false);
};
</script>
