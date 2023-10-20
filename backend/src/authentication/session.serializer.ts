import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { User } from '../entities';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, user: User) => void): any {
    if (!user) {
      done(null, null);
    }
    done(null, user);
  }
  async deserializeUser(
      payload: any,
      done: (err: Error, user: User) => void,
  ): Promise<any> {

    const user = await this.userService.findOne(payload);

    if (!user) {
      done(null, null);
    }
    done(null, user);
  }
}
