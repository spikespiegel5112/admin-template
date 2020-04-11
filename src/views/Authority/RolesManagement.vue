<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:formWrapper>
        <el-form ref="formData" :model="advanceQueryParams" label-width="80px">
          <el-row>
            <el-col :span='5'>
              <el-form-item label="角色名称">
                <el-select v-model="advanceQueryParams.name" filterable remote :remote-method="getRoleQueryData"
                  :loading="roleQueryLoading" placeholder="请选择" clearable>
                  <el-option v-for='item in roleQueryListData' :key='item.code' :label="item.name" :value="item.name"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template v-slot:operation>
        <ul>
          <li v-if="$checkAuthority($route.name, 'query')">
            <el-button class="green" type="primary" @click='query'>查询</el-button>
          </li>
          <li v-if="$checkAuthority($route.name, 'create')">
            <el-button class="blue" type="primary" @click='handleCreate'>新增</el-button>
          </li>
        </ul>
      </template>
    </TableHeader>

    <el-table :data="tableData" :height='tableHeight' v-loading="tableLoading" element-loading-spinner="el-icon-loading"
      element-loading-text="数据正在加载中" @sort-change='handleSort'>
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="角色名称"> </el-table-column>
      <!-- <el-table-column prop="code" label="角色编号"> </el-table-column> -->
      <el-table-column prop="remark" label="备注"> </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" sortable>
        <template slot-scope='scope'>
          {{$moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作" width='200px'>
        <template slot-scope='scope'>
          <div class="operation">
            <el-button @click='handleEdit(scope)' type='text'>编辑</el-button>
            <el-button @click='handleDelete(scope)' type='text'>删除</el-button>
            <el-button @click='memberManagement(scope)' type='text'>成员管理</el-button>
          </div>
        </template>
      </el-table-column>

    </el-table>
    <div class="common_pagination_comtainer">
      <div class="total">Total {{pagination.limit}} items</div>
      <div class="main">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="pagination.page+1" :prev-click='handlePrevPage' :next-click='handleNextPage'
          :page-sizes="[10, 50, 100, 200]" :page-size="pagination.size" layout="sizes, prev, pager, next, jumper"
          :total="pagination.limit">
        </el-pagination>
      </div>

    </div>

    <el-dialog title="新增角色" :visible.sync="dialogVisible" width="500px" :before-close="handleClose"
      :close-on-click-modal='false' @close='handleCloseDialog'>

      <el-form ref="formData" :rules="rules" :model="formData" label-width="80px" label-position="top">
        <el-row>
          <el-form-item label="角色名称" prop='name'>
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
        </el-row>
<!--        <el-row>-->
<!--          <el-form-item label="角色编号" prop='code'>-->
<!--            <el-input v-model="formData.code"></el-input>-->
<!--          </el-form-item>-->
<!--        </el-row>-->
        <el-row>
          <el-form-item label="备注" prop='remark'>
            <el-input v-model="formData.remark" type='textarea'></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button class="blue" type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除操作 -->
    <el-dialog class="receiveproduct" title="" :show-close='false' :visible.sync="dialogVisibleDelete" width="500px"
      :before-close="handleClose">
      <div class="content">
        <img src="@/image/common/icon_exclamatiomark.png" alt="">
        <p></i>你确定要执行这个操作？ Are you sure do it ?</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleDelete = false">取消</el-button>
        <el-button class="blue" type="primary" @click="handleSubmitDelete">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'RolesManagement',
    components: {

    },
    data() {
      return {
        getPreRoleRequest: '/api/perRole/find',
        deletePreRpleRequest: '/api/perRole/delete',
        saveOrUpdatePerRoleRequest: '/api/perRole/saveOrUpdate',
        queryParams: {
          isPage: 'Y',
          keyword: '',
          page: '',
          queryConditions: '',
          queryData: '',
          searchType: '',
          size: '',
          sort: '',
          specials: '',
        },
        sortParams: '',
        advanceQueryParams: {
          name: '',
        },
        pagination: {
          page: 0,
          size: 10,
          limit: 0
        },
        roleQueryLoading: false,
        dialogVisible: false,
        dialogType: 0,
        formData: {
          "code": "",
          "id": '',
          "name": "",
          remark: '',
          "resourceCode": "",
          "type": 1
        },
        rules: {
          name: [{
            required: true,
            message: '请输入角色名称',
            trigger: 'change'
          }],
          // code: [{
          //   required: true,
          //   message: '请输入角色编号',
          //   trigger: 'change'
          // }],
          remark: [{
            required: false,
            message: '请输入备注',
            trigger: 'change'
          }],
        },
        tableLoading: true,
        tableData: [],
        roleQueryListData: [],
        dialogVisibleDelete: false,
        currentRowData: {},
        currentResourceCode: {}
      }
    },
    computed: {
      dialogStatus() {
        return this.dialogType === 0 ? '创建' : '编辑'
      },
      tableHeight() {

        return 'calc(100vh - 340px)'
      },
      currentRouteName() {
        return this.$route.name
      }
    },
    mounted() {
      console.log(this.$checkAuthority(this.currentRouteName, 'query'))
      this.getTableData()
      this.getRoleQueryData()
    },
    methods: {
      getTableData() {
        this.tableLoading = true
        let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
        this.$http.get(this.getPreRoleRequest, {
          params: {
            isPage: 'Y',
            keyword: '',
            page: this.pagination.page,
            queryConditions: '',
            queryData: JSON.stringify(advanceQueryParams),
            searchType: '2',
            size: this.pagination.size,
            sort: this.sortParams,
            specials: '',
          }
        }).then(response => {
          console.log('getTableData+++++', response)
          response = response.data
          this.tableLoading = false
          this.tableData = response.content
          this.pagination = {
            page: response.pageRequest.page,
            size: response.pageRequest.size,
            limit: response.pageRequest.totalElements
          }
        }).catch(error => {
          this.tableLoading = false

          console.log(error)
        })
      },
      getRoleQueryData(query) {
        this.roleQueryLoading = true
        this.pagination.page = 0
        // this.pagination.size = 999
        let advanceQueryParams = JSON.parse(JSON.stringify(this.advanceQueryParams, {
          name: query
        }))
        console.log(advanceQueryParams)
        this.$http.get(this.getPreRoleRequest, {
          params: {
            isPage: 'Y',
            keyword: '',
            page: this.pagination.page,
            queryConditions: '',
            queryData: {
              name: query
            },
            searchType: '2',
            size: this.pagination.size,
            sort: this.sortParams,
            specials: '',
          }
        }).then(response => {
          console.log('roleQueryListData+++++', response)
          response = response.data
          this.roleQueryListData = response.content
          this.roleQueryLoading = false
          console.log('this.roleQueryListData+++++', this.roleQueryListData)
        }).catch(error => {
          console.log(error)
        })
      },
      handleSort(sortData) {
        console.log(sortData)
        let result = ''
        switch (sortData.order) {
          case "ascending":
            result = sortData.prop + ' ' + 'ASC'
            break;
          case "descending":
            result = sortData.prop + ' ' + 'DESC'
            break;
          default:
            result = ''
            break
        }
        this.sortParams = result
        this.getTableData()
      },
      query() {
        this.getTableData()
      },
      handleSizeChange(data) {
        this.pagination.size = data
        this.getTableData()
      },
      handleCurrentChange(pageNumber) {
        // debugger
        this.pagination.page = pageNumber - 1
        this.getTableData()
      },
      handlePrevPage(pageNumber) {
        this.pagination.page = pageNumber - 1
        this.getTableData()
      },
      handleNextPage(pageNumber) {
        this.pagination.page = pageNumber + 1
        this.getTableData()
      },
      handleCreate() {
        this.dialogVisible = true
        this.dialogType = 0

      },
      async handleEdit(scope) {
        this.dialogVisible = true
        this.dialogType = 1
        await this.$nextTick()
        this.formData = {
          "code": scope.row.code,
          "id": scope.row.id,
          "name": scope.row.name,
          remark: scope.row.remark,
          "resourceCode": scope.row.resourceCode,
          "type": 1
        }
      },
      handleClose() {
        this.dialogVisible = false

      },
      handleCloseDialog() {
        this.$refs.formData.resetFields()
        this.formData = Object.assign(this.formData, {
          id: ''
        })
        console.log(this.formData)
        this.dialogVisible = false
      },
      handleSubmit() {
        this.$refs.formData.validate(valid => {

          if (valid) {
            this.$http.post(this.saveOrUpdatePerRoleRequest, this.formData).then(response => {
              console.log(response)

              if (response.code === 0) {
                this.handleCloseDialog()
                this.$message.success(this.dialogStatus + '成功')
                this.dialogVisible = false
                this.getTableData()
              }
            }).catch(error => {
              console.log(error)
              this.$message.error(error)
            })
          }
        })

      },

      handleDelete(scope) {
        this.dialogVisibleDelete = true
        this.currentRowData = scope.row
      },
      handleSubmitDelete() {
        const id = this.currentRowData.id
        this.$http.post(this.deletePreRpleRequest, {
          "idList": [id]
        }).then(response => {
          this.$message.success('删除成功')
          this.dialogVisibleDelete = false
          this.getTableData()
        }).catch(error => {
          this.dialogVisibleDelete = false
          this.$message.error(error)
        })
      },
      memberManagement(scope) {
        console.log('memberManagement+++++', scope)
        this.$router.push({
          name: 'memberManagement',
          query: {
            roleName: scope.row.name,
            perRoleId: scope.row.id,
          }
        })
      },
    }
  }

</script>

<style lang="scss" scoped></style>
