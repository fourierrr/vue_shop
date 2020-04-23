<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src='../assets/高清院徽.png' height="50px" width="50px" >
        <span>AIMP管理系统</span>
      </div>
      <span>
        <img src="../assets/avatar.png" />
        <span>username</span>
        <el-button type="info" @click="logout">
          退出
        </el-button>
      </span>
    </el-header>
    <!-- 主体部分，包含左边菜单，右边主要内容 -->
    <el-container>
      <!-- 侧边栏菜单区域 -->
      <el-aside :width="isCollapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
              background-color="#333744"
              text-color="#fff"
              active-text-color="red"
              :unique-opened="true"
              :collapse="isCollapse"
              :collapse-transition="false"
              :router="true"
              :default-active="this.$route.path">
          <el-submenu :index= "item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsobj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path " v-for="subItem in item.children"
            :key="subItem.id" >
              <i class="iconfont icon-all"></i>
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主要区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsobj: {
        125: 'iconfont icon-bussiness-man',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-similar-product',
        102: 'iconfont icon-add-cart',
        145: 'iconfont icon-tradingdata'
      },
      // 是否折叠左侧栏
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 点击折叠菜单
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header {
  background-color: #373D41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px ;
    }
  }
  > span {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px ;
      margin-right: 40px ;
      font-size: 16px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin: g10px;
  font-size: 24px;
}
.toggle-button {
  background-color: #4a5064;
  text-align: center;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  letter-spacing: 0.2cm;
  cursor: pointer;
}
</style>
