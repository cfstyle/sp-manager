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
      <el-button type="danger" plain @click="handleRollback">
        <RotateCcw class="w-4 h-4 mr-1" /> 回滚至该历史版本
      </el-button>
    </div>

    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div class="grid grid-cols-2 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500">
          <div class="p-3 pl-14 border-r border-gray-200">历史选定版本 (ID: {{ v2 }})</div>
          <div class="p-3 pl-14">当前对比版本 (ID: {{ v1 }})</div>
      </div>
      <div class="flex-1 relative">
        <div ref="diffContainer" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as monaco from 'monaco-editor';
import { ArrowLeft, RotateCcw } from 'lucide-vue-next';
import { ElMessageBox, ElMessage } from 'element-plus';
import { api } from '@/services/api';
import type { DiffResponse } from '@/types';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);
const v1 = computed(() => route.params.v1 as string);
const v2 = computed(() => route.params.v2 as string);

const diffContainer = ref<HTMLElement | null>(null);
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null;
const diffData = ref<DiffResponse | null>(null);

const loadDiff = async () => {
  if (v1.value && v2.value) {
    try {
      const data = await api.getDiff(v1.value, v2.value);
      diffData.value = data;
      if (diffEditor) {
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

onMounted(() => {
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
