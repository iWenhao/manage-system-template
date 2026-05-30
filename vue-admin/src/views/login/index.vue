<template>
  <div class="login-container">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="title-container">
        <h3 class="title">{{ appConfig.title }}</h3>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          :placeholder="$t('login.usernamePlaceholder')"
          prefix-icon="User"
          size="large"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          :placeholder="$t('login.passwordPlaceholder')"
          prefix-icon="Lock"
          size="large"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>
      <el-button :loading="loading" type="primary" size="large" style="width: 100%" @click="handleLogin">
        {{ $t('login.login') }}
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { appConfig } from '@/config/app';

const router = useRouter();
const userStore = useUserStore();
const loginRef = ref();
const loading = ref(false);

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleLogin = async () => {
  const valid = await loginRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login(loginForm);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.title-container {
  text-align: center;
  margin-bottom: 30px;

  .title {
    font-size: 24px;
    color: #333;
  }
}
</style>
