<template>
  <div>
    <!-- 面包屑导航区 -->
    <!-- 样式可以应用于全局 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
        <!-- 无法居中 删除:space="200"   -0 表示变成数值-->
      </el-alert>
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 侧面Tab栏目  通过v-model 和 name来使控制选择情况 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 表单需要包裹在  tab 之外 因为 tab 的子节点 必须是 tab -pane -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTableLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- key 为item 中的数据 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- key 可以使用item 中的数据 但是如果没有 使用 i 就是数组索引 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传的API地址   list-type表示渲染的ui效果-->
            <!-- 需要添加headers请求头 因为上载不是使用 axios 的Ajax请求 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash 其中使用 _ 表示lodash

import _ from 'lodash'
export default {
  data() {
    return {
      //进度条激活项
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的数组
        goods_cat: [],
        //上传图片后的临时地址  在提交添加商品时使用
        pics: [],
        //商品详情 添加的富文本
        goods_introduce: '',
        //动态 静态参数列表
        attrs: [],
      },
      //添加商品表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      //商品分类数据
      catelist: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      //添加商品时动态参数
      manyTableData: [],
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      //预览图片的地址
      previewPath: '',
      //控制图片预览对话框的显示与隐藏
      previewDialogVisible: false,
    }
  },
  created() {
    //获取商品所有数据   方法需要写在method中  调用可以在created
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message('获取商品分类数据失败！')
      }

      this.catelist = res.data
    },
    //级联选择器发生变化时触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //tab栏切换时触发  主要用于阻止标签页的切换   第一个时即将进入的标签的名字  即将离开的
    beforeTableLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类！')
        return false
      }
    },
    //标签  被点击时  触发
    async tabClicked() {
      //判断访问的是动态参数
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }
        //需要判定是否为 空字符串 空字符串会导致 参数项中 有空的一项
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败!')
        }
        //需要判定是否为 空字符串 空字符串会导致 参数项中 有空的一项

        this.onlyTableData = res.data
        // console.log(this.onlyTableData)
      }
    },

    //点击名字 预览图片
    handlePreview(file) {
      this.previewPath = file.response.data.url

      // console.log(this.previewPath)
      this.previewDialogVisible = true
    },

    //点击 X 删除图片  file 为移除的图片的信息
    handleRemove(file) {
      // 1.获取将要删除图片的索引值
      const filePath = file.response.data.tmp_path
      // 2.从pic 数组中 找到这个图片对应的索引  x表示数组中的每一项   返回值为对应的对象的索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath
      })
      // 3.调用splice 从数组中删除
      this.addForm.pics.splice(i, 1)
    },

    //上载图片成功时调用
    handleSuccess(response) {
      // 1.拼接 一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // console.log(picInfo)
      // 2.将图片信息对象 push 到pics 中
      this.addForm.pics.push(picInfo)
    },

    //点击添加商品按钮
    add() {
      //需要先进行表单预校验
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单!')
        }

        //可以添加商品数据了
        // 如果直接修改   addForm数据则会报错 需要进行深拷贝 复制出和原来一样的对象
        const form = _.cloneDeep(this.addForm)

        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          }

          this.addForm.attrs.push(newInfo)
        })
        //处理静态参数
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }

          this.addForm.attrs.push(newInfo)
        })

        form.attrs = this.addForm.attrs
        //个人感觉这个深拷贝 可以放在后面 等所有数据处理后再执行
        // const form = _.cloneDeep(this.addForm)
        // form.goods_cat = form.goods_cat.join(',')
        // console.log(form)

        // 发起请求  商品名字必须是唯一的  参数应该是一个对象{} 而form已经是一个对象了 所以不需要加{}
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        // 通过路由导航跳转至商品页面!
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    //获取三级分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 10px;
}
</style>