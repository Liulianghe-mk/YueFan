<template>
  <div class="dash">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-inner">
            <div class="stat-icon total">
              <el-icon :size="26"><DataLine /></el-icon>
            </div>
            <div>
              <div class="stat-label">约饭活动</div>
              <div class="stat-value">{{ totalMeetups != null ? totalMeetups : '—' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-inner">
            <div class="stat-icon pub">
              <el-icon :size="26"><Picture /></el-icon>
            </div>
            <div>
              <div class="stat-label">为你推荐</div>
              <div class="stat-value">{{ totalRecommend != null ? totalRecommend : '—' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-inner">
            <div class="stat-icon feed">
              <el-icon :size="26"><ChatDotRound /></el-icon>
            </div>
            <div>
              <div class="stat-label">动态（展示中）</div>
              <div class="stat-value">{{ visiblePosts != null ? visiblePosts : '—' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-card class="stat-card stat-card--action" shadow="hover" @click="goChat">
          <div class="stat-inner action">
            <div class="stat-icon chat">
              <el-icon :size="26"><Message /></el-icon>
            </div>
            <div>
              <div class="stat-label">私信会话</div>
              <div class="stat-value">{{ totalChats != null ? totalChats : '—' }}</div>
              <div class="stat-action">查看与回复 →</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-head">
          <span class="card-title">小程序开放接口</span>
          <el-button text type="primary" @click="copyMeetupsApi">复制接口地址</el-button>
        </div>
      </template>
      <p class="lead">
        已发布约饭：<code>GET /api/app/meetups</code>；为你推荐：<code>GET /api/app/recommend-spots</code>；搜索热词：
        <code>GET /api/app/hot-tags</code>；发现分类：<code>GET /api/app/discover-categories</code>；动态列表：
        <code>GET /api/app/feed/posts</code>；大V：<code>GET /api/app/influencers</code>；私信：
        <code>GET|POST /api/app/chat/conversations</code> 及消息子路径。以上小程序接口无需登录。
      </p>
      <p class="lead sync-note">
        <span class="sync-label">数据同步：</span>管理端保存的内容写入同一数据库；小程序用户在「发起」页发布约饭会通过
        <code>POST /api/app/meetups</code> 写入同一库；私信在小程序发起后可在「私信会话」页查看并代回。请保证小程序
        <code>utils/config.js</code> 中 <code>apiBase</code> 指向本后端地址。
      </p>
    </el-card>

    <el-card class="steps-card" shadow="never">
      <template #header>
        <span class="card-title">本地联调</span>
      </template>
      <el-steps :active="3" align-center finish-status="success" class="steps">
        <el-step title="启动后端" description="mvn spring-boot:run" />
        <el-step title="启动管理端" description="npm run dev" />
        <el-step title="登录" description="admin / admin123" />
      </el-steps>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, DataLine, Message, Picture } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { http, apiErrorMessage } from '@/api/http'
import type { ApiResponse, ChatConversationDto, FeedPostDto, PageDto, PageMeetups, RecommendSpotDto } from '@/api/types'

const router = useRouter()
const totalMeetups = ref<number | null>(null)
const totalRecommend = ref<number | null>(null)
const visiblePosts = ref<number | null>(null)
const totalChats = ref<number | null>(null)

async function loadStats() {
  try {
    const [meetupsRes, recRes, feedRes, chatRes] = await Promise.all([
      http.get<ApiResponse<PageMeetups>>('/api/admin/meetups', { params: { page: 0, size: 1 } }),
      http.get<ApiResponse<PageDto<RecommendSpotDto>>>('/api/admin/recommend-spots', {
        params: { page: 0, size: 1 },
      }),
      http.get<ApiResponse<PageDto<FeedPostDto>>>('/api/admin/feed-posts', { params: { page: 0, size: 200 } }),
      http.get<ApiResponse<PageDto<ChatConversationDto>>>('/api/admin/chat/conversations', {
        params: { page: 0, size: 1 },
      }),
    ])
    if (meetupsRes.data.code !== 0) throw new Error(meetupsRes.data.message)
    if (recRes.data.code !== 0) throw new Error(recRes.data.message)
    if (feedRes.data.code !== 0) throw new Error(feedRes.data.message)
    if (chatRes.data.code !== 0) throw new Error(chatRes.data.message)
    totalMeetups.value = meetupsRes.data.data.totalElements
    totalRecommend.value = recRes.data.data.totalElements
    const posts = feedRes.data.data.content
    visiblePosts.value = posts.filter((p) => p.status === 'VISIBLE').length
    totalChats.value = chatRes.data.data.totalElements
  } catch (e: unknown) {
    totalMeetups.value = null
    totalRecommend.value = null
    visiblePosts.value = null
    totalChats.value = null
    ElMessage.warning(apiErrorMessage(e, '无法加载统计数据'))
  }
}

function goChat() {
  void router.push('/chat-messages')
}

async function copyMeetupsApi() {
  const base = import.meta.env.VITE_API_BASE?.trim()
  const path = '/api/app/meetups'
  const text = base ? `${base.replace(/\/$/, '')}${path}` : `${window.location.origin}${path}`
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.info(text)
  }
}

onMounted(() => {
  void loadStats()
})
</script>

<style scoped>
.dash {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stat-row {
  margin-bottom: 0 !important;
}
.stat-card {
  border-radius: var(--yf-radius, 12px);
  border: 1px solid #ebe6e1;
  cursor: default;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-card--action {
  cursor: pointer;
}
.stat-card--action:hover {
  transform: translateY(-2px);
  box-shadow: var(--yf-shadow, 0 4px 24px rgba(42, 34, 32, 0.1));
}
.stat-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-inner.action {
  justify-content: space-between;
  width: 100%;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon.total {
  background: var(--yf-accent-soft, rgba(196, 92, 38, 0.12));
  color: #c45c26;
}
.stat-icon.pub {
  background: rgba(103, 194, 58, 0.15);
  color: #529b2e;
}
.stat-icon.feed {
  background: rgba(64, 158, 255, 0.15);
  color: #337ecc;
}
.stat-icon.chat {
  background: rgba(158, 42, 47, 0.12);
  color: #9e2a2f;
}
.stat-label {
  font-size: 12px;
  color: #7a726a;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #2a2220;
  letter-spacing: 0.02em;
}
.stat-action {
  font-size: 14px;
  font-weight: 600;
  color: #c45c26;
}
.info-card,
.steps-card {
  border-radius: var(--yf-radius, 12px);
  border: 1px solid #ebe6e1;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.card-title {
  font-weight: 700;
  font-size: 15px;
  color: #2a2220;
}
.lead {
  margin: 0;
  color: #5c534c;
  line-height: 1.65;
  font-size: 14px;
}
.lead + .lead {
  margin-top: 12px;
}
.sync-note .sync-label {
  font-weight: 600;
  color: #2a2220;
}
.sync-em {
  font-weight: 600;
  color: #c45c26;
}
code {
  background: #f5f3f1;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 13px;
}
.steps {
  padding: 8px 0 4px;
}
.steps :deep(.el-step__title) {
  font-size: 13px;
}
</style>
