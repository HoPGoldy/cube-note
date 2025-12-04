import { PrismaClient } from "@db/client";
import { ErrorNotFound } from "@/types/error";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class TagService {
  constructor(private options: ServiceOptions) {}

  async createTag(title: string, color?: string, groupId?: string) {
    return await this.options.prisma.tag.create({
      data: { title, color, groupId },
    });
  }

  async updateTag(
    id: string,
    data: { title?: string; color?: string; groupId?: string },
  ) {
    const tag = await this.options.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new ErrorNotFound("Tag not found");

    return await this.options.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async deleteTag(id: string) {
    const tag = await this.options.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new ErrorNotFound("Tag not found");

    await this.options.prisma.tag.delete({ where: { id } });
  }

  async getTagList() {
    return await this.options.prisma.tag.findMany({
      include: { group: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async getTagById(id: string) {
    const tag = await this.options.prisma.tag.findUnique({
      where: { id },
      include: { group: true },
    });
    if (!tag) throw new ErrorNotFound("Tag not found");
    return tag;
  }

  async createGroup(title: string) {
    return await this.options.prisma.tagGroup.create({
      data: { title },
    });
  }

  async updateGroup(id: string, title: string) {
    const group = await this.options.prisma.tagGroup.findUnique({
      where: { id },
    });
    if (!group) throw new ErrorNotFound("TagGroup not found");

    return await this.options.prisma.tagGroup.update({
      where: { id },
      data: { title },
    });
  }

  async deleteGroup(id: string) {
    const group = await this.options.prisma.tagGroup.findUnique({
      where: { id },
    });
    if (!group) throw new ErrorNotFound("TagGroup not found");

    // 删除分组前，先将该分组下的标签清除关联
    await this.options.prisma.tag.updateMany({
      where: { groupId: id },
      data: { groupId: null },
    });

    await this.options.prisma.tagGroup.delete({ where: { id } });
  }

  async getGroupList() {
    return await this.options.prisma.tagGroup.findMany({
      include: { tags: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async getGroupById(id: string) {
    const group = await this.options.prisma.tagGroup.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!group) throw new ErrorNotFound("TagGroup not found");
    return group;
  }
}
