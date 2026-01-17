<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        近期活动记录
        <el-tag type="info" effect="plain" round class="hidden sm:inline-block font-normal">系统全库日志</el-tag>
      </h1>
      
      <el-radio-group v-model="filter" size="large" @change="handleFilterChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="mine">
          <User class="w-4 h-4 mr-1 inline-block" />我的
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- Infinite Scroll Container -->
    <div 
      v-infinite-scroll="loadMore" 
      :infinite-scroll-disabled="disabled"
      :infinite-scroll-distance="30"
      :infinite-scroll-immediate="false"
      class="relative border-l-2 border-gray-200 ml-4 space-y-6"
    >
      <div v-for="log in filteredActivities" :key="log.id" class="relative pl-8 group">
        <!-- Timeline dot -->
        <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300 group-hover:border-blue-500 transition-colors"></div>
        
        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div :class="['p-2 rounded-lg', log.is_rollback ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500']">
                <RotateCcw v-if="log.is_rollback" class="w-5 h-5" />
                <Edit3 v-else class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-gray-800 flex items-center gap-2">
                  {{ log.procedure_name }}
                  <el-tag size="small" type="info" effect="plain" class="font-mono">{{ log.database_name }}</el-tag>
                </h3>
                <div class="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span class="flex items-center gap-1 font-medium text-gray-700">
                    <User class="w-3 h-3" /> {{ log.modified_by_name }}
                  </span>
                  <span class="flex items-center gap-1">
                    <Clock class="w-3 h-3" /> {{ new Date(log.modified_at).toLocaleString() }}
                  </span>
                  <el-tag size="small" type="info" class="font-bold h-4 px-1 !leading-3 text-[10px]">V{{ log.version_number }}</el-tag>
                </div>
              </div>
            </div>
            <el-button 
              link 
              @click="router.push(`/editor/${log.procedure_id}`)"
              class="text-gray-400 hover:!text-blue-600"
            >
              <ArrowRight class="w-5 h-5" />
            </el-button>
          </div>
          
          <el-popover
            placement="top"
            :width="420"
            trigger="hover"
            :show-after="300"
          >
            <template #reference>
              <div 
                @click="handleDiffClick(log)"
                :class="[
                  'text-sm p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                  log.is_rollback 
                    ? 'bg-orange-50/50 border-orange-100 text-orange-800 hover:bg-orange-100' 
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200'
                ]"
              >
                <div class="flex items-center justify-between">
                    <span class="line-clamp-2">{{ log.change_summary }}</span>
                    <ExternalLink class="w-3.5 h-3.5 opacity-50 shrink-0 ml-4" />
                </div>
              </div>
            </template>
            <div class="p-1">
              <div class="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <FileText class="w-4 h-4 text-blue-500" />
                <span class="font-bold text-gray-800">全量变更说明</span>
              </div>
              <div class="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                {{ log.change_summary }}
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      
      <!-- Loading & Empty States -->
      <div v-if="loading" class="pl-8 py-4 flex items-center gap-2 text-blue-500 font-medium">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span>正在同步云端日志...</span>
      </div>
      <div v-if="noMore && activities.length > 0" class="pl-8 py-6 text-center text-gray-400 text-sm italic">
        — 已经到底啦，仅展示最近半年的活跃记录 —
      </div>
      <div v-if="!loading && activities.length === 0" class="pl-8 py-4 text-gray-400">暂无活动记录</div>
      <div v-if="!loading && activities.length > 0 && filteredActivities.length === 0" class="pl-8 py-10 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
        没有找到与您相关的活动记录
      </div>
    </div>

    <!-- Back to Top -->
    <el-backtop :right="40" :bottom="40">
      <div class="w-full h-full bg-blue-600 rounded-full flex items-center justify-center shadow-lg text-white hover:bg-blue-700 transition-colors">
        <ChevronUp class="w-6 h-6" />
      </div>
    </el-backtop>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { User, Clock, Edit3, RotateCcw, ArrowRight, ExternalLink, Loader2, ChevronUp } from 'lucide-vue-next';
import { api } from '@/services/api';
import { CURRENT_USER } from '@/constants';
import type { HistoryItem } from '@/types';

const router = useRouter();
const activities = ref<HistoryItem[]>([]);
const loading = ref(false);
const noMore = ref(false);
const filter = ref<'all' | 'mine'>('all');

const offset = ref(0);
const pageSize = 10;

const disabled = computed(() => loading.value || noMore.value);

const fetchActivities = async (isLoadMore = false) => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    const data = await api.getHistory({ 
      limit: pageSize, 
      offset: offset.value 
    });
    
    const results = data.results || [];
    if (isLoadMore) {
      activities.value = [...activities.value, ...results];
    } else {
      activities.value = results;
    }
    
    // In real API, we'd check if results.length < pageSize or data.next is null
    // Here we simulate no more data after 30 items for demonstration
    if (results.length < pageSize || activities.value.length >= 30) {
      noMore.value = true;
    }
    
    offset.value += pageSize;
  } catch (err) {
    console.error("加载活动失败", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchActivities();
});

const loadMore = () => {
  fetchActivities(true);
};

const handleFilterChange = () => {
  // When filter changes, we might want to reset or just filter existing
  // For simplicity here, we just keep existing data and let computed handles it
};

const filteredActivities = computed(() => {
  return activities.value.filter(log => {
    if (filter.value === 'mine') {
      return log.modified_by_name === CURRENT_USER.name;
    }
    return true;
  });
});

const handleDiffClick = (log: HistoryItem) => {
  if (!log.procedure_id) return;
  const prevId = log.id - 1; 
  router.push(`/diff/${log.procedure_id}/${log.id}/${prevId}`);
};
</script>

<style scoped>
:deep(.el-radio-button__inner) {
  padding: 8px 20px;
}

/* Ensure backtop is on top of other elements */
:deep(.el-backtop) {
  z-index: 100;
}
</style>
