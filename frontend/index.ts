import Vue from 'vue'
import Axios from 'axios'
import {authResponse} from '../src/controllers/user.controller'

const Fuck = Vue.extend({
    data() {
        return {
            status: {
                isLogin: false,
                isGallery: true,
                doLogin: false,
                doRegister: false,
                doDropdown: false
            },
            userInfo: {
                nickname: '',
                avatarUrl: '',
                email: '',
                token: ''
            },
            signupForm: {
                email: '',
                password: '',
                nickname: '',
                repassword: ''
            },
            loginForm: {
                email: '',
                password: ''
            }
        }
    },
    created: function () {
        let authInfo: authResponse | string | null = localStorage.getItem('authInfo')
        if (authInfo) {
            authInfo = JSON.parse(authInfo)
            if ((authInfo as authResponse).jwt.expiresOn > Date.now()) {
                this.setLoginStatus((authInfo as authResponse).nickname, (authInfo as authResponse).email,
                    (authInfo as authResponse).avatarUrl, (authInfo as authResponse).jwt.token)
            } else {
                alert('您的登录状态已过期，请重新登录')
                this.doLogout()
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
            } else if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.signupForm.email)) {
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
        },
        async doLogin() {
            if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.loginForm.email)) {
                alert('邮箱格式错误')
            } else {
                try {
                    const res = await Axios.post<authResponse>('/api/login', this.loginForm)
                    this.status.doLogin = false
                    alert('登录成功')
                    this.setLoginStatus(res.data.nickname, res.data.email, res.data.avatarUrl, res.data.jwt.token)
                    localStorage.setItem('authInfo', JSON.stringify(res.data))
                } catch (e) {
                    alert('用户名或密码错误')
                }
            }
        },
        doLogout() {
            this.status.isLogin = false
            this.status.doDropdown = false
            localStorage.clear()
        },
        setLoginStatus(nickname: string, email: string, avatarUrl: string, token: string) {
            this.status.isLogin = true
            this.userInfo.nickname = nickname
            this.userInfo.email = email
            this.userInfo.avatarUrl = avatarUrl
            this.userInfo.token = token
        }
    }
})

new Fuck().$mount('#root')