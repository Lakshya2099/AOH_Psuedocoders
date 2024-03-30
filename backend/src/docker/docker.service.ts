import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { CreateContainer } from './dto/CreateContainerDto';
import { exec } from 'child_process';

@Injectable()
export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async findContainerById(id: string): Promise<Docker.ContainerInspectInfo> {
    const container = this.docker.getContainer(id);
    return await container.inspect();
  }

  async getAllContainers() {
    return await this.docker.listContainers({ all: true });
  }

  async getStats(id: string) {
    const container = this.docker.getContainer(id);
    const stats = await new Promise<any>((resolve, reject) => {
      container.stats({ stream: false }, (err, stats) => {
        if (err) {
          return reject(err);
        }
        const cpuUsage = stats.cpu_stats.cpu_usage.total_usage;
        const memoryUsage = stats.memory_stats && stats.memory_stats.usage ? stats.memory_stats.usage : 'N/A';
        const networks = stats.networks || 'N/A';
        resolve({ cpuUsage, memoryUsage, networks });
      });
    });
    return stats;
  }

  async getInfo(id: string) {
    const container = this.docker.getContainer(id);
    const inspectionInfo = await container.inspect();
    return inspectionInfo;
  }

  async getLogs(id: string): Promise<string[]> {
    const container = this.docker.getContainer(id);
    const regex = /\u001b\[[0-9;]*m/g;
    const logs = await container.logs({ stdout: true, stderr: true });
    const logString = logs.toString();
    return logString.split('\n').map(line => line.replace(regex, ''));
  }

  async stopContainer(id: string) {
    const container = this.docker.getContainer(id);
    return await container.stop();
  }

  async startContainer(id: string) {
    const container = this.docker.getContainer(id);
    return await container.start();
  }

  async containerURL() {
    const containerInfo = await this.docker.listContainers({ all: false });
    const info = []
    for (const containerInfoItem of containerInfo) {
      info.push({
        "id" : containerInfoItem.Id.slice(0, 10),
        "name" : containerInfoItem.Names[0].slice(1),
        "url" : "http://" + containerInfoItem.Ports[0].IP +":" + containerInfoItem.Ports[0].PublicPort
      });
    }
    return info;
  }

  async getContainerURL(id: string) {
    const containerInfo = (await this.docker.listContainers({ all: false }))
    const info = []
    for (const containerInfoItem of containerInfo) {
      if(containerInfoItem.Id.slice(0, 10).includes(id)) {
        info.push({
          "name" : containerInfoItem.Names[0].slice(1),
          "url" : "http://" + containerInfoItem.Ports[0].IP +":" + containerInfoItem.Ports[0].PublicPort
        });
      }
    }
    return info[0];
  }

  async createCodeInstance(container: CreateContainer) {
    return new Promise((resolve, reject) => {
      exec(`./src/docker/utils/port ${container.name.toLowerCase()} ${container.package} $HOME/${container.filepath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing the script: ${error}`);
          reject(error);
          return;
        }

        const outputLines = stdout.trim().split('\n');

        const containerId = outputLines[outputLines.length - 1];

        console.log(`Container created with ID: ${containerId}`);

        resolve(containerId.slice(0, 10));
      });
    }) 
  }

  async removeContainer(id: string) {
    try {
      const container = this.docker.getContainer(id);

      await container.remove({ force: true });
      console.log(`Container ${id} removed.`);

      const containerInfo = await container.inspect();
      const imageName = containerInfo.Image;

      const image = this.docker.getImage(imageName);
      // await image.remove({ force: true });
      console.log(`Image ${imageName} removed.`);

      return { success: true };
    } catch (err) {
      console.error(`Error removing container ${id} or associated image:`, err);
      return { success: false, error: err.message };
    }
  }
}

