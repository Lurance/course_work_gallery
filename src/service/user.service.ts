import * as md5 from "js-md5";
import {sign} from "jsonwebtoken";
import {Model} from "mongoose";
import {Service} from "typedi";
import Environment from "../config/env";
import {IUser, User} from "../modes/user.model";

@Service()
export class UserService {
    public userModel: Model<IUser>;

    constructor() {
        this.userModel = User;
    }

    public async saveUser(email: string, password: string, nickname: string): Promise<IUser | boolean> {
        if (await this.userModel.count({email}) === 0) {
            return await this.userModel.create({
                email,
                nickname,
                password,
            });
        } else {
            return false;
        }
    }

    public async getUserFromEmailAndPassword(email: string, password: string): Promise<IUser | boolean> {
        const u = await this.userModel.findOne({email});
        if (u) {
            const salt = u.salt;
            const hashPwd = md5(`${password}${salt}`);
            return hashPwd === u.password ? u : false;
        } else {
            return false;
        }
    }

    public signUser(user: IUser): string {
        const payload = {
            _id: user._id,
            email: user.email,
            nickname: user.nickname,
        };
        return sign(payload, Environment.JWTSECRET, {
            expiresIn: Environment.JWTEXPIRESIN,
        });
    }
}
