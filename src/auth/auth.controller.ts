import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { SignInAuthDto } from './dto/signin-auth.dto.';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user')
  getUserData(@Query() { token }: { token: string }) {
    return this.authService.getUserData(token);
  }

  @Post('signup')
  signup(@Body() SignUpAuth: SignUpAuthDto) {
    return this.authService.signup(SignUpAuth);
  }

  @Post('signin')
  signin(@Body() SignInAuth: SignInAuthDto) {
    return this.authService.signin(SignInAuth);
  }
}
