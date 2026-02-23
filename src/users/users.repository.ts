import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly datasource: DataSource) {
    super(User, datasource.createEntityManager());
  }

  private readonly logger = new Logger(UserRepository.name);

  async findById(id: User['id']): Promise<User> {
    const user = await this.findOneBy({ id: id });
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const insertResult = await this.createQueryBuilder()
      .insert()
      .into(User)
      .values(dto)
      .returning('*')
      .execute();
    const storedUser = this.create(insertResult.raw[0] as User);
    this.logger.debug(`Stored user: ${JSON.stringify(storedUser)}`);
    return storedUser;
  }

  async findByPhoneNumber(phone: string) {
    const user = await this.findOne({
      where: { phone: phone },
    });
    return user;
  }
}
