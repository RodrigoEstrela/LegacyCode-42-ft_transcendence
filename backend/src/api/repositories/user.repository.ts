import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(name: string /* Add other user properties as arguments */): Promise<User> {
    const user = this.create({
      name,
      // Assign other user properties...
    });

    return this.save(user); // Save the user using the repository's save() method
  }

  // Additional repository methods...
}