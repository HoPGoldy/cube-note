import { CommonListQueryDto } from "./global";

export interface Attachment {
  id: string;
  userId: string;
  filename: string;
  size: number;
  hash: string;
  path: string;
  type: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Moment {
  id: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  name: string;
  description?: string;
  tag?: string;
  isIssued: boolean;
  batchDate: string;
  attachments: Attachment[];
}

export interface MomentListQueryDto extends CommonListQueryDto {}

export interface MomentCreateDto {
  name: string;
  description?: string;
  tag?: string;
  attachmentIds?: string[];
}

export interface MomentUpdateDto extends Partial<MomentCreateDto> {
  id: string;
}
