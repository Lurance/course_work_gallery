import {Document, Schema} from "mongoose";
import mongoose from "../config/db";
import {IUser} from "./user.model";

export interface IGallery extends Document {
    user: IUser | string;
    imgUrl: string;
    watch: number;
    like: number;
    createdAt: Date | string;
    updatedAt: Date;
}

const gallerySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    imgUrl: {
        type: String,
        required: true,
    },
    watch: {
        type: Number,
        required: true,
        default: 0,
    },
    like: {
        type: Number,
        required: true,
        default: 0,
    },
}, {timestamps: true});

export const Gallery = mongoose.model<IGallery>("Gallery", gallerySchema);
