import {Context} from "koa";
import ms = require("ms");
import {
    BadRequestError,
    Body,
    BodyParam, Ctx,
    ForbiddenError,
    JsonController,
    Post,
    Put, State,
} from "routing-controllers";
import Environment from "../config/env";
import {IUser} from "../models/user.model";
import {UserService} from "../service/user.service";
import {UtilService} from "../service/util.service";

export interface IAuthResponse {
    jwt: {
        token: string;
        expiresOn: number;
    };
    nickname: string;
    email: string;
    avatarUrl: string;
}

@JsonController()
export class UserController {
    constructor(private userService: UserService, private utilService: UtilService) {
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
                         @BodyParam("password", {required: true}) password: string): Promise<IAuthResponse> {
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

    @Put("userinfo")
    public async doUpdateUserinfo(@Ctx() ctx: Context, @BodyParam("nickname", {required: true}) nickname: string,
                                  @BodyParam("email") email: string,
                                  @State("user") user: IUser): Promise<Partial<IUser>> {
        const file = ctx.request.files.file;
        const filename = file ? this.utilService.writeFile(file, Environment.AVATARDIR) : null;
        if (/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(email)) {
            if (filename) {
                return await this.userService.userModel.findOneAndUpdate({_id: user._id}, {
                    avatarUrl: `${Environment.AVATARDIR}/${filename}`,
                    email,
                    nickname,
                }, {new: true}).select("avatarUrl nickname email -_id") as Partial<IUser>;
            } else {
                return await this.userService.userModel.findOneAndUpdate({_id: user._id}, {
                    email,
                    nickname,
                }, {new: true}).select("avatarUrl nickname email -_id") as Partial<IUser>;
            }
        } else {
            throw new BadRequestError();
        }
    }

}
