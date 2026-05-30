<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="title-container">
        <h3 class="title">{{ appConfig.title }}</h3>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
          prefix-icon="el-icon-user"
          size="large"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="el-icon-lock"
          size="large"
          show-password
          @keyup.enter.native="handleLogin"
        />
      </el-form-item>
      <el-button :loading="loading" type="primary" size="large" style="width: 100%" @click="handleLogin">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script>
import { appConfig } from '@/config/app'

export default {
  name: 'Login',
  data() {
    return {
      appConfig,
      loading: false,
      loginForm: {
        username: 'admin',
        password: 'admin123',
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return

        this.loading = true
        try {
          await this.$store.dispatch('login', this.loginForm)
          this.$message.success('登录成功')
          this.$router.push('/')
        } catch (error) {
          this.$message.error(error.message || '登录失败')
        } finally {
          this.loading = false
        }
      })
    },
  },
}
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
