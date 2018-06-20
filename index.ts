import Environment from './src/config/env'
import createApp from './src/app'
import * as path from "path"
import * as fs from "fs"


export default (async () => {
    try {
        const server = createApp()

        fs.access(Environment.UPLOADROOT, err => {
            if (err) {
                fs.mkdir(Environment.UPLOADROOT, () => {})
            }
        })

        fs.access(path.join(Environment.UPLOADROOT, Environment.AVATARDIR), err => {
            if (err) {
                fs.mkdir(path.join(Environment.UPLOADROOT, Environment.AVATARDIR), () => {})
            }
        })

        fs.access(path.join(Environment.UPLOADROOT, Environment.GALLERYDIR), err => {
            if (err) {
                fs.mkdir(path.join(Environment.UPLOADROOT, Environment.GALLERYDIR), () => {})
            }
        })

        server.listen(Environment.PORT, Environment.HOST, () => {
            console.log(`Server is listening on http://${Environment.HOST}:${Environment.PORT}, in ${Environment.IDENTITY} mode!`)
        })
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})()