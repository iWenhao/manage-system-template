import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { appConfig } from '../../config/app.config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-form">
        <h2 class="title">{{ title }}</h2>
        <div class="form-item">
          <input
            type="text"
            [(ngModel)]="username"
            placeholder="请输入用户名"
            (keyup.enter)="login()"
          />
        </div>
        <div class="form-item">
          <input
            type="password"
            [(ngModel)]="password"
            placeholder="请输入密码"
            (keyup.enter)="login()"
          />
        </div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <button (click)="login()" [disabled]="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
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
    .title {
      text-align: center;
      margin-bottom: 30px;
      font-size: 24px;
      color: #333;
    }
    .form-item {
      margin-bottom: 20px;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
    }
    input:focus {
      border-color: #409eff;
    }
    .error {
      color: #f56c6c;
      font-size: 12px;
      margin-bottom: 10px;
    }
    .login-btn {
      width: 100%;
      padding: 12px;
      background: #409eff;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    .login-btn:hover {
      background: #66b1ff;
    }
    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `],
})
export class LoginComponent {
  title = appConfig.title;
  username = 'admin';
  password = 'admin123';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.username || !this.password) {
      this.error = '请输入用户名和密码';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || '登录失败';
        this.loading = false;
      },
    });
  }
}
