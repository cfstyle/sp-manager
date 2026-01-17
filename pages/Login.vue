<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
      <div class="bg-blue-600 p-8 text-center">
        <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <Database class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">SP Manager</h1>
        <p class="text-blue-100">企业级存储过程全生命周期管理</p>
      </div>
      
      <div class="p-8">
        <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          class="mb-6"
          :closable="false"
        />

        <el-form :model="loginForm" @submit.prevent="handleSubmit" label-position="top">
          <el-form-item label="用户名">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入您的用户名"
              size="large"
            >
              <template #prefix>
                <User class="w-4 h-4" />
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="密码">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入您的密码"
              size="large"
              show-password
            >
              <template #prefix>
                <Lock class="w-4 h-4" />
              </template>
            </el-input>
          </el-form-item>

          <el-button 
            type="primary" 
            class="w-full !h-12 !rounded-lg text-base font-semibold mt-4" 
            :loading="loading"
            @click="handleSubmit"
          >
            {{ loading ? '登录中...' : '登 录' }}
            <template v-if="!loading" #suffix>
              <ArrowRight class="w-4 h-4 ml-2" />
            </template>
          </el-button>
        </el-form>
        
        <div class="mt-6 text-center text-sm text-gray-500">
          由内部 DevOps 团队提供技术支持
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Database, User, Lock, ArrowRight } from 'lucide-vue-next';
import { api } from '@/services/api';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const loginForm = reactive({
  username: '06700956',
  password: 'Abc@2025'
});

const handleSubmit = async () => {
  if (!loginForm.username || !loginForm.password) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const data = await api.login({ 
      username: loginForm.username, 
      password: loginForm.password 
    });
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      router.push('/');
    } else {
      error.value = '未获取到有效的访问令牌';
    }
  } catch (err: any) {
    error.value = err.message || '连接服务器失败';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  padding-bottom: 4px;
}
:deep(.el-input__wrapper) {
  padding: 8px 12px;
  border-radius: 8px;
}
</style>
