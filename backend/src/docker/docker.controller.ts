import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { DockerService } from './docker.service';
import { CreateContainer } from './dto/CreateContainerDto';

@Controller('docker')
export class DockerController {
  constructor(
    private readonly dockerService: DockerService
  ) {}

  @Get()
  async findAll() {
    return await this.dockerService.getAllContainers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.dockerService.findContainerById(id);
  }

  @Get('stats/:id')
  async getStats(@Param('id') id: string) {
    var stats = await this.dockerService.getStats(id);
    return stats;
  }

  @Get('logs/:id')
  startSendingLogs(@Param('id') containerId: string) {
    return this.dockerService.getLogs(containerId);
  }

  @Get('info/:id')
  async getInfo(@Param('id') id: string) {
    return await this.dockerService.getInfo(id);
  }

  @Post('container/stop/:id')
  async stopContainer(@Param('id') id: string) {
    return await this.dockerService.stopContainer(id);
  }

  @Get('container/url')
  async getDockerURL() {
    return await this.dockerService.containerURL();
  }

  @Get('container/url/:id')
  async getDockerURLbyId(@Param('id') id: string) {
    return await this.dockerService.getContainerURL(id);
  }

  @Post('container/create')
  async createContainer(@Body() createContainerDto: CreateContainer) {
    return await this.dockerService.createCodeInstance(createContainerDto);
  }

  @Post('container/start/:id')
  async startContainer(@Param('id') id: string) {
    return await this.dockerService.startContainer(id);
  }

  @Post('container/remove/:id')
  async removeContainer(@Param('id') id: string, @Res() res: Response) {
    const result = await this.dockerService.removeContainer(id);
    if (result.success) {
      return res.status(200).json({ message: 'Container and image removed successfully' });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }
}
