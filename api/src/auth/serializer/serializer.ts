import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { UserEntity } from "src/user/model/user.entity";
import { AuthService } from "../service/auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        private readonly authService: AuthService,
    ) {
        super();
    }
    serializeUser(user: UserEntity, done: Function) {
        console.log('Serialize User');
        done(null, user);
    }

    async deserializeUser(payload: any, done: Function) {
        const user = await this.authService.findUser(payload.id);
        console.log('Deserialize User');
        console.log(user);
        return user ? done(null, user) : done(null, null);
    }
}