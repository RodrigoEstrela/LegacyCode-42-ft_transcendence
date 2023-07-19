import { EntityRepository, Repository } from 'typeorm';
import { Auth } from '.';

@EntityRepository(Auth)
export class AuthRepository extends Repository<Auth> {
  async createUser(username: string /* Add other user properties as arguments */): Promise<Auth> {
    const user = this.create({username,
      // Assign other user properties...
    });

    return this.save(user); // Save the user using the repository's save() method
  }

  // Additional repository methods...
}

export default AuthRepository;