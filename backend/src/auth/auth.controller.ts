import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body) {
    try {
      return await this.authService.login(body.username, body.password);
    } catch (error) {
      if (error.message === 'User not found') {
        throw new HttpException('Invalid username or password', HttpStatus.UNAUTHORIZED);
      }
      if (error.message === 'Invalid credentials') {
        throw new HttpException('Invalid username or password', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
