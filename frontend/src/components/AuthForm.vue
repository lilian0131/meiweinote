<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>🍽️ 美味记录本</h1>
        <p>{{ isLogin ? '登录你的账户' : '创建新账户' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="username">用户名 *</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="输入用户名"
          />
        </div>

        <div class="form-group">
          <label for="password">密码 *</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            :placeholder="isLogin ? '输入密码' : '密码至少6位'"
            minlength="6"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">确认密码 *</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            required
            placeholder="再次输入密码"
            minlength="6"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          {{ isLogin ? '还没有账户？' : '已有账户？' }}
          <button type="button" @click="toggleMode" class="link-button">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authApi } from '../api';

const emit = defineEmits<{
  success: [token: string, user: { id: number; username: string }];
}>();

const isLogin = ref(true);
const loading = ref(false);
const errorMessage = ref('');

const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  formData.value = {
    username: '',
    password: '',
    confirmPassword: ''
  };
};

const handleSubmit = async () => {
  errorMessage.value = '';
  
  if (!isLogin.value && formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }

  loading.value = true;
  try {
    if (isLogin.value) {
      const response = await authApi.login({
        username: formData.value.username,
        password: formData.value.password
      });
      emit('success', response.data.token, response.data.user);
    } else {
      const response = await authApi.register({
        username: formData.value.username,
        password: formData.value.password
      });
      emit('success', response.data.token, response.data.user);
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || '操作失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

.auth-header p {
  color: #666;
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #555;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
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

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.btn {
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.auth-footer p {
  color: #666;
  font-size: 0.95rem;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.link-button:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
