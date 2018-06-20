import {Context} from "koa";
import {Ctx, Get, JsonController, Post, State} from "routing-controllers";
import Environment from "../config/env";
import {IGallery} from "../models/gallery.model";
import {IUser} from "../models/user.model";
import {GalleryService} from "../service/gallery.service";
import {UtilService} from "../service/util.service";

@JsonController()
export class GalleryController {
    constructor(private galleryService: GalleryService,
                private utilService: UtilService) {
    }

    @Post("gallery")
    public async uploadGallery(@Ctx() ctx: Context, @State("user") user: IUser): Promise<Array<Partial<IGallery>>> {
        const gallery: Array<Partial<IGallery>> = [];
        for (const i in ctx.request.files) {
            const url = this.utilService.writeFile(ctx.request.files[i], Environment.GALLERYDIR);
            const newGallery = await this.galleryService.galleryModel.create({
                user: user._id,
                imgUrl: `${Environment.GALLERYDIR}/${url}`,
            });
            gallery.push({
                imgUrl: newGallery.imgUrl,
                like: newGallery.like,
                watch: newGallery.watch,
                createdAt: newGallery.createdAt,
            });
        }
        return gallery;
    }

    @Get("gallery/my")
    public async getOwnGallery(@State("user") user: IUser): Promise<Array<Partial<IGallery>>> {
        return await this.galleryService.galleryModel.find({user: user._id})
            .sort("-createdAt")
            .select("imgUrl like watch createdAt -_id");
    }

}
