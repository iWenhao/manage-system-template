import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <div class="search-bar">
        <input [(ngModel)]="query roleName" placeholder="角色名称" />
        <button (click)="getList()" class="btn-primary">搜索</button>
        <button (click)="handleAdd()" class="btn-primary">新增</button>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>角色名称</th>
            <th>角色编码</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let role of roleList">
            <td>{{ role.name }}</td>
            <td>{{ role.code }}</td>
            <td>
              <span [class]="role.status === 0 ? 'tag-success' : 'tag-danger'">
                {{ role.status === 0 ? '正常' : '停用' }}
              </span>
            </td>
            <td>
              <button (click)="handleUpdate(role)" class="btn-text">修改</button>
              <button (click)="handleDelete(role)" class="btn-text-danger">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="dialogVisible" class="dialog-overlay" (click)="dialogVisible = false">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h3>{{ dialogTitle }}</h3>
          <div class="form-group">
            <label>角色名称</label>
            <input [(ngModel)]="form.name" />
          </div>
          <div class="form-group">
            <label>角色编码</label>
            <input [(ngModel)]="form.code" />
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
    .btn-text { color: #409eff; background: none; border: none; cursor: pointer; }
    .btn-text-danger { color: #f56c6c; background: none; border: none; cursor: pointer; }
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
export class RoleComponent implements OnInit {
  roleList: any[] = [];
  queryParams = { roleName: '' };
  dialogVisible = false;
  dialogTitle = '';
  form: any = { id: undefined, name: '', code: '', status: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.api.listRole(this.queryParams).subscribe((res) => {
      this.roleList = res.data.list;
    });
  }

  handleAdd(): void {
    this.dialogTitle = '新增角色';
    this.form = { id: undefined, name: '', code: '', status: 0 };
    this.dialogVisible = true;
  }

  handleUpdate(row: any): void {
    this.dialogTitle = '修改角色';
    this.form = { ...row };
    this.dialogVisible = true;
  }

  handleDelete(row: any): void {
    if (confirm('确认删除该角色?')) {
      this.api.deleteRole(row.id).subscribe(() => this.getList());
    }
  }

  submitForm(): void {
    if (this.form.id) {
      this.api.updateRole(this.form.id, this.form).subscribe(() => {
        this.dialogVisible = false;
        this.getList();
      });
    } else {
      this.api.addRole(this.form).subscribe(() => {
        this.dialogVisible = false;
        this.getList();
      });
    }
  }
}
