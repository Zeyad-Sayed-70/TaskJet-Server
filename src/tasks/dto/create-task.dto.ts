export class CreateTaskDto {
  readonly userId: string;
  readonly ttile: string;
  readonly describtion: string;
  readonly dueDate?: Date;
  readonly tags?: string[];
}
