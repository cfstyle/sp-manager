<template>
  <div class="max-w-4xl mx-auto py-10">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold text-gray-800 mb-6">存储过程检索</h1>
      <div class="relative max-w-2xl mx-auto group">
        <el-input
          v-model="query"
          placeholder="输入名称、定义或逻辑关键词进行搜索..."
          size="large"
          class="search-input"
          clearable
          @input="handleInput"
        >
          <template #prefix>
            <div :class="['transition-colors', loading ? 'text-blue-500' : 'text-gray-400']">
              <SearchIcon v-if="!loading" class="w-6 h-6" />
              <Loader2 v-else class="w-6 h-6 animate-spin" />
            </div>
          </template>
        </el-input>
      </div>
    </div>

    <div class="space-y-5">
      <template v-if="query">
        <div 
          v-for="item in searchResults" 
          :key="item.id" 
          @click="router.push(`/editor/${item.id}`)"
          class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-lg font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-2">
                <Database class="w-4 h-4 text-gray-400" />
                {{ item.procedure_name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <el-tag size="small" type="info" effect="plain" class="font-mono">{{ item.database_name }}</el-tag>
              </div>
            </div>
            <ArrowRight class="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-all" />
          </div>
          
          <div 
            class="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm font-mono text-gray-600 overflow-hidden line-clamp-3 leading-relaxed"
            v-html="item.highlighted_snippet"
          />
        </div>
        <div v-if="searchResults.length === 0 && !loading" class="text-center py-16 text-gray-500 text-lg">
          未找到匹配的存储过程
        </div>
      </template>

      <template v-else>
        <div>
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">最近更新的存储过程</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="sp in recentProcedures" 
              :key="sp.id"
              @click="router.push(`/editor/${sp.id}`)"
              class="bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-300 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 rounded-lg text-blue-500">
                  <Database class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-bold text-gray-800">{{ sp.procedure_name }}</div>
                  <div class="text-xs text-gray-400 flex items-center gap-1">
                    <Clock class="w-3 h-3" /> {{ new Date(sp.updated_at).toLocaleDateString() }}
                  </div>
                </div>
              </div>
              <div class="text-xs font-mono text-gray-400">{{ sp.database_name }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search as SearchIcon, Database, ArrowRight, Clock, Loader2 } from 'lucide-vue-next';
import { api } from '@/services/api';
import type { SearchResultItem, ProcedureListItem } from '@/types';

const router = useRouter();
const query = ref('');
const searchResults = ref<SearchResultItem[]>([]);
const recentProcedures = ref<ProcedureListItem[]>([]);
const loading = ref(false);

onMounted(async () => {
  try {
    const data = await api.getProcedures(10);
    recentProcedures.value = data.results || [];
  } catch (err) {
    console.error("加载数据失败", err);
  }
});

let timer: any = null;
const handleInput = () => {
  if (timer) clearTimeout(timer);
  if (!query.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  loading.value = true;
  timer = setTimeout(async () => {
    try {
      const data = await api.searchProcedures(query.value);
      searchResults.value = data.results || [];
    } catch (err) {
      console.error("搜索失败", err);
    } finally {
      loading.value = false;
    }
  }, 400);
};
</script>

<style scoped>
.search-input :deep(.el-input__wrapper) {
  padding-left: 24px;
  padding-right: 24px;
  border-radius: 9999px;
  height: 64px;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05);
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.search-input :deep(.el-input__inner) {
  font-size: 1.15rem;
  font-weight: 500;
  color: #1f2937;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
  font-weight: 400;
}
</style>
