import {Context} from "koa";
import {Ctx, JsonController, Post, State} from "routing-controllers";
import Environment from "../config/env";
import {IUser} from "../models/user.model";
import {GalleryService} from "../service/gallery.service";
import {UtilService} from "../service/util.service";

@JsonController()
export class GalleryController {
    constructor(private galleryService: GalleryService,
                private utilService: UtilService) {
    }

    @Post("gallery")
    public async uploadGallery(@Ctx() ctx: Context, @State("user") user: IUser) {
        const gallery: string[] = [];
        for (const i in ctx.request.files) {
            const url = this.utilService.writeFile(ctx.request.files[i], Environment.GALLERYDIR);
            gallery.push(url);
            this.galleryService.galleryModel.create({
                user: user._id,
                imgUrl: url,
            });
        }

        return gallery;
    }

}
