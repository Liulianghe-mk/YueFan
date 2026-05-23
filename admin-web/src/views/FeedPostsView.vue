<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">动态内容</h2>
          <p class="page-desc">对应小程序「动态」Tab；VISIBLE 为前台可见，PENDING 待审，HIDDEN 已隐藏。</p>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-input v-model="searchKeyword" class="search" clearable placeholder="筛选：作者 / 正文" :prefix-icon="Search" />
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="displayedRows" stripe empty-text="暂无数据" style="width: 100%">
      <el-table-column prop="id" label="ID" width="64" />
      <el-table-column prop="authorName" label="作者" width="100" show-overflow-tooltip />
      <el-table-column prop="timeText" label="时间文案" width="100" show-overflow-tooltip />
      <el-table-column prop="content" label="正文" min-width="160" show-overflow-tooltip />
      <el-table-column prop="locationLabel" label="地点" width="120" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'VISIBLE'" type="success" size="small">展示</el-tag>
          <el-tag v-else-if="row.status === 'PENDING'" type="warning" size="small">待审</el-tag>
          <el-tag v-else type="info" size="small">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="互动" width="100" align="center">
        <template #default="{ row }">
          <span class="stat-pair">♥ {{ row.likesCount }}</span>
          <span class="stat-pair">💬 {{ row.commentsCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="72" align="center" />
      <el-table-column label="操作" width="220" fixed="right" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openComments(row)">评论</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑动态' : '新建动态'" width="720px" destroy-on-close align-center>
      <el-form :model="form" label-width="112px">
        <el-form-item label="作者名" required>
          <el-input v-model="form.authorName" maxlength="80" />
        </el-form-item>
        <el-form-item label="作者头像 URL" required>
          <el-input v-model="form.authorAvatarUrl" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="时间文案">
          <el-input v-model="form.timeText" maxlength="64" placeholder="如：2小时前" />
        </el-form-item>
        <el-form-item label="正文" required>
          <el-input v-model="form.content" type="textarea" :rows="4" maxlength="4000" show-word-limit />
        </el-form-item>
        <el-form-item label="配图 URL">
          <el-input v-model="form.imageUrl" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="地点文案">
          <el-input v-model="form.locationLabel" maxlength="200" />
        </el-form-item>
        <el-form-item label="聚合角标">
          <el-input v-model="form.gatherBadge" maxlength="64" placeholder="如：8人已聚" />
        </el-form-item>
        <el-form-item label="赞 / 评 / 转">
          <el-input-number v-model="form.likesCount" :min="0" />
          <el-input-number v-model="form.commentsCount" :min="0" class="ml8" />
          <el-input-number v-model="form.sharesCount" :min="0" class="ml8" />
          <p class="field-hint">有用户点赞或评论后，数量以真实互动为准自动同步；无互动时可手动填写展示数。</p>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="展示 VISIBLE" value="VISIBLE" />
            <el-option label="待审 PENDING" value="PENDING" />
            <el-option label="隐藏 HIDDEN" value="HIDDEN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="commentsVisible" :title="commentsTitle" width="720px" destroy-on-close align-center>
      <el-table v-loading="commentsLoading" :data="commentFlatRows" stripe empty-text="暂无评论" style="width: 100%">
        <el-table-column label="类型" width="72" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isReply" type="info" size="small">回复</el-tag>
            <el-tag v-else size="small">评论</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="用户" width="100" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="replyToNickname" label="回复给" width="100" show-overflow-tooltip />
        <el-table-column prop="timeText" label="时间" width="100" />
        <el-table-column prop="userOpenid" label="OpenID" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="80" fixed="right" align="right">
          <template #default="{ row }">
            <el-button link type="danger" @click="onDeleteComment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, FeedCommentDto, FeedPostDto, PageDto } from '@/api/types'

interface CommentFlatRow {
  id: number
  postId: number
  userOpenid: string
  authorName: string
  content: string
  replyToNickname: string
  timeText: string
  isReply: boolean
}

const loading = ref(false)
const saving = ref(false)
const commentsVisible = ref(false)
const commentsLoading = ref(false)
const commentsTitle = ref('评论')
const commentFlatRows = ref<CommentFlatRow[]>([])
const commentsPostId = ref<number | null>(null)
const rows = ref<FeedPostDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(10)
const searchKeyword = ref('')

const displayedRows = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter(
    (r) =>
      r.authorName.toLowerCase().includes(kw) ||
      (r.content && r.content.toLowerCase().includes(kw)),
  )
})

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  authorName: '',
  authorAvatarUrl: '',
  timeText: '',
  content: '',
  imageUrl: '',
  locationLabel: '',
  gatherBadge: '',
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  status: 'VISIBLE',
  sortOrder: 0,
})

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<ApiResponse<PageDto<FeedPostDto>>>('/api/admin/feed-posts', {
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
  form.authorName = ''
  form.authorAvatarUrl = ''
  form.timeText = ''
  form.content = ''
  form.imageUrl = ''
  form.locationLabel = ''
  form.gatherBadge = ''
  form.likesCount = 0
  form.commentsCount = 0
  form.sharesCount = 0
  form.status = 'VISIBLE'
  form.sortOrder = 0
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: FeedPostDto) {
  editingId.value = row.id
  form.authorName = row.authorName
  form.authorAvatarUrl = row.authorAvatarUrl
  form.timeText = row.timeText ?? ''
  form.content = row.content
  form.imageUrl = row.imageUrl ?? ''
  form.locationLabel = row.locationLabel ?? ''
  form.gatherBadge = row.gatherBadge ?? ''
  form.likesCount = row.likesCount
  form.commentsCount = row.commentsCount
  form.sharesCount = row.sharesCount
  form.status = row.status
  form.sortOrder = row.sortOrder
  dialogVisible.value = true
}

async function save() {
  if (!form.authorName.trim() || !form.authorAvatarUrl.trim() || !form.content.trim()) {
    ElMessage.warning('请填写作者名、头像与正文')
    return
  }
  saving.value = true
  try {
    const body = {
      authorName: form.authorName.trim(),
      authorAvatarUrl: form.authorAvatarUrl.trim(),
      timeText: form.timeText,
      content: form.content.trim(),
      imageUrl: form.imageUrl,
      locationLabel: form.locationLabel,
      gatherBadge: form.gatherBadge,
      likesCount: form.likesCount,
      commentsCount: form.commentsCount,
      sharesCount: form.sharesCount,
      status: form.status,
      sortOrder: form.sortOrder,
    }
    if (editingId.value) {
      const { data } = await http.put<ApiResponse<FeedPostDto>>(`/api/admin/feed-posts/${editingId.value}`, body)
      if (data.code !== 0) throw new Error(data.message)
    } else {
      const { data } = await http.post<ApiResponse<FeedPostDto>>('/api/admin/feed-posts', body)
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

function flattenComments(nodes: FeedCommentDto[]): CommentFlatRow[] {
  const out: CommentFlatRow[] = []
  for (const n of nodes) {
    out.push({
      id: n.id,
      postId: n.postId,
      userOpenid: n.userOpenid,
      authorName: n.authorName,
      content: n.content,
      replyToNickname: n.replyToNickname || '',
      timeText: n.timeText,
      isReply: false,
    })
    for (const r of n.replies || []) {
      out.push({
        id: r.id,
        postId: r.postId,
        userOpenid: r.userOpenid,
        authorName: r.authorName,
        content: r.content,
        replyToNickname: r.replyToNickname || n.authorName,
        timeText: r.timeText,
        isReply: true,
      })
    }
  }
  return out
}

async function openComments(row: FeedPostDto) {
  commentsTitle.value = '评论 · ' + (row.authorName || '') + ' #' + row.id
  commentsPostId.value = row.id
  commentsVisible.value = true
  commentsLoading.value = true
  commentFlatRows.value = []
  try {
    const { data } = await http.get<ApiResponse<FeedCommentDto[]>>(`/api/admin/feed-posts/${row.id}/comments`)
    if (data.code !== 0) throw new Error(data.message)
    commentFlatRows.value = flattenComments(data.data)
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '加载评论失败'))
  } finally {
    commentsLoading.value = false
  }
}

async function onDeleteComment(row: CommentFlatRow) {
  const postId = commentsPostId.value
  if (postId == null) return
  try {
    await ElMessageBox.confirm('确定删除该条评论？回复将一并删除。', '确认删除', { type: 'warning' })
  } catch {
    return
  }
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: boolean }>>(
      `/api/admin/feed-posts/${postId}/comments/${row.id}`,
    )
    if (data.code !== 0) throw new Error(data.message)
    ElMessage.success('已删除')
    await openComments({ id: postId, authorName: '' } as FeedPostDto)
    await load()
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '删除失败'))
  }
}

async function onDelete(row: FeedPostDto) {
  try {
    await ElMessageBox.confirm(`确定删除动态 #${row.id}？`, '确认删除', { type: 'warning' })
  } catch {
    return
  }
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/feed-posts/${row.id}`)
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
.ml8 {
  margin-left: 8px;
}
.field-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #7a726a;
  line-height: 1.45;
}
.stat-pair {
  display: inline-block;
  margin-right: 8px;
  font-size: 12px;
  color: #5c534c;
}
</style>
