import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // ==================== 用户管理 ====================
  listUser(params?: any): Observable<any> {
    return this.http.get('/api/user/list', { params: this.toHttpParams(params) });
  }
  getUser(id: number): Observable<any> {
    return this.http.get(`/api/user/${id}`);
  }
  addUser(data: any): Observable<any> {
    return this.http.post('/api/user', data);
  }
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`/api/user/${id}`, data);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`/api/user/${id}`);
  }
  resetUserPwd(id: number, password: string): Observable<any> {
    return this.http.put(`/api/user/${id}/reset-pwd`, { password });
  }

  // ==================== 角色管理 ====================
  listRole(params?: any): Observable<any> {
    return this.http.get('/api/role/list', { params: this.toHttpParams(params) });
  }
  getAllRole(): Observable<any> {
    return this.http.get('/api/role/all');
  }
  getRole(id: number): Observable<any> {
    return this.http.get(`/api/role/${id}`);
  }
  addRole(data: any): Observable<any> {
    return this.http.post('/api/role', data);
  }
  updateRole(id: number, data: any): Observable<any> {
    return this.http.put(`/api/role/${id}`, data);
  }
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`/api/role/${id}`);
  }

  // ==================== 菜单管理 ====================
  listMenu(params?: any): Observable<any> {
    return this.http.get('/api/menu/list', { params: this.toHttpParams(params) });
  }
  getMenu(id: number): Observable<any> {
    return this.http.get(`/api/menu/${id}`);
  }
  addMenu(data: any): Observable<any> {
    return this.http.post('/api/menu', data);
  }
  updateMenu(id: number, data: any): Observable<any> {
    return this.http.put(`/api/menu/${id}`, data);
  }
  deleteMenu(id: number): Observable<any> {
    return this.http.delete(`/api/menu/${id}`);
  }
  getUserMenus(): Observable<any> {
    return this.http.get('/api/menu/user/menus');
  }

  private toHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
