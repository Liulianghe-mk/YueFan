<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">大V / 达人</h2>
          <p class="page-desc">对应小程序动态页「热门东道主」等展示位；仅启用且排序靠前者适合露出。</p>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-input v-model="searchKeyword" class="search" clearable placeholder="筛选：昵称 / 徽章" :prefix-icon="Search" />
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="displayedRows" stripe empty-text="暂无数据" style="width: 100%">
      <el-table-column prop="id" label="ID" width="64" />
      <el-table-column label="头像" width="64" align="center">
        <template #default="{ row }">
          <el-image v-if="row.avatarUrl" :src="row.avatarUrl" class="thumb" fit="cover" />
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="displayName" label="昵称" min-width="100" show-overflow-tooltip />
      <el-table-column prop="badgeLabel" label="徽章" width="120" show-overflow-tooltip />
      <el-table-column prop="ratingText" label="评分" width="72" />
      <el-table-column prop="sortOrder" label="排序" width="72" align="center" />
      <el-table-column label="启用" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ row.enabled ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑大V' : '新建大V'" width="560px" destroy-on-close align-center>
      <el-form :model="form" label-width="100px">
        <el-form-item label="昵称" required>
          <el-input v-model="form.displayName" maxlength="80" />
        </el-form-item>
        <el-form-item label="头像 URL" required>
          <el-input v-model="form.avatarUrl" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="徽章">
          <el-input v-model="form.badgeLabel" maxlength="64" />
        </el-form-item>
        <el-form-item label="评分文案">
          <el-input v-model="form.ratingText" maxlength="16" placeholder="如：4.9" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, InfluencerDto, PageDto } from '@/api/types'

const loading = ref(false)
const saving = ref(false)
const rows = ref<InfluencerDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(10)
const searchKeyword = ref('')

const displayedRows = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter(
    (r) =>
      r.displayName.toLowerCase().includes(kw) ||
      (r.badgeLabel && r.badgeLabel.toLowerCase().includes(kw)),
  )
})

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  displayName: '',
  avatarUrl: '',
  badgeLabel: '',
  ratingText: '',
  bio: '',
  sortOrder: 0,
  enabled: true,
})

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<ApiResponse<PageDto<InfluencerDto>>>('/api/admin/influencers', {
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

function resetForm() {
  form.displayName = ''
  form.avatarUrl = ''
  form.badgeLabel = ''
  form.ratingText = ''
  form.bio = ''
  form.sortOrder = 0
  form.enabled = true
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: InfluencerDto) {
  editingId.value = row.id
  form.displayName = row.displayName
  form.avatarUrl = row.avatarUrl
  form.badgeLabel = row.badgeLabel ?? ''
  form.ratingText = row.ratingText ?? ''
  form.bio = row.bio ?? ''
  form.sortOrder = row.sortOrder
  form.enabled = row.enabled
  dialogVisible.value = true
}

async function save() {
  if (!form.displayName.trim() || !form.avatarUrl.trim()) {
    ElMessage.warning('请填写昵称与头像 URL')
    return
  }
  saving.value = true
  try {
    const body = {
      displayName: form.displayName.trim(),
      avatarUrl: form.avatarUrl.trim(),
      badgeLabel: form.badgeLabel,
      ratingText: form.ratingText,
      bio: form.bio,
      sortOrder: form.sortOrder,
      enabled: form.enabled,
    }
    if (editingId.value) {
      const { data } = await http.put<ApiResponse<InfluencerDto>>(`/api/admin/influencers/${editingId.value}`, body)
      if (data.code !== 0) throw new Error(data.message)
    } else {
      const { data } = await http.post<ApiResponse<InfluencerDto>>('/api/admin/influencers', body)
      if (data.code !== 0) throw new Error(data.message)
    }
    ElMessage.success('已保存')
    dialogVisible.value = false
    await load()
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '保存失败'))
  } finally {
    saving.value = false
  }
}

async function onDelete(row: InfluencerDto) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.displayName}」？`, '确认删除', { type: 'warning' })
  } catch {
    return
  }
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/influencers/${row.id}`)
    if (data.code !== 0) throw new Error(data.message)
    ElMessage.success('已删除')
    await load()
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '删除失败'))
  }
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
.toolbar {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.search {
  max-width: 360px;
  min-width: 200px;
  flex: 1;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
}
.pager {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
.thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #ebe6e1;
}
.muted {
  color: #b0a8a0;
  font-size: 13px;
}
</style>
