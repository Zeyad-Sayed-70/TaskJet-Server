export class UpdateTaskDto {
  readonly id: string;
  readonly ttile?: string;
  readonly describtion?: string;
  readonly dueDate?: Date;
  readonly tags?: string[];
  readonly isCompleted?: boolean;
}
