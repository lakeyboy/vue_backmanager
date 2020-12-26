<template>
  <el-container class="home_container">
    <!-- element组件中组件名称就是一个类名 -->
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/home.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <!-- 嵌套时里面用单引号，外面用双引号 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 按钮 -->
        <div class="toggle-buttom" @click="toggleCollapse()">|||</div>
        <!-- 侧边栏区域 -->
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#21a0ff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 这是一级菜单 -->
          <!-- index值相同时 就会导致同时展开   :是动态绑定 不然就是字符串-->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 这是二级菜单   动态属性绑定   里面应该是字符串-->
            <el-menu-item
              :index="'/' + subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="saveNavState('/' + subitem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主题 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧数据对象
      menulist: [],
      iconsObj: {
        // 前面表示类名
        125: 'iconfont icon-yonghuguanli',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpingouwudai2',
        102: 'iconfont icon-danju-tianchong',
        145: 'iconfont icon-icon-p_mrpbaobiao',
      },
      //左侧是否折叠
      isCollapse: false,
      //被激活的链接地址
      activePath: '',
    }
  },
  // 生命周期函数
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  //相当于属性名  后面是一个对象
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200)
        return this.$message.console.error(res.meta.msg)
      this.menulist = res.data
      // console.log(this.menulist)
    },
    // 侧边栏的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //用于保存链接的激活状态
    saveNavState(activePath) {
      //键值对的形式
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
  },
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}

.el-header {
  // background-color: #4c8af4;
  background-color: #545c64;

  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    margin-left: 15px;
    img {
      height: 60px;
      width: 60px;
    }
  }
}

.el-aside {
  background-color: #545c64;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-buttom {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2cm;
  cursor: pointer;
}
</style>