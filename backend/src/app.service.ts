import { Injectable, Request } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(request: Request): string {
        console.log("d3efewfwe");
        return 'WTF ' + request;
    }

    // callback intra

    // redirect intra

    // user profile
}
