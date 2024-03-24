import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { LinkedInService } from './linkedin.service';

@Controller('linkedin')
export class LinkedInController {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Get()
  sayHello() {
    return 'Hello Linkedin';
  }

  @Get('profile')
  async getProfile(@Query('url') profileUrl: string, @Res() res: Response) {
    const profileData =
      await this.linkedInService.extractProfileData(profileUrl);
    res.json(profileData);
  }
}
