import * as md5 from "js-md5";
import {Document, Schema} from "mongoose";
import * as Randomstring from "randomstring";
import mongoose from "../config/db";

export interface IUser extends Document {
    email: string;
    nickname: string;
    password: string;
    salt: string;
    avatarUrl: string;
    meta: {
        createdAt: Date,
        updatedAt: Date,
    };
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    salt: {
        type: String,
        required: false,
    },
    avatarUrl: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

userSchema.pre<IUser>("save", function(next) {
    this.salt = Randomstring.generate({
        length: 5,
        charset: "alphabetic",
    });
    if (this.password) {
        this.password = md5(`${this.password}${this.salt}`);
    }
    next();
});

export const User = mongoose.model<IUser>("User", userSchema);
