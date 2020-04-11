<template>
    <div class="access_login_container">
        <div class="bg">
            <div class="top">
                <img src="@/image/access/login_bg2_00000.png" alt />
                <div class="logo">
                    <!-- <img src="@/image/common/logo.png" alt=""> -->
                    <h1>ADMIN-TEMPLATE2222222222</h1>
                </div>
            </div>
            <div class="footer">
                <p class="slogan">For A Better Digital Solution</p>
                <span class="copyright">Copyright @2020</span>
            </div>
        </div>
        <div class="main">
            <div class="login_wrapper">
                <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="loginform">
                    <h3 class="title">Welcome To SYSTEM</h3>
                    <el-form-item prop="loginName">
                        <el-input v-model="loginForm.loginName" type="text" auto-complete="off" placeholder="Username">
                            <img class="icon" slot="prefix" src="@/image/access/username.png" alt />
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password" type="password" auto-complete="off"
                            placeholder="Password" @keyup.enter.native="handleLogin">
                            <img class="icon" slot="prefix" src="@/image/access/username.png" alt />
                        </el-input>
                    </el-form-item>
                    <el-form-item prop="imageCode" class="verificationcode">
                        <el-input v-model="loginForm.imageCode" type="text" auto-complete="off" placeholder
                            @keyup.enter.native="handleLogin"></el-input>
                        <a class="codeimage" @click="getCode">
                            <img :src="verificationCodeData" alt />
                        </a>
                    </el-form-item>
                    <el-form-item class="operation">
                        <el-button :loading="loading" size="medium" type="primary" @click.native.prevent="handleLogin">
                            <span v-if="!loading">Login</span>
                            <span v-else>Login...</span>
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <!--  底部  -->
    </div>
</template>

<script>
export default {
    name: "Login",
    data() {
        return {
            getVerificationCodeRequest: '/api/getVerificationCode',
            codeUrl: "",
            cookiePassword: "",
            verificationCodeData: '',
            loginForm: {
                loginName: "admin",
                password: "1",
                imageCode: "",
                sessionUUID: ""
            },
            rememberMe: false,

            loginRules: {
                loginName: [{
                    required: true,
                    trigger: "blur",
                    message: "用户名不能为空"
                }],
                password: [{
                    required: true,
                    trigger: "blur",
                    message: "密码不能为空"
                }],
                imageCode: [{
                    required: true,
                    trigger: "change",
                    message: "验证码不能为空"
                }]
            },
            loading: true,
            redirect: undefined
        };
    },
    watch: {
        $route: {
            handler: function (route) {
                this.redirect = route.query && route.query.redirect;
            },
            immediate: true
        }
    },
    created() {
        this.$remResizing({
            baseline: 1366,
            fontSize: 20
        })

    },
    async mounted() {
        this.loading = true;
        const authFlag = localStorage.getItem("loginFlag");
        const backRoute = this.$store.state.app.backRoute
        if (authFlag && authFlag !== 'null') {
            // this.$router.push('/dashboard')
            this.loading = false;
        } else {
            this.loading = false;
            this.getCode();
        }
    },
    methods: {
        getCode() {
            this.$http.get(this.getVerificationCodeRequest).then(response => {

                response = response.data
                this.verificationCodeData = 'data:image/jpeg;base64,' + response.imageCode
                this.loginForm.sessionUUID = response.sessionUUID
            }).catch(error => {
                console.log(error)
            })
        },
        handleLogin() {


            this.$refs.loginForm.validate(async valid => {

                if (valid) {
                    this.loading = true;


                    try {
                        // await this.$store.dispatch("Login", this.loginForm)
                        await this.submitLogin(this.loginForm)
                        localStorage.setItem("loginFlag", true);
                        this.$store.commit('setLogin', true)
                        this.$message.success('登录成功')
                        document.getElementsByTagName('html')[0].style.fontSize = ''
                        this.$router.push({
                            path: this.redirect || "/dashboard"
                        });
                        await this.getUserInfo()

                        this.loading = false;
                    } catch (error) {
                        console.log(error)
                        this.loading = false;
                        this.$message.error(error.msg)

                        this.getCode();
                    }
                }
            });
        },
        submitLogin(formData) {
            return new Promise((resolve, reject) => {
                // debugger
                // 临时跳过登录
                resolve()
                return


                this.$http.post('/api/login', {
                    "imageCode": formData.imageCode,
                    "loginName": formData.loginName.trim(),
                    "password": formData.password,
                    "sessionUUID": formData.sessionUUID
                }).then(response => {
                    // setToken(response.token)
                    // commit('SET_TOKEN', response.token)
                    const code = response.code
                    switch (code) {
                        case 0:
                            resolve(response)
                        case 10001:
                            reject(response)
                        default:
                            resolve(response)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        getUserInfo() {
            return new Promise((resolve, reject) => {
                let response = {
                    "code": 0,
                    "data": {
                        "account": "admin",
                        "createByName": null,
                        "email": null,
                        "enterpriseId": null,
                        "headerUrl": null,
                        "id": 1,
                        "jobNumber": null,
                        "mobile": null,
                        "nickName": "管理员",
                        "openId": null,
                        "perRoleId": null,
                        "resourceCode": null,
                        "status": 0,
                        "token": null,
                        "type": 0,
                        "wxName": null
                    },
                    "msg": "操作成功"
                }
                response = response.data
                const avatar = !response.avatar || response.avatar === '' ? require("@/image/access/profile.jpg") : process.env.VUE_APP_BASE_API + user.avatar;
                this.$store.commit('SET_AVATAR', avatar)
                // 临时跳过登录
                this.$store.commit('setUserInfo', response)
                this.$store.commit('setLogin', true)
                resolve(response)


                // service.get('/api/getCurrent', {}).then(response => {
                //   response = response.data
                //   commit('SET_AVATAR', avatar)
                //   commit('setUserInfo', response)
                //   commit('setLogin', true)
                //   resolve(response)
                // }).catch(error => {
                //   reject(error)
                // })
            })
        }
    }
};

</script>

<style rel="stylesheet/scss" lang="scss">
</style>