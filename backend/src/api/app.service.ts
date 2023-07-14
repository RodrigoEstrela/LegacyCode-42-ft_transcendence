import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
	return 'Hello World!<br>Hallo Welt!<br>Ola Mundo! \
<br><br>Teste1<br>Teste2<br>';
  }
}
