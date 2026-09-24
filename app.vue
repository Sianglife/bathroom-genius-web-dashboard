<template>
  <div>
    <!-- Header with Health Status -->
    <Header />

    <main class="container">
      <!-- Main Tabs Navigation -->
      <nav class="nav-tabs">
        <button
          :class="['nav-tab-btn', currentTab === 'list' ? 'active' : '']"
          @click="currentTab = 'list'"
        >
          📋 廁所列表與查詢 (GET /api/toilets)
        </button>
        <button
          :class="['nav-tab-btn', currentTab === 'nearby' ? 'active' : '']"
          @click="currentTab = 'nearby'"
        >
          📍 附近推薦 (GET /api/toilets/nearby)
        </button>
        <button class="nav-tab-btn" @click="openAddToilet">
          ➕ 新增廁所 (POST /api/toilets)
        </button>
      </nav>

      <!-- Tab Content -->
      <div v-show="currentTab === 'list'">
        <ToiletList
          ref="toiletListRef"
          @view-detail="openDetail"
          @open-reviews="openReviews"
          @edit-toilet="openEditToilet"
          @add-new="openAddToilet"
        />
      </div>

      <div v-show="currentTab === 'nearby'">
        <NearbyFinder @view-detail="openDetail" @open-reviews="openReviews" />
      </div>

      <!-- Live API Debug Console -->
      <ApiConsole />
    </main>

    <!-- Modals -->
    <ToiletDetailModal
      v-model="showDetailModal"
      :toilet-id="selectedToiletId"
      @open-reviews="openReviews"
      @edit-toilet="openEditToilet"
      @toilet-deleted="onToiletDeleted"
    />

    <ToiletFormModal
      v-model="showFormModal"
      :toilet-data="editingToiletData"
      @saved="onToiletSaved"
    />

    <ReviewModal
      v-model="showReviewModal"
      :toilet="selectedToiletForReview"
      @review-changed="onReviewChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentTab = ref<'list' | 'nearby'>('list');
const toiletListRef = ref<any>(null);

// Detail Modal state
const showDetailModal = ref(false);
const selectedToiletId = ref<string>('');

// Form Modal state (Add / Edit)
const showFormModal = ref(false);
const editingToiletData = ref<any>(null);

// Review Modal state
const showReviewModal = ref(false);
const selectedToiletForReview = ref<any>(null);

const openDetail = (id: string) => {
  selectedToiletId.value = id;
  showDetailModal.value = true;
};

const openAddToilet = () => {
  editingToiletData.value = null;
  showFormModal.value = true;
};

const openEditToilet = (toilet: any) => {
  editingToiletData.value = toilet;
  showFormModal.value = true;
};

const openReviews = (toilet: any) => {
  selectedToiletForReview.value = toilet;
  showReviewModal.value = true;
};

const onToiletSaved = () => {
  if (toiletListRef.value?.fetchData) {
    toiletListRef.value.fetchData();
  }
};

const onToiletDeleted = () => {
  if (toiletListRef.value?.fetchData) {
    toiletListRef.value.fetchData();
  }
};

const onReviewChanged = () => {
  if (toiletListRef.value?.fetchData) {
    toiletListRef.value.fetchData();
  }
};
</script>
