<template>
  <div>
    <!-- Nearby Search Settings Card -->
    <div class="card">
      <div class="card-title">
        <span>📍 依據經緯度推薦附近廁所 (GET /api/toilets/nearby)</span>
      </div>

      <form @submit.prevent="fetchNearby">
        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label"
                >經度 Longitude (lng) <span style="color: red">*</span></label
              >
              <input
                v-model.number="params.lng"
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
                v-model.number="params.lat"
                type="number"
                step="any"
                class="form-control"
                required
                placeholder="例如: 25.0330"
              />
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">搜尋半徑 (公尺)</label>
              <select v-model.number="params.radius" class="form-select">
                <option :value="500">500 公尺</option>
                <option :value="1000">1,000 公尺 (預設)</option>
                <option :value="2000">2,000 公尺</option>
                <option :value="5000">5,000 公尺</option>
                <option :value="10000">10,000 公尺</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Quick Location Preset Buttons -->
        <div
          style="
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
          "
        >
          <span style="font-size: 13px; font-weight: 500">快速定位：</span>
          <button
            type="button"
            class="btn btn-sm"
            @click="getCurrentLocation"
            :disabled="geoLoading"
          >
            {{ geoLoading ? '定位中...' : '🎯 取得瀏覽器當前 GPS' }}
          </button>
          <button
            type="button"
            class="btn btn-sm"
            @click="setLocation(121.5354, 25.033)"
          >
            大安森林公園
          </button>
          <button
            type="button"
            class="btn btn-sm"
            @click="setLocation(121.517, 25.0478)"
          >
            台北車站
          </button>
          <button
            type="button"
            class="btn btn-sm"
            @click="setLocation(121.5075, 25.042)"
          >
            西門町
          </button>
          <button
            type="button"
            class="btn btn-sm"
            @click="setLocation(121.5645, 25.0339)"
          >
            台北 101 / 信義區
          </button>
        </div>

        <!-- Advanced Filters for Nearby -->
        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">最低乾淨分數</label>
              <select v-model.number="params.minCleanScore" class="form-select">
                <option :value="1">不限 (1分以上)</option>
                <option :value="3">3 分以上 (預設)</option>
                <option :value="4">4 分以上</option>
                <option :value="5">5 分</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">最低便利分數</label>
              <select
                v-model.number="params.minConvenienceScore"
                class="form-select"
              >
                <option :value="1">不限 (1分以上)</option>
                <option :value="3">3 分以上 (預設)</option>
                <option :value="4">4 分以上</option>
                <option :value="5">5 分</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">衛生紙篩選</label>
              <select v-model="params.hasToiletPaper" class="form-select">
                <option :value="undefined">不限</option>
                <option :value="true">僅有衛生紙</option>
                <option :value="false">僅無衛生紙</option>
              </select>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">無障礙篩選</label>
              <select v-model="params.isAccessible" class="form-select">
                <option :value="undefined">不限</option>
                <option :value="true">僅有無障礙</option>
                <option :value="false">僅無無障礙</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '搜尋中...' : '📍 開始推薦附近公廁' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Nearby Results Card -->
    <div class="card">
      <div class="card-title">
        <span>推薦結果 (共 {{ results.length }} 筆)</span>
      </div>

      <div
        v-if="loading"
        style="padding: 24px; text-align: center; color: var(--text-muted)"
      >
        正在計算附近廁所...
      </div>

      <div
        v-else-if="results.length === 0"
        style="
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          border: 1px dashed var(--border-color);
        "
      >
        此半徑與條件範圍內未找到推薦公廁，可嘗試放大半徑或放寬評分門檻。
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 12%">距離</th>
              <th style="width: 25%">廁所名稱 / 地標</th>
              <th style="width: 25%">地址</th>
              <th style="width: 18%">評分</th>
              <th style="width: 20%; text-align: center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in results" :key="t._id || t.id">
              <td>
                <span
                  v-if="t.distance !== undefined"
                  class="badge badge-info"
                  style="font-size: 13px"
                >
                  {{ Math.round(t.distance) }} 公尺
                </span>
                <span v-else class="badge">距離計算中</span>
              </td>
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
              <td style="text-align: center">
                <div class="btn-group">
                  <button
                    class="btn btn-sm"
                    @click="$emit('viewDetail', t._id || t.id)"
                  >
                    詳情
                  </button>
                  <button class="btn btn-sm" @click="$emit('openReviews', t)">
                    評論
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
}>();

const { callApi } = useApi();
const loading = ref(false);
const geoLoading = ref(false);
const results = ref<any[]>([]);

const params = ref({
  lat: 25.033,
  lng: 121.5354,
  radius: 1000,
  minCleanScore: 3,
  minConvenienceScore: 3,
  hasToiletPaper: undefined as boolean | undefined,
  isAccessible: undefined as boolean | undefined,
  limit: 10,
});

const setLocation = (lng: number, lat: number) => {
  params.value.lng = lng;
  params.value.lat = lat;
  fetchNearby();
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('您的瀏覽器不支援地理定位 API');
    return;
  }

  geoLoading.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      geoLoading.value = false;
      params.value.lat = Number(position.coords.latitude.toFixed(6));
      params.value.lng = Number(position.coords.longitude.toFixed(6));
      fetchNearby();
    },
    (err) => {
      geoLoading.value = false;
      alert(`無法取得地理定位: ${err.message}`);
    },
    { enableHighAccuracy: true, timeout: 8000 },
  );
};

const fetchNearby = async () => {
  loading.value = true;

  const query: any = {
    lat: params.value.lat,
    lng: params.value.lng,
    radius: params.value.radius,
    minCleanScore: params.value.minCleanScore,
    minConvenienceScore: params.value.minConvenienceScore,
    limit: params.value.limit,
  };

  if (params.value.hasToiletPaper !== undefined)
    query.hasToiletPaper = params.value.hasToiletPaper;
  if (params.value.isAccessible !== undefined)
    query.isAccessible = params.value.isAccessible;

  const { data, error } = await callApi<any>('/toilets/nearby', {
    params: query,
  });
  loading.value = false;

  if (!error && data) {
    results.value = Array.isArray(data) ? data : data.data || [];
  }
};

onMounted(() => {
  fetchNearby();
});
</script>
