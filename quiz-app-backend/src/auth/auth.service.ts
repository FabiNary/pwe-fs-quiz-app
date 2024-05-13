import { Injectable } from '@nestjs/common';
import {join} from "path";
import {AdminUserDto} from "./admin-user.dto";
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AuthService {
  private readonly baseDir: string;

  constructor(
      private readonly configService: ConfigService
  ) {
    this.baseDir = configService.get<string>('QUIZ_DATA_DIR');
  }

  getAdminUsers(): AdminUserDto[] {
    const adminUsersFile = join(this.baseDir, 'adminUsers.json');

    if(!existsSync(adminUsersFile)) {
      writeFileSync(adminUsersFile, JSON.stringify([], null, 2))
      return [];
    }

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
