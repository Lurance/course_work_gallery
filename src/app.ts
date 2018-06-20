import * as Application from "koa";
import * as koaBody from "koa-body";
import * as json from "koa-json";
import * as jwt from "koa-jwt";
import * as serve from "koa-static";
import ms = require("ms");
import "reflect-metadata";
import {useContainer, useKoaServer} from "routing-controllers";
import {Container} from "typedi";
import Environment from "./config/env";
import {GalleryController} from "./controllers/gallery.controller";
import {UserController} from "./controllers/user.controller";

useContainer(Container);

const createApp = (): Application => {
    const app = new Application();

    if (Environment.IDENTITY !== "production") {
        app.use(json());
    }

    app.use(serve(__dirname + "/../frontend/dist", {
        maxAge: Environment.IDENTITY === "production" ? ms("20d") : 0,
    }));

    app.use(serve(__dirname + "/../upload", {
        maxAge: ms("20d"),
    }));

    app.use(jwt({
        secret: Environment.JWTSECRET,
    }).unless({
        path: [
            /\/api\/login/,
            /\/api\/signup/,
        ],
    }));

    app.use(koaBody({multipart: true}));

    useKoaServer(app, {
        routePrefix: "/api/",

        controllers: [
            UserController,
            GalleryController,
        ],

        classTransformer: false,

        development: Environment.IDENTITY === "development",
    });

    return app;
};

export default createApp;
