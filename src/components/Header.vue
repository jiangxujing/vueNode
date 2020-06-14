<template>
  <div class="header">
    <el-container>
      <el-header style="height:70px;">
        <div class="logo_img">
          <span class="title">管理系统</span>
        </div>
        <div class="login_in">
          <div class="dropout" @click="logout">&nbsp;&nbsp;退出系统</div>
          <div v-if="userNameHeader">欢迎&nbsp;{{userNameHeader}}</div>
          <el-button v-else type="success" @click="getLoginBox">登录</el-button>
        </div>
        <el-button type="primary">购物车</el-button>
      </el-header>
      <el-container>
        <el-container>
          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
    <div class="modal-wrapper" v-show="loginBoxShow">
      <div class="modal">
        <div style="line-height: 45px;font-size:20px">login in</div>
         <el-input v-model="userName" type="text" placeholder="user name"></el-input>
         <el-input v-model="userPwd" type="password" placeholder="password"></el-input>
         <el-button @click="login" type="primary" style="margin-top:30px">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import api from "../common/api.js";
  import Vue from "vue";
  import { getCookie } from '../common/utils.js'
  import {
    Message,
    MessageBox
  } from 'element-ui'
  export default {
    name: 'Header',
    data() {
      return {
        isLogin: false,
        userNameHeader:'',
        userName: '',
        userPwd: '',
        loginBoxShow:false
      }
    },
    methods: {
      getLoginBox(){
        console.log('ggggggg')
        this.loginBoxShow = true
      },
      login() {
        let params = {
          userName: this.userName,
          userPwd: this.userPwd
        }
        console.log(params)
        api.post('/users/login', params).then(res => {
          if(res.status =='0'){
             this.$message({
                type: 'info',
                message: '登录成功'
              });
            this.loginBoxShow = false
            this.isLogin = true
            this.userNameHeader = res.result.userName
          }
        })
      },
      logout() {
          		 this.$confirm('确认退出系统吗?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: ''
                }).then(() => {
                  api.post('/users/logout',{}).then(res=>{
                      if(res.status == '0'){
                        this.userNameHeader = ''
                        this.$message({
                          type: 'info',
                          message: '已退出登录'
                        });
                      }
                  })

                }).catch(() => {
                  this.$message({
                    type: 'info',
                    message: '已取消退出'
                  });
                });
      }
    },
    mounted() {
      console.log('hhhhhh')
      this.userNameHeader = getCookie('userName')
    },
  }
</script>

<style lang="scss">
  .header {
    height: 100%;
    .modal-wrapper{
      width:100%;
      height:100%;
      background: rgba(0,0,0,.5);
      position: fixed;
      left:0;
      top:0;
      .modal{
        width:500px;
        height:300px;
        background: #fff;
        border-radius:30px;
        margin:100px auto;
      }
    }
    .el-header {
      background-color: #063C7C;
      color: #333;
      text-align: center;
      line-height: 70px;

      .logo_img {
        img {
          width: 50px;
          height: 50px;
          float: left;
          margin-top: 10px;
        }

        .title {
          color: #fff;
          float: left;
          margin-left: 23px;
          font-size: 20px;
        }
      }

      .login_in {
        float: right;
        padding-right: 20px;

        div {
          float: right;
          padding-right: 20px;
          color: #FFF;
          cursor: pointer;

          img {
            width: 12px;
          }
        }

        .dropout:hover {
          color: #297CFF;
        }
      }
    }

    .el-container {
      width: 100%;
      height: 100%;
      position: relative;

      .el-aside {
        color: #333;
        text-align: center;
        line-height: 200px;

        .el-menu-item.is-active {
          background-color: #D80404 !important;
        }

        .el-menu {
          border-right: none;
          height: 100%;

          .el-menu-item {
            text-align: left !important;
          }

          .el-icon-menu {
            padding-left: 20px
          }

          ul li {
            position: relative;

            span {
              position: absolute;
              top: -3px;
              left: 60px;
            }
          }

          .el-submenu__title:hover {
            background: #03a693 !important
          }

          .el-submenu__title {
            color: #fff !important;
          }

          .is-opened {
            .el-submenu__title {
              background: #03a693 !important;
              color: #fff !important;
            }

            .el-menu-item {
              background: #303033 !important;

              &:hover {
                background: #03a693 !important
              }
            }

            .el-menu-item-group__title {
              padding: 0 !important;
            }
          }
        }
      }

      .el-main {
        background-color: #fff;
        padding: 30px !important
      }
    }
  }
</style>
