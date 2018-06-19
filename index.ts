import Environment from './src/config/env'
import createApp from './src/app'


export default (async () => {
    try {
        const server = createApp()


        server.listen(Environment.PORT, Environment.HOST, () => {
            console.log(`Server is listening on http://${Environment.HOST}:${Environment.PORT}, in ${Environment.IDENTITY} mode!`)
        })
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
})()