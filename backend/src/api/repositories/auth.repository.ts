import { EntityRepository, Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';

@EntityRepository(Auth)
export class AuthRepository extends Repository<Auth> {
  async createUser(name: string /* Add other user properties as arguments */): Promise<Auth> {
    const user = this.create({
      name,
      // Assign other user properties...
    });

    return this.save(user); // Save the user using the repository's save() method
  }

  // Additional repository methods...
}