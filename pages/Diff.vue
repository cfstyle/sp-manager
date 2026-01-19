<template>
  <div class="flex flex-col h-[calc(100vh-8rem)]">
    <div class="mb-4 flex items-center justify-between px-2 shrink-0">
      <div class="flex items-center gap-4">
        <el-button circle @click="router.back()">
          <ArrowLeft class="w-5 h-5" />
        </el-button>
        <div>
          <h1 class="text-xl font-bold text-gray-800 flex items-center gap-3">
            版本对比
            <div v-if="diffData" class="flex items-center gap-1 text-sm font-medium bg-gray-100 px-4 py-1.5 rounded-full text-gray-500 italic">
              {{ diffData.v2_summary }} <span class="mx-1">→</span> <span class="text-blue-600 truncate max-w-[300px]">{{ diffData.v1_summary }}</span>
            </div>
          </h1>
        </div>
      </div>
    </div>

    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div class="grid grid-cols-2 bg-gray-50 border-b border-gray-200 text-sm font-bold">
          <!-- 历史版本 - 左侧 - 橙色主题 -->
          <div class="px-4 py-1.5 border-r border-gray-200 bg-orange-50 flex items-center gap-3">
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <span class="text-orange-700 whitespace-nowrap">历史版本</span>
            </div>
            <el-select 
              v-model="selectedV2" 
              placeholder="选择历史版本" 
              size="small"
              class="flex-1"
              @change="handleVersionChange"
            >
              <el-option
                v-for="item in historyList"
                :key="item.id"
                :label="`V${item.version_number} - ${item.change_summary}`"
                :value="item.id"
              >
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs">V{{ item.version_number }}</span>
                  <span class="text-xs text-gray-500 ml-2 truncate max-w-[200px]">{{ item.change_summary }}</span>
                </div>
              </el-option>
            </el-select>
            <el-button type="danger" size="small" plain class="!py-1 shrink-0" @click="handleRollback">
              <RotateCcw class="w-3.5 h-3.5 mr-1" /> 回滚
            </el-button>
          </div>
          <!-- 当前版本 - 右侧 - 蓝色主题 -->
          <div class="px-4 py-1.5 bg-blue-50 flex items-center gap-3">
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span class="text-blue-700 whitespace-nowrap">对比版本</span>
            </div>
            <el-select 
              v-model="selectedV1" 
              placeholder="选择对比版本" 
              size="small"
              class="flex-1"
              @change="handleVersionChange"
            >
              <el-option
                v-for="item in historyList"
                :key="item.id"
                :label="`V${item.version_number} - ${item.change_summary}`"
                :value="item.id"
              >
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs">V{{ item.version_number }}</span>
                  <span class="text-xs text-gray-500 ml-2 truncate max-w-[200px]">{{ item.change_summary }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
      </div>
      <div class="flex-1 relative">
        <div ref="diffContainer" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as monaco from 'monaco-editor';
import { ArrowLeft, RotateCcw } from 'lucide-vue-next';
import { ElMessageBox, ElMessage } from 'element-plus';
import { api } from '@/services/api';
import type { DiffResponse, HistoryItem } from '@/types';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);
const v1 = computed(() => route.params.v1 as string);
const v2 = computed(() => route.params.v2 as string);

const diffContainer = ref<HTMLElement | null>(null);
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null;
const diffData = ref<DiffResponse | null>(null);
const historyList = ref<HistoryItem[]>([]);
const selectedV1 = ref<number>(0);
const selectedV2 = ref<number>(0);

// 加载历史版本列表
const loadHistory = async () => {
  try {
    const data = await api.getHistory({ procedure_id: id.value });
    historyList.value = data.results || [];
    // 初始化选中的版本
    selectedV1.value = parseInt(v1.value);
    selectedV2.value = parseInt(v2.value);
  } catch (err) {
    console.error('加载历史版本失败', err);
  }
};

const loadDiff = async () => {
  if (v1.value && v2.value) {
    try {
      const data = await api.getDiff(v1.value, v2.value);
      diffData.value = data;
      if (diffEditor) {
        // 先获取并销毁旧模型，防止内存泄漏
        const oldModel = diffEditor.getModel();
        if (oldModel) {
          oldModel.original.dispose();
          oldModel.modified.dispose();
        }

        const originalModel = monaco.editor.createModel(data.content_v2, 'sql');
        const modifiedModel = monaco.editor.createModel(data.content_v1, 'sql');
        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      }
    } catch (err) {
      console.error("对比加载失败", err);
      ElMessage.error('对比加载失败');
    }
  }
};

// 处理版本切换
const handleVersionChange = () => {
  if (selectedV1.value && selectedV2.value) {
    router.push(`/diff/${id.value}/${selectedV1.value}/${selectedV2.value}`);
  }
};

// 监听路由变化,重新加载对比
watch([v1, v2], () => {
  loadDiff();
  selectedV1.value = parseInt(v1.value);
  selectedV2.value = parseInt(v2.value);
});

onMounted(() => {
  loadHistory();
  if (diffContainer.value) {
    diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
      theme: 'vs',
      automaticLayout: true,
      originalEditable: false,
      readOnly: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
    });
    loadDiff();
  }
});

onBeforeUnmount(() => {
  if (diffEditor) diffEditor.dispose();
});

const handleRollback = () => {
  if (!id.value || !v2.value) return;
  
  ElMessageBox.confirm(
    `确定要回滚到历史版本 (ID:${v2.value}) 吗？`,
    '回滚确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await api.rollbackProcedure(parseInt(id.value), parseInt(v2.value));
      if (res.flag) {
        ElMessage.success(res.message);
        router.push(`/editor/${id.value}`);
      }
    } catch (err) {
      ElMessage.error("回滚失败");
    }
  }).catch(() => {});
};
</script>

<style scoped>
:deep(.monaco-diff-editor) {
  padding-top: 8px;
}
</style>
