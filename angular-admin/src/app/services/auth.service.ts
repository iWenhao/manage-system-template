import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: any;
  };
}

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private userInfoKey = 'userInfo';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { username, password }).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.data.accessToken);
        localStorage.setItem(this.refreshTokenKey, res.data.refreshToken);
        localStorage.setItem(this.userInfoKey, JSON.stringify(res.data.user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userInfoKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserInfo(): UserInfo | null {
    const info = localStorage.getItem(this.userInfoKey);
    return info ? JSON.parse(info) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserPermissions(): Observable<any> {
    return this.http.get('/api/auth/info');
  }
}
