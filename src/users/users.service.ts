import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';

import { CreateUserDto } from './createUser.dto';

@Injectable()
export class UserService {
  //через это имеем доступ к бд и к конкретной таблице User
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAllUser() {
    return this.userRepository.find();
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ${id} not found`);
    }
    return user;
  }

  async createUser(body: CreateUserDto) {
    const name = body.name;
    const user = this.userRepository.create({ name });
    return await this.userRepository.save(user);
  }
}
