<template>
  <form @submit.prevent="handleSubmit" class="food-form">
    <h2>{{ isEditing ? '编辑记录' : '添加新记录' }}</h2>
    
    <div class="form-group">
      <label for="shopName">店名 *</label>
      <input
        id="shopName"
        v-model="formData.shopName"
        type="text"
        required
        placeholder="输入餐厅名称"
      />
    </div>

    <div class="form-group">
      <label for="address">地址 *</label>
      <input
        id="address"
        v-model="formData.address"
        type="text"
        required
        placeholder="输入餐厅地址"
      />
    </div>

    <div class="form-group">
      <label>菜名 *</label>
      <div class="dish-inputs">
        <div v-for="(dish, index) in dishNames" :key="index" class="dish-input-row">
          <input
            v-model="dishNames[index]"
            type="text"
            required
            placeholder="输入菜名"
            class="dish-input"
          />
          <button 
            v-if="dishNames.length > 1"
            type="button" 
            @click="removeDish(index)"
            class="btn-remove"
            title="删除"
          >
            ✕
          </button>
        </div>
        <button type="button" @click="addDish" class="btn-add">
          + 添加菜名
        </button>
      </div>
    </div>

    <div class="form-group">
      <label for="cuisineTags">菜系标签</label>
      <input
        id="cuisineTags"
        v-model="formData.cuisineTags"
        type="text"
        placeholder="例如：川菜、粤菜、日料"
      />
    </div>

    <div class="form-group">
      <label for="regionTags">地域标签</label>
      <input
        id="regionTags"
        v-model="formData.regionTags"
        type="text"
        placeholder="例如：成都、广州、东京"
      />
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? '更新' : '添加' }}
      </button>
      <button v-if="isEditing" type="button" @click="handleCancel" class="btn btn-secondary">
        取消
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FoodRecord } from '../api';

const props = defineProps<{
  record: FoodRecord | null;
}>();

const emit = defineEmits<{
  submit: [data: FoodRecord];
  cancel: [];
  reset: [];
}>();

const formData = ref<FoodRecord>({
  shopName: '',
  address: '',
  dishName: '',
  cuisineTags: '',
  regionTags: ''
});

const dishNames = ref<string[]>(['']);

const isEditing = computed(() => !!props.record?.id);

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    formData.value = { ...newRecord };
    dishNames.value = newRecord.dishName ? newRecord.dishName.split(',').map(d => d.trim()) : [''];
  } else {
    formData.value = {
      shopName: '',
      address: '',
      dishName: '',
      cuisineTags: '',
      regionTags: ''
    };
    dishNames.value = [''];
  }
}, { immediate: true });

const addDish = () => {
  dishNames.value.push('');
};

const removeDish = (index: number) => {
  dishNames.value.splice(index, 1);
};

const handleSubmit = () => {
  const validDishes = dishNames.value.filter(d => d.trim());
  if (validDishes.length === 0) {
    alert('请至少输入一个菜名');
    return;
  }
  
  formData.value.dishName = validDishes.join(', ');
  emit('submit', formData.value);
};

const handleCancel = () => {
  emit('cancel');
};

const resetForm = () => {
  formData.value = {
    shopName: '',
    address: '',
    dishName: '',
    cuisineTags: '',
    regionTags: ''
  };
  dishNames.value = [''];
};

defineExpose({
  resetForm
});
</script>

<style scoped>
.food-form {
  max-width: 600px;
  margin: 0 auto;
}

.food-form h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.dish-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dish-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dish-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.dish-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-remove {
  width: 44px;
  height: 44px;
  border: 2px solid #ff6b6b;
  background: white;
  color: #ff6b6b;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #ff6b6b;
  color: white;
}

.btn-add {
  padding: 12px 20px;
  border: 2px dashed #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add:hover {
  background: #667eea;
  color: white;
  border-style: solid;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
