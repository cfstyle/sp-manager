<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
    <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      <!-- Banner for Viewing History -->
      <div v-if="viewingVersion && !isCreating" class="bg-amber-50 px-5 py-2 border-b border-amber-200 text-amber-800 text-sm flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Clock class="w-4 h-4" />
          <span>正在查看历史版本 <strong>V{{ viewingVersion.version_number }}</strong> - 只读模式</span>
        </div>
        <el-button size="small" @click="handleBackToLatest">
          <ArrowLeft class="w-3 h-3 mr-1" /> 返回最新版本
        </el-button>
      </div>

      <!-- Toolbar Header -->
      <div class="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 h-16">
        <div class="flex items-center gap-4 overflow-hidden">
          <div class="flex items-center gap-3 shrink-0">
            <FileCode :class="['w-5 h-5', isCreating ? 'text-blue-600' : 'text-gray-600']" />
            <span class="text-lg font-bold text-gray-800 tracking-tight">{{ isCreating ? '新建过程' : '编辑过程' }}</span>
          </div>
          
          <div class="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-300">
            <div class="flex items-center px-4 py-1.5 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
              <div class="flex items-center gap-2 text-sm font-mono text-gray-500 mr-3 border-r border-gray-300 pr-3">
                <Database class="w-4 h-4" />
                <span>{{ parsedDb || '默认库' }}</span>
              </div>
              <div class="flex items-center gap-2 text-lg font-bold font-mono text-blue-600 mr-2 tracking-tight">
                <Terminal class="w-5 h-5" />
                <span>{{ parsedName || '未识别名称' }}</span>
              </div>
              <el-button 
                link 
                type="primary" 
                class="!p-0 ml-1 hover:text-blue-700"
                title="复制完整名称 (DB.Name)"
                @click="handleCopyIdentifier"
              >
                <Copy class="w-4 h-4" />
              </el-button>
            </div>
            
            <el-tag v-if="!isCreating && isDirty && !viewingVersion" type="warning" effect="dark" class="animate-pulse ml-2 px-3 !h-8 text-sm">
              未保存修改
            </el-tag>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <div class="hidden sm:flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 text-sm shadow-sm ring-1 ring-gray-100">
            <UserIcon class="w-4 h-4 text-gray-400" />
            <span class="font-bold">{{ isCreating ? CURRENT_USER.name : (detail?.creator || 'Unknown') }}</span>
          </div>

          <el-button v-if="isCreating" @click="router.back()">取消</el-button>
          
          <el-button 
            v-if="!viewingVersion"
            type="primary" 
            :loading="submitting"
            :disabled="(isCreating && !parsedName) || (!isCreating && !isDirty)"
            @click="handleSaveClick"
          >
             <Save v-if="!submitting" class="w-4 h-4 mr-1" />
             <Loader2 v-else class="w-4 h-4 mr-1 animate-spin" />
            {{ isCreating ? '立即创建' : '保存变更' }}
          </el-button>
        </div>
      </div>

      <!-- Metadata Bar (Description) -->
      <div class="px-5 py-2.5 bg-white border-b border-gray-100 flex items-center gap-4 shrink-0 transition-all">
        <div class="flex items-center gap-2 text-gray-400 shrink-0">
          <Info class="w-4 h-4" />
          <span class="text-xs font-bold uppercase tracking-wider">业务描述</span>
        </div>
        <div class="flex-1">
          <el-input
            v-model="procedureDescription"
            placeholder="请输入该存储过程的业务定义和用途说明 (必填)..."
            size="small"
            class="description-input"
            :prefix-icon="FileText"
            :readonly="!!viewingVersion"
          />
        </div>
      </div>
      
      <!-- Monaco Editor Container -->
      <div class="flex-1 relative group">
        <el-button
          class="absolute top-4 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          size="small"
          @click="handleCopy"
        >
          <Copy class="w-3.5 h-3.5 mr-1" />复制
        </el-button>
        <div ref="editorContainer" class="w-full h-full"></div>
      </div>
    </div>

    <!-- Sidebar - History -->
    <div v-if="!isCreating" class="w-full md:w-80 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
      <div class="px-5 py-4 border-b border-gray-200 bg-gray-50 shrink-0 h-16 flex items-center">
        <h3 class="font-semibold text-gray-700 flex items-center gap-2 text-base">
          <GitBranch class="w-5 h-5" />历史记录
        </h3>
      </div>
      <div class="flex-1 overflow-y-auto p-3 space-y-3">
        <div v-if="history.length === 0" class="text-center text-gray-400 py-10 text-sm">暂无历史记录</div>
        <el-popover
          v-for="(ver, idx) in history" 
          :key="ver.id"
          placement="left"
          :width="350"
          trigger="hover"
          :show-after="300"
          popper-class="history-popover"
        >
          <template #reference>
            <div 
              @click="idx === 0 ? handleBackToLatest() : handleViewVersion(ver)"
              :class="[
                'p-4 rounded-lg border relative cursor-pointer transition-all',
                (viewingVersion ? viewingVersion.id === ver.id : idx === 0) 
                  ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-200' 
                  : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
              ]"
            >
              <div class="flex justify-between items-start mb-1">
                <span :class="['font-bold', (viewingVersion ? viewingVersion.id === ver.id : idx === 0) ? 'text-blue-700' : 'text-gray-700']">V{{ ver.version_number }}</span>
                <span class="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock class="w-3 h-3" /> {{ new Date(ver.modified_at).toLocaleDateString() }}</span>
              </div>
              <p class="text-xs text-gray-500 mb-2 italic line-clamp-2">"{{ ver.change_summary }}"</p>
              <div class="flex items-center justify-between text-[11px] text-gray-400">
                <span class="flex items-center gap-1"><UserIcon class="w-3 h-3" />{{ ver.modified_by_name }}</span>
                <el-button 
                  v-if="idx !== 0" 
                  link 
                  type="primary" 
                  size="small" 
                  class="!p-0"
                  @click.stop="handleCompare(history[0].id, ver.id)"
                >
                  <Split class="w-3 h-3 mr-1" />对比
                </el-button>
                <el-tag v-if="idx === 0" type="success" size="small" effect="plain" class="!px-1 !h-4 text-[10px]">Latest</el-tag>
              </div>
            </div>
          </template>
          <div class="p-1 text-sm leading-relaxed text-gray-700">
            <div class="font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <FileText class="w-4 h-4 text-blue-500" />
              变更详情
            </div>
            {{ ver.change_summary }}
          </div>
        </el-popover>
      </div>
    </div>

    <!-- Save Modal -->
    <el-dialog
      v-model="showSaveModal"
      title="保存变更"
      width="400px"
      @closed="saveError = null"
    >
      <el-form label-position="top">
        <el-form-item label="变更说明 (Change Summary)" required>
          <el-input
            v-model="summary"
            type="textarea"
            :rows="4"
            placeholder="请输入修改内容的简要说明 (必填)..."
          />
        </el-form-item>
        
        <div v-if="detail && parsedName && (parsedName.toLowerCase() !== detail.procedure_name.toLowerCase() || (parsedDb && parsedDb.toLowerCase() !== detail.database_name.toLowerCase()))" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <div>
                <strong>检测到定义变更：</strong> 系统将自动在提交说明后追加标识符变更记录。
            </div>
        </div>

        <el-alert
          v-if="saveError"
          :title="saveError"
          type="error"
          class="mt-4"
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="showSaveModal = false">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="!summary.trim() || !procedureDescription.trim()" @click="confirmUpdate">
          确认保存
        </el-button>
      </template>
    </el-dialog>

    <!-- Create Modal (For mandatory description) -->
    <el-dialog
      v-model="showCreateModal"
      title="新建存储过程"
      width="450px"
    >
      <div class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
           <div class="flex items-center gap-2 text-blue-800 font-bold mb-1">
             <Info class="w-4 h-4" />
             确认基本信息
           </div>
           <p class="text-xs text-blue-600">系统已从代码中识别到以下标识符：</p>
           <div class="mt-3 font-mono text-sm bg-white p-2 border border-blue-200 rounded text-blue-700">
             {{ parsedDb || 'db2admin' }}.{{ parsedName || '未识别' }}
           </div>
        </div>

        <el-form label-position="top">
          <el-form-item label="存储过程业务描述" required>
            <el-input
              v-model="procedureDescription"
              type="textarea"
              :rows="4"
              placeholder="请输入存储过程的功能描述、业务逻辑说明等，此项为必填项。"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="!procedureDescription.trim() || !parsedName" @click="confirmCreate">
          立即提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as monaco from 'monaco-editor';
import { 
  FileCode, Terminal, Database, User as UserIcon, Clock, ArrowLeft, Save, Loader2, 
  Copy, GitBranch, Split, AlertCircle, Check, X, FileText, Info 
} from 'lucide-vue-next';
import { ElMessage } from 'element-plus';
import { api } from '@/services/api';
import { CURRENT_USER } from '@/constants';
import type { ProcedureDetail, HistoryItem } from '@/types';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);
const isCreating = computed(() => !id.value);

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

const code = ref('');
const isDirty = ref(false);
const loading = ref(!isCreating.value);
const submitting = ref(false);
const detail = ref<ProcedureDetail | null>(null);
const history = ref<HistoryItem[]>([]);
const viewingVersion = ref<HistoryItem | null>(null);
const showSaveModal = ref(false);
const showCreateModal = ref(false);
const summary = ref('');
const procedureDescription = ref('');
const saveError = ref<string | null>(null);

const DEFAULT_TEMPLATE = `-- 请输入存储过程定义
-- 系统将自动识别名称和数据库
CREATE OR REPLACE PROCEDURE db2admin.new_procedure
(
    -- Add parameters here
    -- IN p_id INT
)
LANGUAGE SQL
BEGIN
    -- Business logic here
END;`;

// Dynamic Parsing Stats
const parsedName = ref('');
const parsedDb = ref('');

watch(code, (newCode) => {
  const regex = /CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(?:(\w+)\.)?(\w+)/i;
  const match = newCode.match(regex);
  if (match) {
    parsedDb.value = match[1] || 'db2admin';
    parsedName.value = match[2];
  } else {
    parsedDb.value = '';
    parsedName.value = '';
  }
});

const loadData = async () => {
  // Reset states before loading
  viewingVersion.value = null;
  isDirty.value = false;
  summary.value = '';
  
  if (isCreating.value) {
    code.value = DEFAULT_TEMPLATE;
    procedureDescription.value = '';
    loading.value = false;
    nextTick(() => {
      if (editor) {
        editor.setValue(DEFAULT_TEMPLATE);
        editor.updateOptions({ readOnly: false });
      }
    });
  } else {
    try {
      loading.value = true;
      const detailData = await api.getProcedureDetail(id.value);
      detail.value = detailData;
      code.value = detailData.latest_content || '';
      procedureDescription.value = detailData.description || '';
      
      const historyData = await api.getHistory({ procedure_id: id.value });
      history.value = historyData.results || [];
    } catch (err: any) {
      ElMessage.error(err.message || '加载失败');
    } finally {
      loading.value = false;
      nextTick(() => {
        if (editor) {
          editor.setValue(code.value);
          editor.updateOptions({ readOnly: false });
        }
      });
    }
  }
};

// Watch for route changes (e.g., from /editor/123 to /editor)
watch(id, () => {
  loadData();
});

onMounted(() => {
  loadData();
  
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: code.value,
      language: 'sql',
      theme: 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
    });

    let isInitialLoad = true;
    editor.onDidChangeModelContent(() => {
      const newValue = editor?.getValue() || '';
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }
      code.value = newValue;
      if (!isCreating.value && !viewingVersion.value) {
        isDirty.value = true;
      }
    });
  }
});

onBeforeUnmount(() => {
  if (editor) editor.dispose();
});

const handleSaveClick = () => {
  if (isCreating.value) {
    if (!parsedName.value) {
      ElMessage.warning('无法识别存储过程名称,请先在代码中定义');
      return;
    }
    showCreateModal.value = true;
  } else {
    if (!procedureDescription.value.trim()) {
      ElMessage.warning('业务描述不能为空,请先填写业务描述');
      return;
    }
    showSaveModal.value = true;
  }
};

const confirmCreate = () => {
  if (!procedureDescription.value.trim()) {
    ElMessage.warning('业务描述不能为空');
    return;
  }
  handleCreate();
};

const handleCreate = async () => {
  if (!parsedName.value) {
    ElMessage.warning('无法识别存储过程名称，请检查代码');
    return;
  }
  submitting.value = true;
  try {
    const response = await api.createProcedure({
      name: parsedName.value,
      db: parsedDb.value || 'db2admin',
      owner: CURRENT_USER.username,
      content: code.value,
      description: procedureDescription.value
    });
    if (response.flag) {
      ElMessage.success('创建成功');
      showCreateModal.value = false;
      router.replace(`/editor/${response.id}`);
    } else {
      ElMessage.error(response.message || '创建失败');
    }
  } catch (err: any) {
    ElMessage.error(err.message || '系统错误');
  } finally {
    submitting.value = false;
  }
};

const confirmUpdate = async () => {
  if (!detail.value || !summary.value.trim() || !procedureDescription.value.trim()) {
    ElMessage.warning('请填写变更说明和业务描述');
    return;
  }
  
  let changeSummary = summary.value.trim();
  const isNameChanged = parsedName.value.toLowerCase() !== detail.value.procedure_name.toLowerCase();
  const isDbChanged = parsedDb.value && parsedDb.value.toLowerCase() !== detail.value.database_name.toLowerCase();

  if (parsedName.value && (isNameChanged || isDbChanged)) {
    const oldIdentity = `${detail.value.database_name}.${detail.value.procedure_name}`;
    const newIdentity = `${parsedDb.value || 'db2admin'}.${parsedName.value}`;
    changeSummary += `\n[系统自动追加] 标识符变更: 从 ${oldIdentity} 变更为 ${newIdentity}`;
  }

  submitting.value = true;
  try {
    const result = await api.saveProcedure(detail.value.id, code.value, changeSummary, procedureDescription.value);
    if (result.flag) {
      ElMessage.success('保存成功');
      isDirty.value = false;
      showSaveModal.value = false;
      summary.value = '';
      
      // Refresh
      const historyData = await api.getHistory({ procedure_id: detail.value.id });
      history.value = historyData.results || [];
      if (parsedName.value) {
        detail.value.procedure_name = parsedName.value;
        detail.value.database_name = parsedDb.value || detail.value.database_name;
      }
    } else {
      saveError.value = result.info || '保存失败';
    }
  } catch (err: any) {
    saveError.value = err.message || '系统错误';
  } finally {
    submitting.value = false;
  }
};

const handleViewVersion = (item: HistoryItem) => {
  viewingVersion.value = item;
  editor?.setValue(item.content || '');
  editor?.updateOptions({ readOnly: true });
  isDirty.value = false;
};

const handleBackToLatest = () => {
  if (detail.value) {
    viewingVersion.value = null;
    editor?.setValue(detail.value.latest_content || '');
    editor?.updateOptions({ readOnly: false });
    isDirty.value = false;
  }
};

const handleCopy = () => {
  navigator.clipboard.writeText(code.value);
  ElMessage.success('已复制到剪贴板');
};

const handleCopyIdentifier = () => {
  if (!parsedName.value) return;
  const identifier = `\"${parsedDb.value || 'db2admin'}.${parsedName.value}\"`;
  navigator.clipboard.writeText(identifier);
  ElMessage.success({
    message: `已复制标识符: ${identifier}`,
    type: 'success',
    duration: 2000
  });
};

const handleCompare = (h1: number, h2: number) => {
  router.push(`/diff/${id.value}/${h1}/${h2}`);
};
</script>

<style scoped>
:deep(.monaco-editor) {
  padding-top: 8px;
}
</style>
