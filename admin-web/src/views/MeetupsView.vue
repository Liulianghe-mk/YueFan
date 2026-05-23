<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">约饭活动</h2>
          <p class="page-desc">
          与小程序同一数据源：用户在发起页发布后即写入本库；本页会在切回浏览器时自动刷新，并每 20 秒静默同步一次（编辑弹窗打开时不打断）。
        </p>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        class="search"
        clearable
        placeholder="筛选：标题 / 地点 / 时间 / 品类 / 摘要 / 东道主 / 区域"
        :prefix-icon="Search"
      />
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建活动</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="displayedRows"
      stripe
      class="meet-table"
      empty-text="暂无数据"
      style="width: 100%"
    >
      <template #empty>
        <el-empty :description="searchKeyword.trim() ? '无匹配结果' : '暂无活动，点击新建'" />
      </template>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column label="封面" width="76" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.coverUrl"
            :src="row.coverUrl"
            fit="cover"
            class="thumb"
            :preview-src-list="[row.coverUrl]"
            preview-teleported
            hide-on-click-modal
          />
          <span v-else class="no-cover">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
      <el-table-column prop="categoryTag" label="品类" width="96" show-overflow-tooltip />
      <el-table-column label="距离 · 区" width="130" show-overflow-tooltip>
        <template #default="{ row }">
          {{ [row.distanceLabel, row.district].filter(Boolean).join(' · ') || '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="locationLabel" label="地点" width="110" show-overflow-tooltip />
      <el-table-column prop="timeLabel" label="时间" width="108" />
      <el-table-column label="东道主" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.hostName || '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="joinedCount" label="已加入" width="88" align="center" />
      <el-table-column prop="totalSlots" label="名额" width="72" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" size="small" effect="light">
            {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openMembers(row)">参与者</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑活动' : '新建活动'"
      width="640px"
      class="edit-dialog"
      destroy-on-close
      align-center
    >
      <el-form :model="form" label-width="100px" label-position="right">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="80" show-word-limit placeholder="活动名称" />
        </el-form-item>
        <el-form-item label="品类标签">
          <el-input v-model="form.categoryTag" maxlength="24" show-word-limit placeholder="如：日本料理（对应小程序卡片 tag）" />
        </el-form-item>
        <el-form-item label="列表摘要">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="280"
            show-word-limit
            placeholder="卡片正文简介，对应小程序 desc"
          />
        </el-form-item>
        <el-form-item label="距离文案">
          <el-input v-model="form.distanceLabel" maxlength="32" placeholder="如：800m、1.2km" />
        </el-form-item>
        <el-form-item label="行政区">
          <el-input v-model="form.district" maxlength="24" placeholder="如：静安区" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.locationLabel" placeholder="发现页等用的短文案；可与行政区区分" />
        </el-form-item>
        <el-form-item label="时间文案">
          <el-input v-model="form.timeLabel" placeholder="如：本周六 12:00" />
        </el-form-item>
        <el-form-item label="封面 URL">
          <el-input v-model="form.coverUrl" type="textarea" :rows="2" placeholder="https://...（对应小程序 cover）" />
        </el-form-item>
        <el-form-item label="东道主姓名">
          <el-input v-model="form.hostName" maxlength="40" placeholder="hostName" />
        </el-form-item>
        <el-form-item label="东道主头像 URL">
          <el-input v-model="form.hostAvatarUrl" type="textarea" :rows="2" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="东道主评分">
          <el-input v-model="form.hostRating" maxlength="8" placeholder="如：4.9" style="max-width: 160px" />
        </el-form-item>
        <el-form-item label="东道主徽章">
          <el-input v-model="form.hostBadge" maxlength="32" placeholder="如：认证发起人" />
        </el-form-item>
        <el-form-item label="已加入">
          <el-input-number v-model="form.joinedCount" :min="0" />
          <p class="field-hint">有用户报名后，人数以「参与者」列表为准自动同步；无报名时可手动填写展示人数。</p>
        </el-form-item>
        <el-form-item label="总名额">
          <el-input-number v-model="form.totalSlots" :min="1" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="草稿" value="DRAFT" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="membersVisible" :title="membersTitle" width="640px" destroy-on-close align-center>
      <el-table v-loading="membersLoading" :data="memberRows" stripe empty-text="暂无报名用户" style="width: 100%">
        <el-table-column prop="nickname" label="昵称" min-width="100" />
        <el-table-column prop="userOpenid" label="OpenID" min-width="140" show-overflow-tooltip />
        <el-table-column label="头像" width="64" align="center">
          <template #default="{ row }">
            <el-image v-if="row.avatarUrl" :src="row.avatarUrl" class="thumb" fit="cover" />
            <span v-else class="no-cover">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="joinedAt" label="报名时间" min-width="160" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, MeetupDto, MeetupMemberDto, PageMeetups } from '@/api/types'

const loading = ref(false)
const membersVisible = ref(false)
const membersLoading = ref(false)
const membersTitle = ref('参与者')
const memberRows = ref<MeetupMemberDto[]>([])
const saving = ref(false)
const rows = ref<MeetupDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(10)
const searchKeyword = ref('')

const displayedRows = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter((r) => {
    const blob = [
      r.title,
      r.locationLabel,
      r.timeLabel,
      r.categoryTag,
      r.description,
      r.district,
      r.distanceLabel,
      r.hostName,
      r.hostBadge,
    ]
      .map((s) => (s ?? '').toLowerCase())
      .join('\n')
    return blob.includes(kw)
  })
})

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  title: '',
  categoryTag: '',
  description: '',
  distanceLabel: '',
  district: '',
  locationLabel: '',
  timeLabel: '',
  coverUrl: '',
  hostName: '',
  hostAvatarUrl: '',
  hostRating: '',
  hostBadge: '',
  joinedCount: 0,
  totalSlots: 8,
  status: 'PUBLISHED',
})

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<ApiResponse<PageMeetups>>('/api/admin/meetups', {
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
  form.title = ''
  form.categoryTag = ''
  form.description = ''
  form.distanceLabel = ''
  form.district = ''
  form.locationLabel = ''
  form.timeLabel = ''
  form.coverUrl = ''
  form.hostName = ''
  form.hostAvatarUrl = ''
  form.hostRating = ''
  form.hostBadge = ''
  form.joinedCount = 0
  form.totalSlots = 8
  form.status = 'PUBLISHED'
}

async function openMembers(row: MeetupDto) {
  membersTitle.value = '参与者 · ' + row.title
  membersVisible.value = true
  membersLoading.value = true
  memberRows.value = []
  try {
    const { data } = await http.get<ApiResponse<MeetupMemberDto[]>>(
      `/api/admin/meetups/${row.id}/members`,
    )
    if (data.code !== 0) throw new Error(data.message)
    memberRows.value = data.data
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '加载参与者失败'))
  } finally {
    membersLoading.value = false
  }
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: MeetupDto) {
  editingId.value = row.id
  form.title = row.title
  form.categoryTag = row.categoryTag ?? ''
  form.description = row.description ?? ''
  form.distanceLabel = row.distanceLabel ?? ''
  form.district = row.district ?? ''
  form.locationLabel = row.locationLabel
  form.timeLabel = row.timeLabel
  form.coverUrl = row.coverUrl
  form.hostName = row.hostName ?? ''
  form.hostAvatarUrl = row.hostAvatarUrl ?? ''
  form.hostRating = row.hostRating ?? ''
  form.hostBadge = row.hostBadge ?? ''
  form.joinedCount = row.joinedCount
  form.totalSlots = row.totalSlots
  form.status = row.status
  dialogVisible.value = true
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  saving.value = true
  try {
    const body = {
      title: form.title.trim(),
      categoryTag: form.categoryTag.trim(),
      description: form.description.trim(),
      distanceLabel: form.distanceLabel.trim(),
      district: form.district.trim(),
      locationLabel: form.locationLabel,
      timeLabel: form.timeLabel,
      coverUrl: form.coverUrl,
      hostName: form.hostName.trim(),
      hostAvatarUrl: form.hostAvatarUrl.trim(),
      hostRating: form.hostRating.trim(),
      hostBadge: form.hostBadge.trim(),
      joinedCount: form.joinedCount,
      totalSlots: form.totalSlots,
      status: form.status,
    }
    if (editingId.value) {
      const { data } = await http.put<ApiResponse<MeetupDto>>(`/api/admin/meetups/${editingId.value}`, body)
      if (data.code !== 0) throw new Error(data.message)
    } else {
      const { data } = await http.post<ApiResponse<MeetupDto>>('/api/admin/meetups', body)
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

async function onDelete(row: MeetupDto) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title}」？`, '确认删除', { type: 'warning' })
  } catch {
    return
  }
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/meetups/${row.id}`)
    if (data.code !== 0) throw new Error(data.message)
    ElMessage.success('已删除')
    await load()
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '删除失败'))
  }
}

const POLL_MS = 20_000
let pollTimer: ReturnType<typeof setInterval> | null = null

function shouldSkipBackgroundRefresh() {
  return dialogVisible.value || saving.value || loading.value
}

function onVisibilityChange() {
  if (document.visibilityState !== 'visible') return
  if (shouldSkipBackgroundRefresh()) return
  void load()
}

function startPoll() {
  if (pollTimer != null) return
  pollTimer = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return
    if (shouldSkipBackgroundRefresh()) return
    void load()
  }, POLL_MS)
}

function stopPoll() {
  if (pollTimer == null) return
  clearInterval(pollTimer)
  pollTimer = null
}

onMounted(() => {
  void load()
  document.addEventListener('visibilitychange', onVisibilityChange)
  startPoll()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  stopPoll()
})
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
  flex-shrink: 0;
}
.meet-table {
  border-radius: 8px;
  overflow: hidden;
}
.thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 1px solid #ebe6e1;
}
.no-cover {
  color: #b0a8a0;
  font-size: 13px;
}
.pager {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #7a726a;
  line-height: 1.45;
}
.edit-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}
</style>
