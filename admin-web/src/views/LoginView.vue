<template>
  <div class="wrap">
    <div class="bg-pattern" aria-hidden="true" />
    <el-card class="card" shadow="always">
      <div class="card-top">
        <div class="logo">约</div>
        <div>
          <h2 class="h2">管理员登录</h2>
          <p class="sub">约饭小程序 · 运营控制台</p>
        </div>
      </div>
      <p class="tip">开发环境默认 <code>admin</code> / <code>admin123</code>，上线前请务必修改密码与密钥。</p>
      <el-form :model="form" @submit.prevent="onSubmit" label-position="top" class="form">
        <el-form-item label="账号">
          <el-input v-model="form.username" size="large" autocomplete="username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            show-password
            autocomplete="current-password"
            placeholder="密码"
          />
        </el-form-item>
        <el-form-item class="submit-row">
          <el-button type="primary" native-type="submit" size="large" :loading="loading" class="submit-btn">
            进入后台
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <p class="foot">仅限授权人员使用</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'admin123',
})

async function onSubmit() {
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    const redirect = (route.query.redirect as string) || '/'
    await router.replace(redirect)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '登录失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.wrap {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 32px;
  position: relative;
  background: linear-gradient(165deg, #faf7f2 0%, #ebe6e1 45%, #e2dcd6 100%);
}
.bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: radial-gradient(circle at 20% 20%, rgba(196, 92, 38, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 80% 10%, rgba(240, 198, 116, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 60% 90%, rgba(42, 34, 32, 0.06) 0%, transparent 50%);
  pointer-events: none;
}
.card {
  position: relative;
  width: 420px;
  max-width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(42, 34, 32, 0.08);
  overflow: hidden;
}
.card :deep(.el-card__body) {
  padding: 28px 28px 24px;
}
.card-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}
.logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0c674 0%, #c45c26 100%);
  color: #2a2220;
  font-weight: 800;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #2a2220;
  letter-spacing: 0.02em;
}
.sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8a827a;
}
.tip {
  margin: 0 0 20px;
  font-size: 13px;
  color: #6b625c;
  line-height: 1.55;
}
code {
  background: #f5f3f1;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 12px;
}
.form :deep(.el-form-item) {
  margin-bottom: 18px;
}
.submit-row {
  margin-bottom: 0 !important;
  margin-top: 8px;
}
.submit-btn {
  width: 100%;
  font-weight: 600;
}
.foot {
  position: relative;
  margin: 18px 0 0;
  font-size: 12px;
  color: #9a928a;
}
</style>
