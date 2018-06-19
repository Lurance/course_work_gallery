import Vue from 'vue'

const Fuck  =  Vue.extend({
    data() {
        return {
            status: {
                isLogin: false,
                isGallery: true,
                doLogin: false,
                doRegister: false
            }
        }
    },
    methods: {
    }
})

new Fuck().$mount('#root')