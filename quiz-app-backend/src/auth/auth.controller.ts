import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {AdminUserDto} from "./admin-user.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Authenticate a user' })
    @ApiBody({
        description: 'User credentials',
        type: AdminUserDto
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Login successful' }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' }
            }
        }
    })
    async login(@Body() body: AdminUserDto) {

        const valid = this.authService.validateUser(body.username, body.password);
        if (!valid) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        return { message: 'Login successful' };
    }
}
