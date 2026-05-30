import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { appConfig } from '../../config/app.config';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-wrapper" [class.sidebar-collapsed]="!sidebarOpened">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="logo">
          <img [src]="logo" alt="Logo" />
          <span *ngIf="sidebarOpened" class="title">{{ title }}</span>
        </div>
        <nav class="menu">
          <a routerLink="/dashboard" routerLinkActive="active" class="menu-item">
            <span class="icon">🏠</span>
            <span *ngIf="sidebarOpened">首页</span>
          </a>
          <div class="menu-group">
            <div class="menu-group-title" *ngIf="sidebarOpened">系统管理</div>
            <a routerLink="/system/user" routerLinkActive="active" class="menu-item">
              <span class="icon">👤</span>
              <span *ngIf="sidebarOpened">用户管理</span>
            </a>
            <a routerLink="/system/role" routerLinkActive="active" class="menu-item">
              <span class="icon">🔑</span>
              <span *ngIf="sidebarOpened">角色管理</span>
            </a>
            <a routerLink="/system/menu" routerLinkActive="active" class="menu-item">
              <span class="icon">📋</span>
              <span *ngIf="sidebarOpened">菜单管理</span>
            </a>
          </div>
        </nav>
        <div class="collapse-btn" (click)="toggleSidebar()">
          {{ sidebarOpened ? '◀' : '▶' }}
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main">
        <header class="header">
          <div></div>
          <div class="user-info">
            <span>{{ userInfo?.nickname }}</span>
            <button (click)="logout()" class="logout-btn">退出</button>
          </div>
        </header>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-wrapper {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 210px;
      background: #304156;
      display: flex;
      flex-direction: column;
      transition: width 0.3s;
    }
    .sidebar-collapsed .sidebar {
      width: 64px;
    }
    .logo {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2b2f3a;
    }
    .logo img {
      width: 32px;
      height: 32px;
    }
    .logo .title {
      color: #fff;
      margin-left: 10px;
      font-weight: 600;
    }
    .menu {
      flex: 1;
      overflow-y: auto;
    }
    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: #bfcbd9;
      text-decoration: none;
      cursor: pointer;
    }
    .menu-item:hover,
    .menu-item.active {
      background: #263445;
      color: #409eff;
    }
    .menu-item .icon {
      margin-right: 10px;
    }
    .menu-group-title {
      padding: 12px 20px 4px;
      color: #909399;
      font-size: 12px;
    }
    .collapse-btn {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2b2f3a;
      color: #bfcbd9;
      cursor: pointer;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .collapse-btn:hover {
      color: #409eff;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logout-btn {
      padding: 4px 12px;
      border: 1px solid #f56c6c;
      color: #f56c6c;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
    }
    .content {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f0f2f5;
    }
  `],
})
export class LayoutComponent implements OnInit {
  title = appConfig.title;
  logo = appConfig.logo;
  sidebarOpened = true;
  userInfo: any;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
  }

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened;
  }

  logout(): void {
    this.authService.logout();
  }
}
