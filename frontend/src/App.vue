<template>
  <div v-if="!isAuthenticated" class="auth-page">
    <AuthForm @success="handleAuthSuccess" />
  </div>

  <div v-else class="app">
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <h1>🍽️ 美味记录本</h1>
          <p>记录你的美食体验</p>
        </div>
        <div class="user-info">
          <span class="username">{{ user?.username }}</span>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
      </div>
    </header>

    <div class="container">
      <div class="form-section">
        <FoodForm 
          ref="foodFormRef"
          :record="editingRecord" 
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>

      <div class="records-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索店名、菜名或标签..."
            class="search-input"
          />
        </div>

        <div v-if="loading" class="loading">
          加载中...
        </div>

        <div v-else-if="filteredRecords.length === 0" class="empty">
          {{ searchQuery ? '没有找到匹配的记录' : '还没有记录，快来添加吧！' }}
        </div>

        <div v-else class="records-grid">
          <FoodCard
            v-for="record in filteredRecords"
            :key="record.id"
            :record="record"
            @edit="handleEdit"
            @delete="handleDeleteClick"
          />
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="showDeleteDialog"
      title="确认删除"
      message="确定要删除这条记录吗？删除后无法恢复。"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />

    <Toast :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import FoodForm from './components/FoodForm.vue';
import FoodCard from './components/FoodCard.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import Toast from './components/Toast.vue';
import AuthForm from './components/AuthForm.vue';
import { foodApi, FoodRecord } from './api';
import { useToast } from './composables/useToast';
import { useAuth } from './composables/useAuth';

const records = ref<FoodRecord[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const editingRecord = ref<FoodRecord | null>(null);
const showDeleteDialog = ref(false);
const deleteId = ref<number | null>(null);
const foodFormRef = ref<{ resetForm: () => void } | null>(null);

const { toasts, success, error, removeToast } = useToast();
const { token, user, isAuthenticated, setAuth, clearAuth } = useAuth();

const filteredRecords = computed(() => {
  if (!searchQuery.value) return records.value;
  
  const query = searchQuery.value.toLowerCase();
  return records.value.filter(record => 
    record.shopName.toLowerCase().includes(query) ||
    record.dishName.toLowerCase().includes(query) ||
    record.cuisineTags.toLowerCase().includes(query) ||
    record.regionTags.toLowerCase().includes(query) ||
    record.address.toLowerCase().includes(query)
  );
});

const handleAuthSuccess = (newToken: string, newUser: { id: number; username: string }) => {
  setAuth(newToken, newUser);
  loadRecords();
};

const handleLogout = () => {
  clearAuth();
  records.value = [];
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const response = await foodApi.getAll();
    records.value = response.data;
  } catch (err) {
    console.error('加载记录失败:', err);
    error('加载记录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (data: FoodRecord) => {
  try {
    if (editingRecord.value?.id) {
      await foodApi.update(editingRecord.value.id, data);
      success('记录更新成功！', '操作成功');
    } else {
      await foodApi.create(data);
      success('记录添加成功！', '操作成功');
      foodFormRef.value?.resetForm();
    }
    editingRecord.value = null;
    await loadRecords();
  } catch (err) {
    console.error('保存记录失败:', err);
    error('保存记录失败，请稍后重试', '操作失败');
  }
};

const handleEdit = (record: FoodRecord) => {
  editingRecord.value = { ...record };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleCancel = () => {
  editingRecord.value = null;
};

const handleDeleteClick = (id: number) => {
  deleteId.value = id;
  showDeleteDialog.value = true;
};

const handleDeleteConfirm = async () => {
  if (deleteId.value !== null) {
    try {
      await foodApi.delete(deleteId.value);
      success('记录删除成功！', '操作成功');
      await loadRecords();
    } catch (err) {
      console.error('删除记录失败:', err);
      error('删除记录失败，请稍后重试', '操作失败');
    } finally {
      showDeleteDialog.value = false;
      deleteId.value = null;
    }
  }
};

const handleDeleteCancel = () => {
  showDeleteDialog.value = false;
  deleteId.value = null;
};

onMounted(() => {
  if (isAuthenticated.value) {
    loadRecords();
  }
});
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  padding: 20px;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-title {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.header-title h1 {
  font-size: 1.8rem;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title p {
  font-size: 0.95rem;
  margin: 0;
  opacity: 0.95;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.username {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  word-break: break-word;
}

.logout-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  word-break: break-word;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 10px;
}

.form-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.records-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 3px rgba(102, 126, 234, 0.1);
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.1rem;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
  }

  .user-info {
    flex-direction: column;
    gap: 8px;
  }

  .container {
    gap: 20px;
  }

  .form-section,
  .records-section {
    padding: 20px;
  }

  .records-grid {
    grid-template-columns: 1fr;
  }
}
</style>
