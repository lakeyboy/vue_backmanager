<template>
  <!-- 只能有一个根节点 -->
  <div>
    <!-- 面包屑导航区 -->
    <!-- 样式可以应用于全局 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <!-- 不同的type不同的颜色 -->
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格布局  一共有24列-->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二和三级级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 通过for 循环再来渲染二级 和三级 -->
                  <!-- 二级部分 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级部分 tag 会有一个close 触发事件 而不是 clik-->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row.children }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列  -->
        <el-table-column type="index" label="#"></el-table-column>

        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <!-- 因为数据是通过插槽来表示 所不需要 prop -->
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件   data后面  使用定义的数据为什么不用this???-->
      <!-- prop 相当于表示 树形结构中 以什么分割节点 以及每个节点在原数据中是什么属性 -->
      <el-tree
        default-expand-all
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        :data="rightlist"
        :props="treeProps"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容 -->
      <!-- label-width 表单域标签的宽度，form-item 会继承该值 支持 auto -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="EditDialogClose"
    >
      <!-- 内容 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //表示分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //所有的权限数据
      rightlist: [],
      //自己定义节点以什么分割
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      //默认已经勾选的权限的id值数组
      defKeys: [],
      //即将分配权限的id
      roleId: '',
      //添加角色对话框的显示
      addDialogVisible: false,
      //添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      //添加角色表单验证对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
      //编辑对话框显示与隐藏
      editDialogVisible: false,
      //修改（之前查询）用户信息对象
      editForm: {},
      //修改角色表单验证对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色的函数
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.rolelist = res.data
      //console.log(this.rolelist)
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除   返回值是promise  确定返回confirm 取消返回cancel(err)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      // 使用`` 就要用${}
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      //需要重新调用来刷新  但会造成重新渲染
      //   this.getRolesList()
      //由于返回的数据已经是 最新的 所以 再重新赋值即可
      role.children = res.data
    },
    //展示赋予权限对话框
    async showSetRightDialog(role) {
      // console.log(role)
      // 保存这个角色的id
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      //数据获取失败需要return
      if (res.meta.status !== 200) {
        return this.$message.err('获取权限数据失败！')
      }

      this.rightlist = res.data
      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归的形式 获取角色下所有三级权限的id 保存到defKeys数组中
    getLeafKeys(node, arr) {
      //node 节点如果没有children属性就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //关闭分配权限对话框时触发
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限   展开运算符号
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // 需要把数据以，分开
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败！')
      }

      this.$message.success('分派权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    //监听添加用户对话框的关闭事件  关闭后重置对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //确定  添加角色
    addUser() {
      // 简化promise操作
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        //可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        //隐藏对话框
        this.addDialogVisible = false
        //刷新列表
        this.getRolesList()
      })
    },
    //根据id删除角色
    async removeRoleById(id) {
      //弹框进行询问
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      //上面表示 点击返回时 触发
      //如果用户确认删除  返回值为字符串 confirm
      //如果用户取消删除  返回值为字符串  cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      //这个函数要加上async   还要解构这个数据
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.err('删除失败')
      }
      this.$message.success('删除成功')
      this.getRolesList()
    },
    //展示编辑角色的对话框
    async showEditDialog(id) {
      //在编辑角色前会先查询这个数据
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      // console.log(this.editForm)

      this.editDialogVisible = true
    },
    //修改角色 预校验
    editUserInfo() {
      //简化promise操作   判断这个form表单的预校验
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        //可以发起修改角色的网络请求
        //由于少了一个id数据  但是id 和roleId相同
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改角色失败')
        }
        //隐藏对话框
        this.editDialogVisible = false
        //刷新角色列表
        this.getRolesList()
        this.$message.success('修改角色成功')
      })
    },
    //监听角色修改对话框关闭   关闭后重置对话框
    EditDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>