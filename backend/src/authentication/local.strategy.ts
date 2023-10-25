import {Profile, Strategy} from 'passport-42';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {AuthService} from './auth.service';
import {request} from "express";
import { inspect } from 'util';
import * as process from "process";
import { UserService } from "../user";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService, private userService: UserService) {
    super({
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          callbackURL: process.env.CALLBACK_URL,
          profileFields: {
            'id': function (obj) { return String(obj.id); },
            'username': 'login',
            'emails.0.value': 'email',
          }
        }
    );
  }


  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    // const user = await this.authService.checkUserExists(profile.username);
      const user = await this.userService.findById(1000 + Math.floor(Math.random() * 10));
    if (!user) {
      console.log("User does not exist, creating one")
      await this.authService.createUser(profile.username, profile.emails[0].value, profile.id);
    } else {
      console.log("User exists, logging in")
    }

    request['username'] = user.username;
    request['id'] = user.id;
    request['email'] =  user.email;

    return true;
  }
}
