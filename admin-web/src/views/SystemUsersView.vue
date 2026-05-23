<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">管理员账号</h2>
          <p class="page-desc">后台登录账号列表（只读）。密码不可见；如需改密请在数据库或后续「账号安全」功能中处理。</p>
        </div>
      </div>
    </template>

    <el-table v-loading="loading" :data="rows" stripe empty-text="暂无数据" style="width: 100%">
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="role" label="角色" width="140" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160" show-overflow-tooltip />
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:page-size="size"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        :total="total"
        :current-page="page + 1"
        background
        @current-change="onPage"
        @size-change="onSizeChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { AdminUserListItemDto, ApiResponse, PageDto } from '@/api/types'

const loading = ref(false)
const rows = ref<AdminUserListItemDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(20)

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<ApiResponse<PageDto<AdminUserListItemDto>>>('/api/admin/system-users', {
      params: { page: page.value, size: size.value },
    })
    if (data.code !== 0) throw new Error(data.message)
    rows.value = data.data.content
    total.value = data.data.totalElements
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '加载失败'))
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p - 1
  void load()
}

function onSizeChange() {
  page.value = 0
  void load()
}

onMounted(() => void load())
</script>

<style scoped>
.page-card {
  border-radius: var(--yf-radius, 12px);
  border: 1px solid #ebe6e1;
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.page-h2 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #2a2220;
}
.page-desc {
  margin: 0;
  font-size: 13px;
  color: #7a726a;
  line-height: 1.5;
}
.pager {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
</style>
