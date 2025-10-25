import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePokemonDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @IsString({ message: 'O tipo deve ser uma string.' })
  @IsNotEmpty({ message: 'O tipo não pode estar vazio.' })
  type: string;
}
