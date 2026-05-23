<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">小程序用户</h2>
          <p class="page-desc">
            小程序账号注册/登录会写入本表（OpenID 形如 <code>acct:用户名</code>）；微信或游客 openid 也会自动入库。可编辑昵称、头像与启用状态；禁用后账号密码无法登录。
          </p>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        class="search"
        clearable
        placeholder="筛选：昵称 / 账号 / OpenID"
        :prefix-icon="Search"
        @clear="onSearch"
        @keyup.enter="onSearch"
      />
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="rows" stripe empty-text="暂无数据" style="width: 100%">
      <el-table-column prop="id" label="ID" width="64" />
      <el-table-column label="头像" width="64" align="center">
        <template #default="{ row }">
          <el-image v-if="row.avatarUrl" :src="row.avatarUrl" class="thumb" fit="cover" />
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" min-width="100" show-overflow-tooltip />
      <el-table-column label="账号" min-width="100" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.username">{{ row.username }}</span>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="登录方式" width="108" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.accountLogin" type="warning" size="small">账号密码</el-tag>
          <el-tag v-else size="small">微信/游客</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="openid" label="OpenID" min-width="140" show-overflow-tooltip />
      <el-table-column prop="levelText" label="等级" width="100" show-overflow-tooltip />
      <el-table-column label="关注" width="72" align="center">
        <template #default="{ row }">{{ row.followCount }}</template>
      </el-table-column>
      <el-table-column label="私信" width="72" align="center">
        <template #default="{ row }">{{ row.conversationCount }}</template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ row.enabled ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最近登录" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="100" fixed="right" align="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
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
      :title="editingId ? '编辑用户' : '新建用户'"
      width="560px"
      destroy-on-close
      align-center
    >
      <el-form :model="form" label-width="100px">
        <el-form-item v-if="!editingId" label="OpenID" required>
          <el-input v-model="form.openid" maxlength="64" placeholder="如 dev-openid、miniapp-user" />
        </el-form-item>
        <el-form-item v-else label="OpenID">
          <el-input :model-value="form.openid" disabled />
        </el-form-item>
        <el-form-item v-if="editingId && form.username" label="登录账号">
          <el-input :model-value="form.username" disabled />
          <p class="field-hint">账号密码在小程序端注册；后台不可查看或修改密码。</p>
        </el-form-item>
        <el-form-item label="昵称" required>
          <el-input v-model="form.nickname" maxlength="80" />
        </el-form-item>
        <el-form-item label="头像 URL">
          <el-input v-model="form.avatarUrl" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="等级文案">
          <el-input v-model="form.levelText" maxlength="32" placeholder="如：LV.4 美食家" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.bio" type="textarea" :rows="3" maxlength="500" show-word-limit />
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
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, AppUserDto, PageDto } from '@/api/types'

const loading = ref(false)
const saving = ref(false)
const rows = ref<AppUserDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(20)
const searchKeyword = ref('')

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  openid: '',
  username: '',
  nickname: '',
  avatarUrl: '',
  levelText: 'LV.1',
  bio: '',
  enabled: true,
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchKeyword, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 0
    void load()
  }, 350)
})

async function load() {
  loading.value = true
  try {
    const kw = searchKeyword.value.trim()
    const { data } = await http.get<ApiResponse<PageDto<AppUserDto>>>('/api/admin/app-users', {
      params: {
        page: page.value,
        size: size.value,
        ...(kw ? { keyword: kw } : {}),
      },
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

function onSearch() {
  page.value = 0
  void load()
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
  form.openid = ''
  form.username = ''
  form.nickname = ''
  form.avatarUrl = ''
  form.levelText = 'LV.1'
  form.bio = ''
  form.enabled = true
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: AppUserDto) {
  editingId.value = row.id
  form.openid = row.openid
  form.username = row.username ?? ''
  form.nickname = row.nickname
  form.avatarUrl = row.avatarUrl ?? ''
  form.levelText = row.levelText ?? 'LV.1'
  form.bio = row.bio ?? ''
  form.enabled = row.enabled
  dialogVisible.value = true
}

async function save() {
  if (!form.nickname.trim()) {
    ElMessage.warning('请填写昵称')
    return
  }
  if (!editingId.value && !form.openid.trim()) {
    ElMessage.warning('请填写 OpenID')
    return
  }
  saving.value = true
  try {
    const body = {
      openid: form.openid.trim(),
      nickname: form.nickname.trim(),
      avatarUrl: form.avatarUrl,
      levelText: form.levelText,
      bio: form.bio,
      enabled: form.enabled,
    }
    if (editingId.value) {
      const { data } = await http.put<ApiResponse<AppUserDto>>(`/api/admin/app-users/${editingId.value}`, body)
      if (data.code !== 0) throw new Error(data.message)
    } else {
      const { data } = await http.post<ApiResponse<AppUserDto>>('/api/admin/app-users', body)
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
.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9a928a;
  line-height: 1.4;
}
.page-desc code {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f3efe9;
  color: #6b5348;
}
</style>
