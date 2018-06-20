import {Model} from "mongoose";
import {Service} from "typedi";
import {Gallery, IGallery} from "../models/gallery.model";

@Service()
export class GalleryService {
    public galleryModel: Model<IGallery>;

    constructor() {
        this.galleryModel = Gallery;
    }

}
