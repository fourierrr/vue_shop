<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click='showAddDiolog'>添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table :data='cateList' :columns='columns'
        :selection-type='false' :expand-type='false'
        show-index index-text='#' border class="treeTable">
        <!-- 是否有效列 -->
        <template slot='isok' scope='scope'>
          <i class="el-icon-success"
          v-if="scope.row.cat_deleted === false"
          style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template slot='order' scope='scope'>
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot='opt' scope='scope'>
          <el-button size="mini" type="primary" @click="getCateById(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDiologVisible"
      width="50%"
      :close-on-click-modal="false"
      @close="addCateDiologClose">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" >
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" >
          <!-- 级联选择器option用来指定数据源 -->
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDiologVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类称对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editCateDiologVisible"
      width="50%">
      <el-form :model="editCateForm" ref="editCateFormRef" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDiologVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品数据列表
      cateList: [],
      queryInfo: {
        type: [1, 2, 3],
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为table指定列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前定义为模板列
          type: 'template',
          // 表示当前这一列模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前定义为模板列
          type: 'template',
          // 表示当前这一列模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前定义为模板列
          type: 'template',
          // 表示当前这一列模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDiologVisible: false,
      editCateDiologVisible: false,
      // 添加分类表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类Id
        cat_pid: 0,
        // 分类级别
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 10, message: '分类名称长度在1~10个字符之间', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      // 选中的父级分类Id数组
      selectedKeys: [],
      editCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类Id
        cat_pid: 0
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      // console.log()
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      // console.log(this.queryInfo.pagesize)
      this.getCateList()
    },
    // 监听pagenum的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      // console.log(this.queryInfo.pagenum)
      this.getCateList()
    },
    showAddDiolog () {
      // 现获取父级分类的数据列表
      this.getParentCateList()
      this.addCateDiologVisible = true
    },
    // 获取父级分类的列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败!')
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 添加分类选择项发生变化触发次函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果selectedKeys中数组长度大于0说明选中父级分类，反之说明没选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 父级分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        // return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定按钮添加新的分类
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
        this.$message.success('添加商品分类成功')
        this.getCateList()
        this.addCateDiologVisible = false
      })
    },
    // 添加分类对话框关闭事件
    addCateDiologClose () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 根据Id查询商品分类的名称
    async getCateById (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类名失败！')
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateForm.cat_pid = id
      console.log(this.editCateForm)
      this.editCateDiologVisible = true
    },
    // 点击确定按钮提交编辑商品分类名称
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_pid, { cat_name: this.editCateForm.cat_name })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('编辑商品分类失败！')
        this.$message.success('编辑商品分类成功！')
        this.getCateList()
        this.editCateDiologVisible = false
      })
    },
    // 根据ID删除对应的商品分类信息
    async removeCateById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除!')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除商品分类失败!')
      this.$message.success('删除商品分类成功!')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
