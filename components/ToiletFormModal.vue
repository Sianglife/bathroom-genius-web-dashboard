<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">
          {{
            isEdit
              ? '修改廁所資料 (PATCH /api/toilets/:id)'
              : '新增廁所資料 (POST /api/toilets)'
          }}
        </h3>
        <button class="modal-close" @click="close">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label"
                >廁所名稱 <span style="color: red">*</span></label
              >
              <input
                v-model="formData.name"
                type="text"
                class="form-control"
                required
                placeholder="例如: 大安森林公園 1 號公廁"
              />
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">所在地標名稱</label>
              <input
                v-model="formData.landmark"
                type="text"
                class="form-control"
                placeholder="例如: 大安森林公園"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label"
            >詳細地址 <span style="color: red">*</span></label
          >
          <input
            v-model="formData.address"
            type="text"
            class="form-control"
            required
            placeholder="例如: 台北市大安區新生南路二段1號"
          />
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label"
                >經度 Longitude (lng) <span style="color: red">*</span></label
              >
              <input
                v-model.number="formData.lng"
                type="number"
                step="any"
                class="form-control"
                required
                placeholder="例如: 121.5354"
              />
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label"
                >緯度 Latitude (lat) <span style="color: red">*</span></label
              >
              <input
                v-model.number="formData.lat"
                type="number"
                step="any"
                class="form-control"
                required
                placeholder="例如: 25.0330"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">開放類型</label>
              <input
                v-model="formData.openType"
                type="text"
                class="form-control"
                placeholder="例如: 24H 或 配合商場開放"
              />
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">營業時間</label>
              <input
                v-model="formData.hours"
                type="text"
                class="form-control"
                placeholder="例如: 08:00 - 22:00"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">提供衛生紙狀態</label>
              <select v-model="formData.hasToiletPaper" class="form-select">
                <option :value="null">未知 / 未提供</option>
                <option :value="true">有衛生紙</option>
                <option :value="false">無衛生紙</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">無障礙設施</label>
              <select v-model="formData.isAccessible" class="form-select">
                <option :value="null">未知 / 未提供</option>
                <option :value="true">具備無障礙設施</option>
                <option :value="false">無設置無障礙設施</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">特殊標籤 (以逗號分隔)</label>
          <input
            v-model="formData.tagsInput"
            type="text"
            class="form-control"
            placeholder="例如: 24h, 親子, 感應式"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Google 地圖連結</label>
          <input
            v-model="formData.googleMapUrl"
            type="url"
            class="form-control"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">備註說明</label>
          <textarea
            v-model="formData.note"
            class="form-control"
            rows="2"
            placeholder="靠近兒童遊戲區，定期清掃..."
          ></textarea>
        </div>

        <div
          v-if="errorMsg"
          style="
            color: var(--danger-color);
            margin-bottom: 12px;
            font-size: 13px;
          "
        >
          ❌ {{ errorMsg }}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn" @click="close">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '處理中...' : isEdit ? '儲存修改' : '確認新增' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useApi } from '~/composables/useApi';

const props = defineProps<{
  modelValue: boolean;
  toiletData?: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'saved'): void;
}>();

const { callApi } = useApi();
const submitting = ref(false);
const errorMsg = ref('');

const isEdit = computed(
  () => !!props.toiletData?._id || !!props.toiletData?.id,
);

const formData = ref({
  name: '',
  address: '',
  landmark: '',
  lng: 121.5354,
  lat: 25.033,
  openType: '',
  hours: '',
  hasToiletPaper: null as boolean | null,
  isAccessible: null as boolean | null,
  tagsInput: '',
  googleMapUrl: '',
  note: '',
});

watch(
  () => props.toiletData,
  (data) => {
    if (data) {
      formData.value = {
        name: data.name || '',
        address: data.address || '',
        landmark: data.landmark || '',
        lng: data.location?.coordinates
          ? data.location.coordinates[0]
          : 121.5354,
        lat: data.location?.coordinates ? data.location.coordinates[1] : 25.033,
        openType: data.openInfo?.openType || '',
        hours: data.openInfo?.hours || '',
        hasToiletPaper: data.hasToiletPaper ?? null,
        isAccessible: data.isAccessible ?? null,
        tagsInput: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        googleMapUrl: data.googleMapUrl || '',
        note: data.note || '',
      };
    } else {
      formData.value = {
        name: '',
        address: '',
        landmark: '',
        lng: 121.5354,
        lat: 25.033,
        openType: '',
        hours: '',
        hasToiletPaper: null,
        isAccessible: null,
        tagsInput: '',
        googleMapUrl: '',
        note: '',
      };
    }
    errorMsg.value = '';
  },
  { immediate: true },
);

const close = () => {
  emit('update:modelValue', false);
};

const handleSubmit = async () => {
  errorMsg.value = '';
  submitting.value = true;

  const tags = formData.value.tagsInput
    ? formData.value.tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  const payload: any = {
    name: formData.value.name,
    address: formData.value.address,
    location: {
      type: 'Point',
      coordinates: [formData.value.lng, formData.value.lat],
    },
  };

  if (formData.value.landmark) payload.landmark = formData.value.landmark;
  if (formData.value.googleMapUrl)
    payload.googleMapUrl = formData.value.googleMapUrl;
  if (formData.value.note) payload.note = formData.value.note;
  if (formData.value.hasToiletPaper !== null)
    payload.hasToiletPaper = formData.value.hasToiletPaper;
  if (formData.value.isAccessible !== null)
    payload.isAccessible = formData.value.isAccessible;
  if (tags && tags.length > 0) payload.tags = tags;

  if (formData.value.openType || formData.value.hours) {
    payload.openInfo = {
      openType: formData.value.openType || undefined,
      hours: formData.value.hours || undefined,
    };
  }

  const toiletId = props.toiletData?._id || props.toiletData?.id;

  let result;
  if (isEdit.value && toiletId) {
    result = await callApi(`/toilets/${toiletId}`, {
      method: 'PATCH',
      body: payload,
    });
  } else {
    result = await callApi('/toilets', {
      method: 'POST',
      body: payload,
    });
  }

  submitting.value = false;

  if (result.error) {
    errorMsg.value = result.error;
  } else {
    emit('saved');
    close();
  }
};
</script>
