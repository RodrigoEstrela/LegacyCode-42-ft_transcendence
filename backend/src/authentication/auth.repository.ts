import { EntityRepository, Repository } from 'typeorm';
import { User } from '.';

@EntityRepository(User)
export class AuthRepository extends Repository<User> {
  async createUser(username: string /* Add other user properties as arguments */): Promise<User> {
    const user = this.create({username,
      // Assign other user properties...
    });

    return this.save(user); // Save the user using the repository's save() method
  }

  // Additional repository methods...
}

export default AuthRepository;