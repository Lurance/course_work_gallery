import Vue from 'vue'
import Axios from 'axios'

const Fuck  =  Vue.extend({
    data() {
        return {
            status: {
                isLogin: false,
                isGallery: true,
                doLogin: false,
                doRegister: false
            },
            signupForm: {
                email: '',
                password: '',
                nickname: '',
                repassword: ''
            }
        }
    },
    methods: {
        resetSignupForm() {
            this.signupForm = {
                email: '',
                password: '',
                nickname: '',
                repassword: ''
            }
        },
        async doSignup() {
            if (this.signupForm.password !== this.signupForm.repassword) {
                alert('两次输入的密码不一致')
            } else if (this.signupForm.email === '' || this.signupForm.nickname === ''
                || this.signupForm.password === '' || this.signupForm.repassword === '') {
                alert('提交的信息不合法')
            } else if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.signupForm.email))  {
                alert('邮箱格式错误')
            } else {
                try {
                    await Axios.post('/api/signup', this.signupForm)
                    this.status.doRegister = false
                    alert('注册成功')
                } catch (e) {
                    alert('注册失败')
                }
            }
            this.resetSignupForm()
        }
    }
})

new Fuck().$mount('#root')