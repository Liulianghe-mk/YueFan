<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">私信会话</h2>
          <p class="page-desc">
            与小程序「私聊 / 私信」同一数据源；用户在约饭详情、个人主页发起的对话会写入本库。可查看记录并以对方身份回复。
          </p>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        class="search"
        clearable
        placeholder="筛选：用户 / 对方昵称 / 场景 / 最后一条消息"
        :prefix-icon="Search"
      />
      <div class="toolbar-actions">
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="displayedRows"
      stripe
      class="chat-table"
      empty-text="暂无会话"
      style="width: 100%"
    >
      <template #empty>
        <el-empty description="暂无私信，请先在小程序中发起私聊" />
      </template>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column label="用户" width="120" show-overflow-tooltip>
        <template #default="{ row }">
          <code class="openid">{{ row.userOpenid }}</code>
        </template>
      </el-table-column>
      <el-table-column label="对方" min-width="140">
        <template #default="{ row }">
          <div class="peer-cell">
            <el-avatar :size="36" :src="row.peerAvatarUrl" />
            <span class="peer-name">{{ row.peerName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="contextLabel" label="场景" min-width="160" show-overflow-tooltip />
      <el-table-column prop="lastMessage" label="最后消息" min-width="200" show-overflow-tooltip />
      <el-table-column prop="lastTime" label="时间" width="88" />
      <el-table-column label="未读" width="72" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.unreadForUser > 0" type="danger" size="small" effect="dark">
            {{ row.unreadForUser }}
          </el-tag>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">查看 / 回复</el-button>
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
      :title="activeConv ? `与 ${activeConv.peerName} 的对话` : '私信'"
      width="640px"
      class="chat-dialog"
      destroy-on-close
      align-center
      @closed="onDialogClosed"
    >
      <div v-if="activeConv" class="dlg-head">
        <el-avatar :size="48" :src="activeConv.peerAvatarUrl" />
        <div class="dlg-head-text">
          <div class="dlg-peer">{{ activeConv.peerName }}</div>
          <div v-if="activeConv.contextLabel" class="dlg-ctx">{{ activeConv.contextLabel }}</div>
          <div class="dlg-user">小程序用户：{{ activeConv.userOpenid }}</div>
        </div>
      </div>

      <div v-loading="msgLoading" class="dlg-messages">
        <div v-if="!messages.length && !msgLoading" class="dlg-empty">暂无消息</div>
        <div
          v-for="m in messages"
          :key="m.id"
          class="msg-row"
          :class="m.from === 'me' ? 'msg-row--user' : 'msg-row--peer'"
        >
          <div class="msg-bubble" :class="m.from === 'me' ? 'msg-bubble--user' : 'msg-bubble--peer'">
            <span class="msg-label">{{ m.from === 'me' ? '用户' : '对方' }}</span>
            <p class="msg-text">{{ m.content }}</p>
          </div>
          <span class="msg-time">{{ m.time }}</span>
        </div>
      </div>

      <div class="dlg-reply">
        <el-input
          v-model="replyText"
          type="textarea"
          :rows="3"
          maxlength="4000"
          show-word-limit
          placeholder="以对方身份回复，用户将在小程序中看到"
        />
        <el-button type="primary" class="dlg-send" :loading="replying" @click="sendReply">
          发送回复
        </el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, ChatConversationDto, ChatMessageDto, PageDto } from '@/api/types'

const loading = ref(false)
const msgLoading = ref(false)
const replying = ref(false)
const rows = ref<ChatConversationDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(20)
const searchKeyword = ref('')

const displayedRows = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter((r) => {
    const blob = [r.userOpenid, r.peerName, r.contextLabel, r.lastMessage, r.peerKey]
      .map((s) => (s ?? '').toLowerCase())
      .join('\n')
    return blob.includes(kw)
  })
})

const dialogVisible = ref(false)
const activeConv = ref<ChatConversationDto | null>(null)
const messages = ref<ChatMessageDto[]>([])
const replyText = ref('')

const POLL_MS = 15_000
let pollTimer: ReturnType<typeof setInterval> | null = null

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<ApiResponse<PageDto<ChatConversationDto>>>('/api/admin/chat/conversations', {
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

async function loadMessages(convId: number) {
  msgLoading.value = true
  try {
    const { data } = await http.get<ApiResponse<ChatMessageDto[]>>(`/api/admin/chat/conversations/${convId}/messages`)
    if (data.code !== 0) throw new Error(data.message)
    messages.value = data.data
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '加载消息失败'))
  } finally {
    msgLoading.value = false
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

async function openDialog(row: ChatConversationDto) {
  activeConv.value = row
  replyText.value = ''
  dialogVisible.value = true
  await loadMessages(row.id)
}

function onDialogClosed() {
  activeConv.value = null
  messages.value = []
  replyText.value = ''
}

async function sendReply() {
  const conv = activeConv.value
  const text = replyText.value.trim()
  if (!conv || !text) {
    ElMessage.warning('请输入回复内容')
    return
  }
  replying.value = true
  try {
    const { data } = await http.post<ApiResponse<ChatMessageDto>>(
      `/api/admin/chat/conversations/${conv.id}/reply`,
      { content: text },
    )
    if (data.code !== 0) throw new Error(data.message)
    replyText.value = ''
    await loadMessages(conv.id)
    await load()
    const updated = rows.value.find((r) => r.id === conv.id)
    if (updated) activeConv.value = updated
    ElMessage.success('已发送')
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '发送失败'))
  } finally {
    replying.value = false
  }
}

async function onDelete(row: ChatConversationDto) {
  try {
    await ElMessageBox.confirm(`确定删除与「${row.peerName}」的会话及全部消息？`, '确认删除', {
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: boolean }>>(
      `/api/admin/chat/conversations/${row.id}`,
    )
    if (data.code !== 0) throw new Error(data.message)
    ElMessage.success('已删除')
    if (activeConv.value?.id === row.id) {
      dialogVisible.value = false
    }
    await load()
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '删除失败'))
  }
}

function shouldSkipPoll() {
  return dialogVisible.value || replying.value || loading.value
}

function startPoll() {
  if (pollTimer != null) return
  pollTimer = window.setInterval(() => {
    if (document.visibilityState !== 'visible') return
    if (shouldSkipPoll()) return
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
  startPoll()
})

onUnmounted(() => {
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
  max-width: 720px;
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
  max-width: 400px;
  min-width: 200px;
  flex: 1;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.peer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.peer-name {
  font-weight: 600;
  color: #2a2220;
}
.openid {
  font-size: 12px;
  color: #6b635c;
  background: #f5f3f1;
  padding: 2px 6px;
  border-radius: 4px;
}
.muted {
  color: #b0a8a0;
  font-size: 13px;
}
.pager {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.dlg-head {
  display: flex;
  gap: 14px;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0ebe6;
}
.dlg-peer {
  font-size: 16px;
  font-weight: 700;
  color: #2a2220;
}
.dlg-ctx {
  margin-top: 4px;
  font-size: 13px;
  color: #a8483c;
}
.dlg-user {
  margin-top: 4px;
  font-size: 12px;
  color: #9a948f;
}
.dlg-messages {
  max-height: 360px;
  overflow-y: auto;
  padding: 8px 4px;
  background: #eceae8;
  border-radius: 12px;
  min-height: 120px;
}
.dlg-empty {
  text-align: center;
  color: #9a948f;
  padding: 40px 0;
  font-size: 14px;
}
.msg-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  max-width: 85%;
}
.msg-row--user {
  margin-left: auto;
  align-items: flex-end;
}
.msg-row--peer {
  margin-right: auto;
  align-items: flex-start;
}
.msg-bubble {
  padding: 12px 14px;
  border-radius: 16px;
  max-width: 100%;
}
.msg-bubble--user {
  background: linear-gradient(138deg, #c44d44 0%, #9e2a2f 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.msg-bubble--peer {
  background: #ffffff;
  border: 1px solid #e8dfd6;
  border-bottom-left-radius: 4px;
}
.msg-label {
  display: block;
  font-size: 11px;
  opacity: 0.75;
  margin-bottom: 4px;
}
.msg-bubble--user .msg-label {
  color: rgba(255, 255, 255, 0.85);
}
.msg-bubble--peer .msg-label {
  color: #9a948f;
}
.msg-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}
.msg-bubble--peer .msg-text {
  color: #3d2f2c;
}
.msg-time {
  margin-top: 4px;
  font-size: 11px;
  color: #b0a8a0;
}
.dlg-reply {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0ebe6;
}
.dlg-send {
  margin-top: 10px;
  width: 100%;
}
</style>
