<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:formWrapper>
        <el-form ref="formData" :model="queryParams" label-width="80px">
          <el-row>
            <el-col :span='5'>
              <el-form-item label="角色名称">
                <el-input v-model="roleName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='5'>
              <el-form-item label="工号">
                <el-input v-model="advanceQueryParams.jobNumber" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='5'>
              <el-form-item label="姓名">
                <el-input v-model="advanceQueryParams.nickName" clearable></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template v-slot:operation>
        <ul>
          <li v-if="$checkAuthority($route.name, 'query')">
            <el-button class="green" type="primary" @click='getTableData'>查询</el-button>
          </li>
          <li v-if="$checkAuthority($route.name, 'create')">
            <el-button class="blue" type="primary" @click='handleAddUser'>新增</el-button>
          </li>
          <li v-if="$checkAuthority($route.name, 'multipleDelete')">
            <el-button class="red" type="primary" @click='handleMultipleDelete'>删除</el-button>
          </li>
        </ul>
      </template>
    </TableHeader>
    <el-table :data="tableData1" :height='tableHeight' @selection-change='handleSelectionChange1' ref='multipleTable1'
      v-loading="tableLoading" element-loading-spinner="el-icon-loading" element-loading-text="数据正在加载中"
      @sort-change='handleSort1'>
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="account" label="账户"> </el-table-column>
      <el-table-column prop="jobNumber" label="工号"> </el-table-column>
      <el-table-column prop="nickName" label="姓名"> </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" sortable>
        <template slot-scope='scope'>
          {{$moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss')}}
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

    <el-dialog title="新增成员" :visible.sync="dialogVisible" width="900px" :before-close="handleClose"
      :close-on-click-modal='false' @close='handleCloseDialog'>
      <TableHeader>
        <template v-slot:formWrapper>
          <el-form ref="formData2" :model="advanceQueryParams2" label-width="60px">
            <el-row>
              <el-col :span='9'>
                <el-form-item label="工号">
                  <el-input v-model="advanceQueryParams2.jobNumber" palceholder='请输入' clearable></el-input>
                </el-form-item>
              </el-col>
              <el-col :span='9'>
                <el-form-item label="姓名">
                  <el-input v-model="advanceQueryParams2.nickName" palceholder='请输入' clearable></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </template>
        <template v-slot:operation>
          <ul>
            <li>
              <el-button class="green" type="primary" @click='getTableData2'>查询</el-button>
            </li>
            <li>
              <el-button class="blue" type="primary" @click='addMember'>添加</el-button>
            </li>
          </ul>
        </template>
      </TableHeader>

      <el-table :data="tableData2" :height='tableHeight2' @selection-change='handleSelectionChange2'
        ref='multipleTable2' v-loading="tableLoading2" element-loading-spinner="el-icon-loading"
        element-loading-text="数据正在加载中" @sort-change='handleSort2'>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="account" label="账户"> </el-table-column>
        <el-table-column prop="jobNumber" label="工号"> </el-table-column>
        <el-table-column prop="nickName" label="姓名"> </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable>
          <template slot-scope='scope'>
            {{$moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss')}}
          </template>
        </el-table-column>

      </el-table>
      <div class="common_pagination_comtainer">
        <div class="total">Total {{pagination2.limit}} items</div>
        <div class="main">
          <el-pagination @size-change="handleSizeChange2" @current-change="handleCurrentChange2"
            :current-page="pagination2.page+1" :prev-click='handlePrevPage2' :next-click='handleNextPage2'
            :page-sizes="[10, 50, 100, 200]" :page-size="pagination2.size" layout="sizes, prev, pager, next, jumper"
            :total="pagination2.limit">
          </el-pagination>
        </div>
      </div>
      <div slot="footer">
        <div class="addmemberfooter"></div>
      </div>
    </el-dialog>

    <!-- 删除操作 -->
    <el-dialog class="receiveproduct" title="" :show-close='false' :visible.sync="dialogVisibleDelete" width="500px"
      :before-close="handleClose">
      <div class="content">
        <img src="@/image/common/icon_exclamatiomark.png" alt="">
        <p>你确定要执行删除操作？ Are you sure delete it ?</p>
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
    name: 'MemberManagement',
    components: {

    },
    data() {
      return {
        getPerUserRequest: '/api/perUser/find',
        saveOrUpdatePerUserRequest: '/api/perUser/saveOrUpdate',
        perRoleAddUserRequest: '/api/perRole/addUser',
        perRoleDeleteUserRequest: '/api/perRole/deleteUser',
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
        pagination: {
          page: 0,
          size: 10,
          limit: 0
        },
        pagination2: {
          page: 0,
          size: 10,
          limit: 0
        },

        advanceQueryParams: {
          "loginName": "admin",
          "overrideEnterpriseId": 0,
          perRoleId: Number(this.$route.query.perRoleId),
          jobNumber: '',
          nickName: '',
          type: 1,
        },
        advanceQueryParams2: {
          "loginName": "admin",
          "overrideEnterpriseId": 0,
          jobNumber: '',
          nickName: '',
          type: 1,
        },
        orderStatusDictionary: [{
          title: '未收货',
          code: 'UN_RECEIVE'
        }, {
          title: '已收货',
          code: 'RECEIVING'
        }, {
          title: '收货中',
          code: 'RECEIVED'
        }],
        dialogVisible: false,
        dialogVisibleDelete: false,
        dialogType: 0,
        formData: {
          "code": "",
          "id": '',
          "name": "",
          remark: '',
          "resourceCode": ""
        },
        formData2: {
          "code": "",
          "id": '',
          "name": "",
          remark: '',
          "resourceCode": ""
        },
        rules: {
          name: [{
            required: true,
            message: '请输入角色名称',
            trigger: 'change'
          }],
          code: [{
            required: true,
            message: '请输入角色编号',
            trigger: 'change'
          }],
          remark: [{
            required: false,
            message: '请输入备注',
            trigger: 'change'
          }],
        },
        tableLoading: true,
        tableLoading2: true,
        tableData1: [],
        multipleSelection: [],
        sortParams1: '',
        tableData2: [],
        selectionData2: [],
        sortParams2: '',
      }
    },
    computed: {
      dialogStatus() {
        return this.dialogType === 0 ? '创建' : '编辑'
      },
      tableHeight() {
        return 'calc(100vh - 340px)'
      },
      tableHeight2() {
        return 'calc(100vh - 650px)'
      },
      perRoleId() {
        return Number(this.$route.query.perRoleId)
      },
      roleName() {
        return this.$route.query.roleName
      }
    },
    mounted() {
      this.getTableData()
    },
    methods: {
      getTableData() {
        this.tableLoading = true
        const id = this.$route.query.id

        let advanceQueryParams = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams)))
        this.pagination = JSON.parse(JSON.stringify(this.pagination))

        this.$http.get(this.getPerUserRequest, {
          params: {
            isPage: 'Y',
            keyword: '',
            page: this.pagination.page,
            queryConditions: '',
            queryData: JSON.stringify(advanceQueryParams),
            searchType: '2',
            size: this.pagination.size,
            sort: this.sortParams1,
            specials: '',
          }
        }).then(response => {
          console.log('getTableData+++++', response)
          this.tableLoading = false
          response = response.data
          this.tableData1 = response.content
          this.pagination = {
            page: response.pageRequest.page,
            size: response.pageRequest.size,
            limit: response.pageRequest.totalElements
          }
          this.tableLoading = false
        }).catch(error => {
          this.tableLoading = false

          console.log(error)
        })
      },
      handleSort1(sortData) {
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
        this.sortParams1 = result
        this.getTableData()
      },
      handleSort2(sortData) {
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
        this.sortParams2 = result
        this.getTableData2()
      },
      getTableData2() {

        this.tableLoading2 = true
        const id = this.$route.query.id
        const advanceQueryParams2 = JSON.parse(JSON.stringify(this.$trimParams(this.advanceQueryParams2)))
        this.pagination2 = JSON.parse(JSON.stringify(this.pagination2))
        this.$http.get(this.getPerUserRequest, {
          params: {
            isPage: 'Y',
            keyword: '',
            page: this.pagination2.page,
            queryConditions: '',
            queryData: JSON.stringify(advanceQueryParams2),
            searchType: '2',
            size: this.pagination2.size,
            sort: this.sortParams2,
            specials: '',
          }
        }).then(response => {
          console.log('getTableData2+++++', response)
          console.log('this.perRoleId', this.perRoleId)
          response = response.data
          this.tableData2 = Object.assign(response.content, {
            active: false
          })
          this.tableData2.forEach((item, index) => {
            if (item.perRoleId === this.perRoleId) {
              this.$nextTick(() => {
                this.$refs.multipleTable2.toggleRowSelection(item, true);
              })
              this.tableData2[index].active = true
            }
          })
          this.pagination2 = {
            page: response.pageRequest.page,
            size: response.pageRequest.size,
            limit: response.pageRequest.totalElements
          }
          this.tableLoading2 = false
        }).catch(error => {
          console.log(error)
        })
      },
      handleSelectionChange1(selection) {
        this.multipleSelection = selection

      },
      handleChooseChange2(row, event, column) {
        let isActive = this.selectionData2.filter(item => item.id === row.id).length > 0
        if (isActive) {
          this.selectionData2.splice(row)
        } else {
          this.selectionData2.push(row)
        }
        this.$refs.multipleTable2.toggleRowSelection(row, !isActive); //点击选中
      },
      handleSelectionChange2(selection) {
        console.log('handleSelectionChange2', selection)
        this.selectionData2 = selection
      },
      query() {

      },
      handleSizeChange(data) {
        this.pagination.size = data
        this.getTableData()
      },
      handleCurrentChange(pageNumber) {
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

      handleSizeChange2(data) {
        this.pagination2.size = data
        this.getTableData2()
      },
      handleCurrentChange2(pageNumber) {
        this.pagination2.page = pageNumber - 1
        this.getTableData2()
      },
      handlePrevPage2(pageNumber) {
        this.pagination2.page = pageNumber - 1
        this.getTableData2()
      },
      handleNextPage2(pageNumber) {
        this.pagination2.page = pageNumber + 1
        this.getTableData2()
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
          "resourceCode": ''
        }
      },
      handleSubmitDelete() {
        this.$http.post(this.perRoleDeleteUserRequest, {
          "perRoleId": this.perRoleId,
          "perUserIds": this.multipleSelection.map(item => item.id)
        }).then(response => {
          this.$message.success('删除成功')
          this.getTableData()
          this.dialogVisibleDelete = false
        }).catch(error => {
          this.$message.error('删除失败')
        })
      },
      handleMultipleDelete() {
        if (this.multipleSelection.length === 0) {
          this.$message.error('请至少选择一个用户')
          return
        }
        this.dialogVisibleDelete = true
      },
      handleAddUser() {
        this.dialogVisible = true
        this.getTableData2()
      },
      addMember() {
        const selectedIds = this.selectionData2.map(item => item.id)
        this.$http.post(this.perRoleAddUserRequest, {
          "perRoleId": this.perRoleId,
          "perUserIds": selectedIds
        }).then(response => {
          this.$message.success('添加成功')
          this.dialogVisible = false
          this.getTableData()
        }).catch(error => {
          this.$message.error('添加失败')
        })
      },
      handleClose() {
        this.dialogVisible = false

      },
      handleCloseDialog() {
        this.$refs.formData.resetFields()
        this.dialogVisible = false
      },
      handleSubmit() {
        this.$refs.formData.validate(valid => {
          if (valid) {
            this.$http.post(this.saveOrUpdatePerUserRequest, this.formData).then(response => {
              console.log(response)
              if (response.code === 0) {
                this.handleCloseDialog()
                this.$message.success(this.dialogStatus + '成功')
                this.getTableData()
              }
            }).catch(error => {
              console.log(error)
              this.$message.error(error)
            })
          }
        })

      },

      handleDelete() {

      },
      memberManagement() {

      },

    }
  }

</script>

<style lang="scss" scoped></style>