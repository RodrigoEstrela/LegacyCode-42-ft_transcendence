import {Profile, Strategy} from 'passport-42';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable} from '@nestjs/common';
import {AuthService} from './auth.service';
import {request} from "express";
import { inspect } from 'util';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
          clientID: "u-s4t2ud-f81ae818459e61942c018dc4a81daa38227753acade2e384dfce29a493bb76ba",
          clientSecret: "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",
          callbackURL: "http://localhost:5000/auth/42/callback",
          profileFields: {
            'id': function (obj) { return String(obj.id); },
            'username': 'login',
            'displayName': 'displayname',
            'emails.0.value': 'email',
          }
        }
    );
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    // console.log("id:" + profile.id);
    // console.log("username: " + profile.username);
    // console.log("email: " + profile.emails[0].value);
    const user = await this.authService.checkUserExists(profile.username, profile.emails[0].value);

    if (!user) {
      console.log("User does not exist, creating one")
      await this.authService.createUser(profile.username, profile.emails[0].value, profile.id);
      // return await this.authService.login(profile.username, profile.id, profile.emails[0].value);
    } else {
      console.log("User exists, logging in")
      // return await this.authService.login(profile.username, profile.id, profile.emails[0].value);
    }
    request['username'] = profile.username;
    request['id'] = profile.id;
    request['email'] =  profile.emails[0].value;

    return true;
  }
}
