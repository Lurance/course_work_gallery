import Axios from "axios";
import Vue from "vue";
import {IAuthResponse} from "../src/controllers/user.controller";
import {IGallery} from "../src/models/gallery.model";
import {IUser} from "../src/models/user.model";

const Fuck = Vue.extend({
    data() {
        return {
            status: {
                isLogin: false,
                isGallery: true,
                doLogin: false,
                doRegister: false,
                doDropdown: false,
                doEdit: {
                    status: false,
                    editNickname: false,
                    editEmail: false,
                },
                doUpload: false,
            },
            userInfo: {
                nickname: "",
                avatarUrl: "",
                email: "",
            },
            authInfo: {
                token: "",
                expiresOn: null,
            },
            signupForm: {
                email: "",
                password: "",
                nickname: "",
                repassword: "",
            },
            loginForm: {
                email: "",
                password: "",
            },
            editForm: {
                file: null,
                nickname: "",
                email: "",
            },
            uploadForm: [],
            baseMyGallery: [],
            myGallery: [],
        };
    },
    created() {
        let authInfo: any = localStorage.getItem("authInfo");
        let userInfo: any = localStorage.getItem("userInfo");
        if (authInfo) {
            authInfo = JSON.parse(authInfo);
            userInfo = JSON.parse(userInfo);
            if (authInfo.expiresOn > Date.now()) {
                this.setLoginStatus(userInfo.nickname, userInfo.email,
                    userInfo.avatarUrl, authInfo);
            } else {
                alert("您的登录状态已过期，请重新登录");
                this.doLogout();
            }
        }

        Axios.get<Partial<IGallery>[]>("/api/gallery/my", {
            headers: {
                Authorization: `Bearer ${this.authInfo.token}`,
            },
        })
            .then((res) => {
                this.baseMyGallery = [...res.data]
                this.parseGalleryList(this.baseMyGallery)
            });
    },
    methods: {
        resetSignupForm() {
            this.signupForm = {
                email: "",
                password: "",
                nickname: "",
                repassword: "",
            };
        },
        resetLoginForm() {
            this.loginForm = {
                email: "",
                password: "",
            };
        },
        resetEdit() {
            this.status.doEdit.status = false;
            this.status.doEdit.editEmail = false;
            this.status.doEdit.editNickname = false;

            this.editForm.nickname = "";
            this.editForm.file = "";
            this.editForm.email = "";
        },
        async doSignup() {
            if (this.signupForm.password !== this.signupForm.repassword) {
                alert("两次输入的密码不一致");
            } else if (this.signupForm.email === "" || this.signupForm.nickname === ""
                || this.signupForm.password === "" || this.signupForm.repassword === "") {
                alert("提交的信息不合法");
            } else if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.signupForm.email)) {
                alert("邮箱格式错误");
            } else {
                try {
                    await Axios.post("/api/signup", this.signupForm);
                    this.status.doRegister = false;
                    alert("注册成功");
                } catch (e) {
                    alert("注册失败");
                }
            }
            this.resetSignupForm();
        },
        async doLogin() {
            if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.loginForm.email)) {
                alert("邮箱格式错误");
            } else {
                try {
                    const res = await Axios.post<IAuthResponse>("/api/login", this.loginForm);
                    this.status.doLogin = false;
                    alert("登录成功");
                    this.setLoginStatus(res.data.nickname, res.data.email, res.data.avatarUrl, res.data.jwt);
                    localStorage.setItem("authInfo", JSON.stringify(this.authInfo));
                    localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
                } catch (e) {
                    alert("用户名或密码错误");
                }
            }
            this.resetLoginForm();
        },
        doLogout() {
            this.status.isLogin = false;
            this.status.doDropdown = false;
            localStorage.clear();
        },
        setLoginStatus(nickname: string, email: string, avatarUrl: string, jwt: { token: string, expiresOn: number }) {
            this.status.isLogin = true;
            this.userInfo.nickname = nickname;
            this.userInfo.email = email;
            this.userInfo.avatarUrl = avatarUrl;
            this.authInfo.token = jwt.token;
            this.authInfo.expiresOn = jwt.expiresOn;
        },
        uploadAvatar() {
            (document.getElementById("uploadAvatar") as HTMLInputElement).click();
        },
        changeAvatar(e) {
            const reader = new FileReader();
            reader.onload = (r: FileReaderProgressEvent) => {
                (document.getElementById("avatar") as HTMLImageElement).src = r.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
            this.editForm.file = e.target.files[0];
        },
        async doUpdateUserInfo() {
            const formData = new FormData();
            formData.append("nickname", this.editForm.nickname === "" ?
                this.userInfo.nickname : this.editForm.nickname);
            formData.append("email", this.editForm.email === "" ? this.userInfo.email : this.editForm.email);
            formData.append("file", this.editForm.file === "" ? null : this.editForm.file);

            if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(formData.get("email") as string)) {
                alert("邮箱格式错误");
            } else {
                try {
                    const res = await Axios.put<Partial<IUser>>("/api/userinfo", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "Authorization": `Bearer ${this.authInfo.token}`,
                        },
                    });
                    this.userInfo.nickname = res.data.nickname;
                    this.userInfo.email = res.data.email;
                    this.userInfo.avatarUrl = res.data.avatarUrl;

                    localStorage.setItem("userInfo", JSON.stringify(this.userInfo));

                    alert("更新成功");

                    this.resetEdit();

                } catch (e) {
                    alert("更新失败，请重试");
                }
            }
        },
        uploadGallery() {
            (document.getElementById("uploadGallery") as HTMLInputElement).click();
        },
        changeGallery(e) {
            if (e.target.files.length > 8) {
                alert("一次最多添加8张图片");
                return;
            } else if (e.target.files.length === 0) {
                alert("没有选择图片");
                return;
            } else if (this.uploadForm.length + e.target.files.length > 8) {
                alert("一次最多上传8张图片");
                return;
            }
            for (const file of e.target.files) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (f: FileReaderProgressEvent) => {
                    this.uploadForm.push({
                        src: f.target.result,
                        file,
                    });
                };
            }
        },
        removeUploadGallery(u) {
            this.uploadForm.splice(this.uploadForm.findIndex((v) => v === u), 1);
        },
        async doUploadGallery() {
            const formData = new FormData();
            this.uploadForm.forEach((f, index) => {
                formData.append(`file${index}`, f.file);
            });

            try {
                const res = await Axios.post<Partial<IGallery[]>>("/api/gallery", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${this.authInfo.token}`,
                    },
                });

                this.baseMyGallery = res.data.concat(this.baseMyGallery)

                this.parseGalleryList(this.baseMyGallery)

                alert("上传成功");
                this.uploadForm = []
                this.status.doUpload = false

            } catch (e) {
                alert("上传失败，请重试");
            }
        },
        parseGalleryList(gallery: Partial<IGallery>[]) {
            gallery.map(v => v.createdAt = new Date(v.createdAt).toLocaleDateString().replace(/\//g, '-',))

            const newAry = []

            gallery.forEach((g, i) => {
                let index = -1;
                let alreadyExists = newAry.some((newG, j) => {
                    if (g.createdAt === newG.createdAt) {
                        index = j;
                        return true;
                    }
                });
                if (!alreadyExists) {
                    newAry.push({
                        createdAt: g.createdAt,
                        gallery: [g]
                    })
                } else {
                    newAry[index].gallery.push(g)
                }
            })

            this.myGallery = newAry
        }

    },
});

new Fuck().$mount("#root");
