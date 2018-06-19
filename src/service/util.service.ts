import * as fs from "fs";
import * as path from "path";
import * as Randomstring from "randomstring";
import {Service} from "typedi";
import Environment from "../config/env";

@Service()
export class UtilService {
    public writeFile(file, extDir: string) {
        const filename = `${Randomstring.generate(20)}.${file.name.split(".")[1]}`;
        const filePath = path.join(path.join(Environment.UPLOADROOT, extDir), filename);
        const reader = fs.createReadStream(file.path);
        const writer = fs.createWriteStream(filePath);
        reader.pipe(writer);

        return filename;
    }
}
