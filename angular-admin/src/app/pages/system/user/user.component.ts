import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <div class="search-bar">
        <input [(ngModel)]="queryParams.username" placeholder="用户名" />
        <button (click)="getList()" class="btn-primary">搜索</button>
        <button (click)="resetQuery()" class="btn-default">重置</button>
        <button (click)="handleAdd()" class="btn-primary">新增</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>昵称</th>
            <th>手机号</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of userList">
            <td>{{ user.username }}</td>
            <td>{{ user.nickname }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <span [class]="user.status === 0 ? 'tag-success' : 'tag-danger'">
                {{ user.status === 0 ? '正常' : '停用' }}
              </span>
            </td>
            <td>
              <button (click)="handleUpdate(user)" class="btn-text">修改</button>
              <button (click)="handleDelete(user)" class="btn-text-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <span>共 {{ total }} 条</span>
      </div>

      <!-- 对话框 -->
      <div *ngIf="dialogVisible" class="dialog-overlay" (click)="dialogVisible = false">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h3>{{ dialogTitle }}</h3>
          <div class="form-group">
            <label>用户名</label>
            <input [(ngModel)]="form.username" [disabled]="!!form.id" />
          </div>
          <div class="form-group">
            <label>昵称</label>
            <input [(ngModel)]="form.nickname" />
          </div>
          <div class="form-group" *ngIf="!form.id">
            <label>密码</label>
            <input type="password" [(ngModel)]="form.password" />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input [(ngModel)]="form.phone" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select [(ngModel)]="form.status">
              <option [value]="0">正常</option>
              <option [value]="1">停用</option>
            </select>
          </div>
          <div class="dialog-footer">
            <button (click)="dialogVisible = false">取消</button>
            <button (click)="submitForm()" class="btn-primary">确定</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container { background: #fff; padding: 20px; border-radius: 8px; }
    .search-bar { margin-bottom: 20px; display: flex; gap: 10px; }
    .search-bar input { padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #ebeef5; text-align: left; }
    .data-table th { background: #f5f7fa; }
    .tag-success { color: #67c23a; }
    .tag-danger { color: #f56c6c; }
    .btn-primary { padding: 8px 16px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    .btn-default { padding: 8px 16px; border: 1px solid #dcdfe6; border-radius: 4px; cursor: pointer; }
    .btn-text { color: #409eff; background: none; border: none; cursor: pointer; }
    .btn-text-danger { color: #f56c6c; background: none; border: none; cursor: pointer; }
    .pagination { margin-top: 20px; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: #fff; padding: 20px; border-radius: 8px; width: 500px; }
    .dialog h3 { margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; color: #606266; }
    .form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; }
    .dialog-footer { text-align: right; margin-top: 20px; }
    .dialog-footer button { margin-left: 10px; }
  `],
})
export class UserComponent implements OnInit {
  userList: any[] = [];
  total = 0;
  queryParams = { pageNum: 1, pageSize: 10, username: '' };
  dialogVisible = false;
  dialogTitle = '';
  form: any = { id: undefined, username: '', nickname: '', password: '', phone: '', status: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.api.listUser(this.queryParams).subscribe((res) => {
      this.userList = res.data.list;
      this.total = res.data.total;
    });
  }

  resetQuery(): void {
    this.queryParams.username = '';
    this.getList();
  }

  handleAdd(): void {
    this.dialogTitle = '新增用户';
    this.form = { id: undefined, username: '', nickname: '', password: '', phone: '', status: 0 };
    this.dialogVisible = true;
  }

  handleUpdate(row: any): void {
    this.dialogTitle = '修改用户';
    this.form = { ...row };
    this.dialogVisible = true;
  }

  handleDelete(row: any): void {
    if (confirm('确认删除该用户?')) {
      this.api.deleteUser(row.id).subscribe(() => {
        this.getList();
      });
    }
  }

  submitForm(): void {
    if (this.form.id) {
      this.api.updateUser(this.form.id, this.form).subscribe(() => {
        this.dialogVisible = false;
        this.getList();
      });
    } else {
      this.api.addUser(this.form).subscribe(() => {
        this.dialogVisible = false;
        this.getList();
      });
    }
  }
}
