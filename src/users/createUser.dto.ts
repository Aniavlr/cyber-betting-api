import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be string' })
  @IsNotEmpty({ message: 'Name should not empty' })
  @MinLength(2, { message: 'Name must be more than 2 characters' })
  name: string;
}
