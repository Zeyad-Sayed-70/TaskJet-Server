import { Module } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';
import { LinkedInController } from './linkedin.controller';

@Module({
  imports: [],
  controllers: [LinkedInController],
  providers: [LinkedInService],
})
export class LinkedInModule {}
