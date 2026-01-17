<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="container mx-auto px-6 h-16 flex items-center justify-between">
        <!-- Left: Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
          <div class="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Database class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold text-gray-800 tracking-tight">存储过程管理平台</span>
        </div>

        <!-- Center: Navigation Tabs -->
        <nav class="hidden md:flex items-center gap-2">
          <router-link 
            v-for="item in navItems" 
            :key="item.path" 
            :to="item.path" 
            custom
            v-slot="{ isActive, isExactActive, navigate }"
          >
            <button
              @click="navigate"
              :class="[
                'flex items-center gap-2 px-5 py-2.5 rounded-md transition-colors text-base font-medium',
                (item.path === '/' ? isExactActive : isActive)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </button>
          </router-link>
        </nav>

        <!-- Right: User Profile & Actions -->
        <div class="flex items-center gap-4">
          <el-button 
            type="primary" 
            class="hidden sm:flex" 
            @click="router.push('/new')"
          >
            <Plus class="w-4 h-4 mr-1" />
            新建
          </el-button>

          <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="text-right hidden sm:block">
              <p class="text-base font-semibold text-gray-800 leading-none">{{ CURRENT_USER.name }}</p>
              <p class="text-sm text-gray-500 mt-1">管理员</p>
            </div>
            <el-avatar :size="40" :src="CURRENT_USER.avatar" class="border border-gray-300" />
            <el-button 
              link 
              type="info" 
              class="!p-2 hover:!text-red-500 transition-colors"
              title="退出登录"
              @click="handleLogout"
            >
              <LogOut class="w-6 h-6" />
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main :class="['flex-1 py-8', isFullWidthPage ? 'w-full px-4' : 'container mx-auto px-6']">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Database, 
  Search, 
  LayoutDashboard, 
  Activity, 
  Plus, 
  LogOut, 
  FolderGit2 
} from 'lucide-vue-next';
import { CURRENT_USER } from '@/constants';

const router = useRouter();
const route = useRoute();

const navItems = [
  { path: '/', label: '检索', icon: Search },
  { path: '/my-procedures', label: '我的代码', icon: FolderGit2 },
  { path: '/dashboard', label: '统计看板', icon: LayoutDashboard },
  { path: '/activity', label: '近期活动', icon: Activity },
];

const handleLogout = () => {
  localStorage.removeItem('access_token');
  router.push('/login');
};

const isFullWidthPage = computed(() => {
  return route.path.startsWith('/editor') || route.path.startsWith('/diff') || route.path.startsWith('/new');
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
