import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>首页</h1>
      <div class="cards">
        <div class="card">
          <h3>用户数量</h3>
          <div class="statistic">1,024</div>
        </div>
        <div class="card">
          <h3>在线用户</h3>
          <div class="statistic">128</div>
        </div>
        <div class="card">
          <h3>今日访问</h3>
          <div class="statistic">3,456</div>
        </div>
        <div class="card">
          <h3>系统消息</h3>
          <div class="statistic">12</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h1 {
      margin-bottom: 20px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
    .card h3 {
      color: #909399;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .statistic {
      font-size: 32px;
      font-weight: bold;
      color: #409eff;
      text-align: center;
    }
  `],
})
export class DashboardComponent {}
