import ms = require("ms");
import {BadRequestError, BodyParam, ForbiddenError, JsonController, Post} from "routing-controllers";
import Environment from "../config/env";
import {IUser} from "../modes/user.model";
import {UserService} from "../service/user.service";

@JsonController()
export class UserController {
    constructor(private userService: UserService) {
    }

    @Post("signup")
    public async doSignup(@BodyParam("email", {required: true}) email: string,
                          @BodyParam("nickname", {required: true}) nickname: string,
                          @BodyParam("password", {required: true}) password: string): Promise<{ status: number }> {
        if (/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(email)) {
            const u = await this.userService.saveUser(email, nickname, password);
            if (u) {
                return {
                    status: 1,
                };
            }
        }
        throw new BadRequestError();
    }

    @Post("login")
    public async doLogin(@BodyParam("email", {required: true}) email: string,
                         @BodyParam("password", {required: true}) password: string): Promise<any> {
        const u = await this.userService.getUserFromEmailAndPassword(email, password);
        if (u) {
            const token = this.userService.signUser(u as IUser);
            return {
                jwt: {
                    token,
                    expiresOn: Date.now() + ms(Environment.JWTEXPIRESIN),
                },
                nickname: (u as IUser).nickname,
                email: (u as IUser).email,
                avatarUrl: (u as IUser).avatarUrl,
            };
        } else {
            throw new ForbiddenError();
        }
    }
}
