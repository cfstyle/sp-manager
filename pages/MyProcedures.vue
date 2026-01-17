<template>
  <div class="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FolderOpen class="w-7 h-7 text-blue-600" />
          我的存储过程
        </h1>
        <div class="flex items-center gap-2 mt-1">
           <p class="text-gray-500 text-sm">管理您负责或创建的数据库程序资产</p>
           <el-tag size="small" type="info" round>{{ totalCount }} 个项目</el-tag>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <el-radio-group v-model="statusFilter" size="large" @change="handleFilterChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="archived">已归档</el-radio-button>
        </el-radio-group>
        
        <el-button type="primary" size="large" @click="router.push('/new')">
          <Plus class="w-4 h-4 mr-1" />
          新建过程
        </el-button>
      </div>
    </div>

    <div class="flex-1">
        <el-skeleton v-if="loading && page === 1" :rows="5" animated />
        
        <div v-else-if="procedures.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">暂无数据</h3>
            <p class="text-gray-500 mb-6">您目前没有处于此状态的存储过程。</p>
            <el-button v-if="statusFilter === 'all'" type="primary" plain @click="router.push('/new')">立即创建</el-button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Only show "Create Shortcut" on the first page of "All" -->
            <div 
               v-if="page === 1 && statusFilter === 'all'"
               @click="router.push('/new')"
               class="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group min-h-[160px]"
            >
                <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus class="w-6 h-6 text-blue-500" />
                </div>
                <h3 class="font-semibold text-gray-700 group-hover:text-blue-600">新建存储过程</h3>
            </div>

            <div 
               v-for="item in procedures" 
               :key="item.id"
               @click="router.push(`/editor/${item.id}`)"
               class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
            >
                <div class="absolute top-0 right-0 p-3">
                  <ArrowRight class="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                        <el-tag size="small" effect="plain" class="font-mono">
                          {{ item.database_name }}
                        </el-tag>
                        <el-tag v-if="!item.is_active" size="small" type="info">已归档</el-tag>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 truncate pr-6" :title="item.procedure_name">
                        {{ item.procedure_name }}
                    </h3>
                </div>

                <p class="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {{ item.description || "暂无描述信息..." }}
                </p>

                <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <div class="flex items-center gap-1.5">
                        <User class="w-3.5 h-3.5" />
                        {{ item.owner }}
                    </div>
                    <div class="flex items-center gap-1.5">
                        <Clock class="w-3.5 h-3.5" />
                        {{ new Date(item.updated_at).toLocaleDateString() }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center shrink-0 py-4">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="totalCount"
        background
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { FolderOpen, Database, ArrowRight, User, Clock, Plus } from 'lucide-vue-next';
import { api } from '@/services/api';
import { CURRENT_USER } from '@/constants';
import type { ProcedureListItem } from '@/types';

const router = useRouter();
const procedures = ref<ProcedureListItem[]>([]);
const loading = ref(true);
const totalCount = ref(0);
const page = ref(1);
const pageSize = 9;
const statusFilter = ref<'all' | 'archived'>('all');

const fetchMyProcedures = async () => {
  try {
    loading.value = true;
    const offset = (page.value - 1) * pageSize;
    
    // Fetch all for current user
    const data = await api.getProcedures(100, 0, CURRENT_USER.username);
    let results = data.results || [];
    
    // Client-side filtering for simplicity in this demo
    if (statusFilter.value === 'archived') {
      results = results.filter(p => !p.is_active);
    }
    
    totalCount.value = results.length;
    procedures.value = results.slice(offset, offset + pageSize);
    
  } catch (err) {
    console.error("Failed to load my procedures", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMyProcedures);

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize));

const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchMyProcedures();
};

const handleFilterChange = () => {
  page.value = 1;
  fetchMyProcedures();
};
</script>

<style scoped>
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #2563eb;
}
</style>
