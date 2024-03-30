import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';
import { DockerController } from './docker.controller';

@Module({
  controllers: [DockerController],
  providers: [DockerService],
})
export class DockerModule {}
