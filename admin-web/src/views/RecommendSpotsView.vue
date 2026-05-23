<template>
  <el-card class="page-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div>
          <h2 class="page-h2">为你推荐</h2>
          <p class="page-desc">对应小程序发现页「为你推荐」轮播与详情；标签为英文逗号分隔；地址与营业时间显示在详情「地址与营业」区块。</p>
        </div>
      </div>
    </template>

    <div class="toolbar">
      <el-input v-model="searchKeyword" class="search" clearable placeholder="筛选：名称 / 标签" :prefix-icon="Search" />
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="displayedRows" stripe class="meet-table" empty-text="暂无数据" style="width: 100%">
      <template #empty>
        <el-empty :description="searchKeyword.trim() ? '无匹配结果' : '暂无数据，点击新建'" />
      </template>
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column label="图" width="76" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.imageUrl"
            :src="row.imageUrl"
            fit="cover"
            class="thumb"
            :preview-src-list="[row.imageUrl]"
            preview-teleported
            hide-on-click-modal
          />
          <span v-else class="no-cover">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="rating" label="评分" width="72" />
      <el-table-column prop="tags" label="标签" min-width="120" show-overflow-tooltip />
      <el-table-column prop="address" label="地址" min-width="140" show-overflow-tooltip />
      <el-table-column prop="businessHours" label="营业时间" width="140" show-overflow-tooltip />
      <el-table-column prop="priceYuan" label="人均¥" width="88" align="center" />
      <el-table-column prop="sortOrder" label="排序" width="72" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" size="small" effect="light">
            {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
          </el-tag>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑推荐' : '新建推荐'" width="560px" destroy-on-close align-center>
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item label="图片 URL" required>
          <el-input v-model="form.imageUrl" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="评分">
          <el-input-number v-model="form.rating" :min="0" :max="5" :step="0.1" :precision="1" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" maxlength="500" placeholder="英文逗号分隔，如日料,精致餐饮" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" maxlength="300" placeholder="如：上海市黄浦区外滩金融中心 B1-08" show-word-limit />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="form.businessHours" maxlength="200" placeholder="如：11:30–14:00，17:30–22:00" show-word-limit />
        </el-form-item>
        <el-form-item label="人均(元)">
          <el-input-number v-model="form.priceYuan" :min="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" />
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
  </el-card>
</template>

<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, PageDto, RecommendSpotDto } from '@/api/types'

const loading = ref(false)
const saving = ref(false)
const rows = ref<RecommendSpotDto[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(10)
const searchKeyword = ref('')

const displayedRows = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter(
    (r) =>
      r.name.toLowerCase().includes(kw) ||
      (r.tags && r.tags.toLowerCase().includes(kw)) ||
      (r.address && r.address.toLowerCase().includes(kw)) ||
      (r.businessHours && r.businessHours.toLowerCase().includes(kw)),
  )
})

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  imageUrl: '',
  rating: 5,
  tags: '',
  address: '',
  businessHours: '',
  priceYuan: 0,
  sortOrder: 0,
  status: 'PUBLISHED',
})

async function load() {
  loading.value = true
  try {
    const { data } = await http.get<ApiResponse<PageDto<RecommendSpotDto>>>('/api/admin/recommend-spots', {
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
  form.name = ''
  form.imageUrl = ''
  form.rating = 5
  form.tags = ''
  form.address = ''
  form.businessHours = ''
  form.priceYuan = 0
  form.sortOrder = 0
  form.status = 'PUBLISHED'
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: RecommendSpotDto) {
  editingId.value = row.id
  form.name = row.name
  form.imageUrl = row.imageUrl
  form.rating = row.rating
  form.tags = row.tags ?? ''
  form.address = row.address ?? ''
  form.businessHours = row.businessHours ?? ''
  form.priceYuan = row.priceYuan
  form.sortOrder = row.sortOrder
  form.status = row.status
  dialogVisible.value = true
}

async function save() {
  if (!form.name.trim() || !form.imageUrl.trim()) {
    ElMessage.warning('请填写名称与图片 URL')
    return
  }
  saving.value = true
  try {
    const body = {
      name: form.name.trim(),
      imageUrl: form.imageUrl.trim(),
      rating: form.rating,
      tags: form.tags,
      address: form.address.trim(),
      businessHours: form.businessHours.trim(),
      priceYuan: form.priceYuan,
      sortOrder: form.sortOrder,
      status: form.status,
    }
    if (editingId.value) {
      const { data } = await http.put<ApiResponse<RecommendSpotDto>>(
        `/api/admin/recommend-spots/${editingId.value}`,
        body,
      )
      if (data.code !== 0) throw new Error(data.message)
    } else {
      const { data } = await http.post<ApiResponse<RecommendSpotDto>>('/api/admin/recommend-spots', body)
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

async function onDelete(row: RecommendSpotDto) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」？`, '确认删除', { type: 'warning' })
  } catch {
    return
  }
  try {
    const { data } = await http.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/recommend-spots/${row.id}`)
    if (data.code !== 0) throw new Error(data.message)
    ElMessage.success('已删除')
    await load()
  } catch (e: unknown) {
    ElMessage.error(apiErrorMessage(e, '删除失败'))
  }
}

onMounted(() => {
  void load()
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
</style>
