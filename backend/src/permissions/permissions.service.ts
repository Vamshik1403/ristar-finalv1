import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async setPermission(data: any) {
    const existing = await this.prisma.permission.findFirst({
      where: { userId: data.userId, module: data.module },
    });

    if (existing) {
      return this.prisma.permission.update({
        where: { id: existing.id },
        data,
      });
    }

    return this.prisma.permission.create({ data });
  }

  async getPermissions(userId: number) {
    return this.prisma.permission.findMany({ where: { userId } });
  }
}
