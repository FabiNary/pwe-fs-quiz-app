import { Injectable } from '@nestjs/common';
import {join} from "path";
import {AdminUserDto} from "./admin-user.dto";
import { existsSync, readFileSync } from 'fs';

@Injectable()
export class AuthService {
  private readonly baseDir = join(__dirname, '..', 'data');

  getAdminUsers(): AdminUserDto[] {
    const adminUsersFile = join(this.baseDir, 'adminUsers.json');

    if(!existsSync(adminUsersFile)) return [];

    return JSON.parse(readFileSync(adminUsersFile, 'utf-8'));
  }

  validateUser(username: string, password: string): boolean {
    const adminUsers = this.getAdminUsers();


    const existingUser = adminUsers.find((adminUser) => {
      if(username === adminUser.username && password === adminUser.password) return adminUser;
      return;
    });

    return !!existingUser;
  }
}
