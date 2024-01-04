import { Injectable } from "@angular/core";
import { Socket, SocketIoConfig } from "ngx-socket-io";
import { tokenGetter } from "src/app/app.module";

const config: SocketIoConfig = {
	url: 'http://localhost:3000', options: {
		autoConnect: true,
		reconnection: true,
		reconnectionDelay: 1,
    	extraHeaders: {
			Authorization: tokenGetter()
    }
  }
};

@Injectable({providedIn: 'root'})
export class CustomSocket extends Socket {
	constructor() {
		super(config)
	}
}
