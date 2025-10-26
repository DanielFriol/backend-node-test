import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTypeDto {
  @IsString({ message: 'O nome do tipo deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do tipo não pode estar vazio.' })
  @Transform(({ value }) => value.toUpperCase())
  name: string;
}
