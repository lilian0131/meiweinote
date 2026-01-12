<template>
  <div class="food-card">
    <div class="card-header">
      <div class="dish-list">
        <h3 v-for="(dish, index) in dishNames" :key="index">{{ dish }}</h3>
      </div>
      <span class="shop-name">{{ record.shopName }}</span>
    </div>

    <div class="card-body">
      <div class="info-item">
        <span class="icon">📍</span>
        <span class="text">{{ record.address }}</span>
      </div>

      <div v-if="record.cuisineTags" class="info-item">
        <span class="icon">🍽️</span>
        <span class="text">{{ record.cuisineTags }}</span>
      </div>

      <div v-if="record.regionTags" class="info-item">
        <span class="icon">🌍</span>
        <span class="text">{{ record.regionTags }}</span>
      </div>
    </div>

    <div class="card-footer">
      <span class="date">{{ formatDate(record.createdAt) }}</span>
      <div class="actions">
        <button @click="handleEdit" class="btn-icon btn-edit" title="编辑">
          ✏️
        </button>
        <button @click="handleDelete" class="btn-icon btn-delete" title="删除">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FoodRecord } from '../api';

const props = defineProps<{
  record: FoodRecord;
}>();

const emit = defineEmits<{
  edit: [record: FoodRecord];
  delete: [id: number];
}>();

const dishNames = computed(() => {
  return props.record.dishName ? props.record.dishName.split(',').map(d => d.trim()) : [];
});

const handleEdit = () => {
  emit('edit', props.record);
};

const handleDelete = () => {
  if (props.record.id) {
    emit('delete', props.record.id);
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.food-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  margin-bottom: 16px;
}

.dish-list {
  margin-bottom: 8px;
}

.dish-list h3 {
  color: #333;
  font-size: 1.4rem;
  margin-bottom: 4px;
}

.dish-list h3:last-child {
  margin-bottom: 0;
}

.shop-name {
  color: #667eea;
  font-weight: 600;
  font-size: 0.95rem;
}

.card-body {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #555;
  font-size: 0.95rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.text {
  flex: 1;
  word-break: break-word;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.date {
  color: #999;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-icon:hover {
  transform: scale(1.1);
}

.btn-edit:hover {
  background: #667eea;
}

.btn-delete:hover {
  background: #ff6b6b;
}
</style>
