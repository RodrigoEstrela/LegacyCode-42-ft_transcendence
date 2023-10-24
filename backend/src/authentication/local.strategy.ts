import {Profile, Strategy} from 'passport-42';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {AuthService} from './auth.service';
import {request} from "express";
import { inspect } from 'util';
import * as process from "process";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
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
    const user = await this.authService.checkUserExists(profile.username, profile.emails[0].value);

    if (!user) {
      console.log("User does not exist, creating one")
      await this.authService.createUser(profile.username, profile.emails[0].value, profile.id);
    } else {
      console.log("User exists, logging in")
    }
    request['username'] = profile.username;
    request['id'] = profile.id;
    request['email'] =  profile.emails[0].value;

    return true;
  }
}
