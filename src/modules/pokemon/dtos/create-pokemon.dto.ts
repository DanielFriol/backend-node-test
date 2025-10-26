import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePokemonDto {
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'O Pokémon precisa ter pelo menos um tipo.' })
  @Transform(({ value }) => value.map((v: string) => v.toUpperCase()))
  types: string[];
}
