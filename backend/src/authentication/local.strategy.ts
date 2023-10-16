import { Strategy, Profile } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../authentication/auth.service';

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
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        'profileUrl': 'url',
        'emails.0.value': 'email',
        'phoneNumbers.0.value': 'phone',
        'photos.0.value': 'image_url'
      }
      }
    );
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    console.log(profile);
    const user = await this.authService.checkUserExists(profile.username, profile.emails[0].value);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
