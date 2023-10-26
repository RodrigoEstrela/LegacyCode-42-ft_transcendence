import { EntityRepository, Repository } from 'typeorm';
import  UserDto  from './user.dto';
import { default as User } from "../entities/user.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(userDto: UserDto): Promise<User> {
        const user = this.create();
        return this.save(user); // Save the user using the repository's save() method
      }
}

export default UserRepository;