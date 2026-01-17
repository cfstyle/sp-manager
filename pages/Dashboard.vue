<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-800">系统概览</h1>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
        <div>
          <p class="text-gray-500 text-base font-medium mb-1.5">{{ stat.title }}</p>
          <h3 class="text-4xl font-bold text-gray-800">{{ stat.value }}</h3>
          <p :class="['text-sm mt-2 font-medium', stat.sub.includes('+') ? 'text-green-600' : 'text-gray-400']">{{ stat.sub }}</p>
        </div>
        <div :class="['p-3.5 rounded-xl', stat.color]">
          <component :is="stat.icon" class="w-7 h-7 text-white" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart -->
      <div class="lg:col-span-2 bg-white p-7 rounded-xl border border-gray-100 shadow-sm">
        <h3 class="text-xl font-bold text-gray-800 mb-6">活动趋势 (本周)</h3>
        <div class="h-96">
          <v-chart class="chart" :option="areaChartOption" autoresize />
        </div>
      </div>

      <!-- Secondary Chart -->
      <div class="bg-white p-7 rounded-xl border border-gray-100 shadow-sm">
          <h3 class="text-xl font-bold text-gray-800 mb-6">变更类型分布</h3>
          <div class="h-96">
            <v-chart class="chart" :option="barChartOption" autoresize />
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { Database, User, TrendingUp, AlertCircle } from 'lucide-vue-next';
import { MOCK_STATS } from '@/constants';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

const stats = [
  { title: '存储过程总数', value: MOCK_STATS.total, sub: '+12 本月', icon: Database, color: 'bg-blue-500' },
  { title: '活跃开发者', value: MOCK_STATS.activeDevelopers, sub: '当前在线: 3', icon: User, color: 'bg-purple-500' },
  { title: '近30天变更', value: MOCK_STATS.changedThisMonth, sub: '+15% 环比上月', icon: TrendingUp, color: 'bg-green-500' },
  { title: '发布失败', value: '2', sub: '需要关注', icon: AlertCircle, color: 'bg-red-500' },
];

const chartData = [
  { name: '周一', new: 2, updates: 4 },
  { name: '周二', new: 1, updates: 8 },
  { name: '周三', new: 3, updates: 5 },
  { name: '周四', new: 0, updates: 12 },
  { name: '周五', new: 4, updates: 6 },
  { name: '周六', new: 1, updates: 2 },
  { name: '周日', new: 0, updates: 1 },
];

const areaChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 0,
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.1)',
    textStyle: { color: '#666', fontSize: 14 }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: chartData.map(d => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#6b7280', fontSize: 14 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#f1f1f1', type: 'dashed' } },
    axisLabel: { color: '#6b7280', fontSize: 14 }
  },
  series: [
    {
      name: '变更量',
      type: 'line',
      smooth: true,
      data: chartData.map(d => d.updates),
      lineStyle: { width: 3, color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0)' }
          ]
        }
      },
      showSymbol: false
    }
  ]
}));

const barChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    bottom: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { fontSize: 12 }
  },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: chartData.map(d => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#f1f1f1' } }
  },
  series: [
    {
      name: '新增',
      type: 'bar',
      stack: 'total',
      data: chartData.map(d => d.new),
      itemStyle: { color: '#10b981', borderRadius: [0, 0, 4, 4] }
    },
    {
      name: '修改',
      type: 'bar',
      stack: 'total',
      data: chartData.map(d => d.updates),
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
    }
  ]
}));
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
