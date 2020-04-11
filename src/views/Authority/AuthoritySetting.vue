<template>
  <div class="common_table_container">
    <TableHeader>
      <template v-slot:formWrapper>
        <el-form ref="formData" :model="advanceQueryParams" label-width="80px">
          <el-row>
            <el-col :span='5'>
              <el-form-item label="角色名称">
                <el-input v-model="roleName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span='5'>
              <el-form-item label="功能菜单">
                <el-select v-model="advanceQueryParams.menuName" placeholder="请选择" @change='handleChooseNemuName'>
                  <el-option v-for='item in queryList' :key='item.value' :label="item.title" :value="item.name">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template v-slot:operation>
        <ul v-if='!tableLoading'>
          <li v-if="$checkAuthority($route.name, 'query')">
            <el-button class="green" type="primary" @click='query'>查询</el-button>
          </li>
          <li v-if="$checkAuthority($route.name, 'save')">
            <el-button class="blue" type="primary" @click='handleSubmit'>保存</el-button>
          </li>
        </ul>
      </template>
    </TableHeader>

    <el-table :data="tableData" :height='tableHeight' @select='handleSelect' @selection-change='handleSelectionChange2'
      ref='multipleTable' v-loading="tableLoading" element-loading-spinner="el-icon-loading"
      element-loading-text="数据正在加载中">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="title" label="功能菜单" width="300"> </el-table-column>
      <el-table-column prop="functionaility" label="权限操作">
        <template slot-scope='scope'>
          <ul class="tableform">
            <el-checkbox-group v-model='tableFormData[scope.row.name].functionaility'
              @change='handleChangeCheckboxGroup'>
              <li v-for='item in getFunctionailityTableData(scope)' :key='item.code'>
                <el-checkbox :label='item.code' :key='item.code'>{{item.name}}</el-checkbox>
              </li>
            </el-checkbox-group>
          </ul>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="170" sortable>
        <template slot-scope='scope'>
          {{$moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
    </el-table>
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
        getFindOneRequest: '/api/perRole/findOne',
        saveOrUpdatePerRoleRequest: '/api/perRole/saveOrUpdate',
        advanceQueryParams: {
          menuName: ''
        },
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
        functionailityDictionary: [{
          name: '新增',
          code: 'add',
          always: false
        }, {
          name: '创建',
          code: 'create',
          always: false
        }, {
          name: '删除',
          code: 'delete',
          always: false
        }, {
          name: '批量删除',
          code: 'batchDelete',
          always: false
        }, {
          name: '查询',
          code: 'query',
          always: false
        }, {
          name: '导入',
          code: 'import',
          always: false
        }, {
          name: '导出',
          code: 'export',
          always: false
        }, {
          name: '编辑',
          code: 'edit',
          always: false
        }, {
          name: '保存',
          code: 'save',
          always: false
        }, {
          name: '收货',
          code: 'receive',
          always: false
        }, {
          name: '打印',
          code: 'print',
          always: false
        }, {
          name: '标签复打',
          code: 'reprint',
          always: false
        }, {
          name: '收货打印',
          code: 'receiveAndPrint',
          always: false
        }, {
          name: '审核',
          code: 'audit',
          always: false
        }],
        dialogVisible: false,
        dialogType: 0,
        formData: {
          "code": "",
          "id": '',
          "name": "",
          remark: '',
          "resourceCode": "",
          type: 0
        },
        tableFormData: {},
        tableOriginFormData: {},
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
        tableOriginData: [],
        authoorityData: [],
        selectionData2: [],
        ready: false,
        queryList: []
      }
    },
    computed: {
      dialogStatus() {
        return this.dialogType === 0 ? '创建' : '编辑'
      },
      tableHeight() {
        return 'calc(100vh - 300px)'
      },
      menuData() {
        return this.$store.state.permission.routes
      },
      perRoleId() {
        return this.$route.query.perRoleId
      },
      roleCode() {
        return this.$route.query.roleCode
      },
      roleName() {
        return this.$route.query.name
      },
      currentEditingResourceCode() {
        return this.$store.state.app.currentEditingResourceCode
      },

    },
    async mounted() {
      await this.getAuthorityData()
      this.transformRouteData()
      this.highlightTable()
    },
    methods: {
      getAuthorityData() {
        return new Promise((resolve, reject) => {
          this.$http.get(this.getFindOneRequest, {
            params: {
              id: this.perRoleId
            }
          }).then(response => {
            console.log('getAuthorityData+++++', response)
            // console.log('route data+++++', JSON.parse(response.data.resourceCode || ''))
            let result
            response = response.data
            // result = response.resourceCode !== '' ? JSON.parse(response.resourceCode) : ''
            // result = result instanceof Array ? result : []
            this.formData = Object.assign(this.formData, {
              name: response.name,
              id: this.perRoleId,
              code: response.code,
              type: response.type
            })
            this.authoorityData = response.resourceCode !== '' ? JSON.parse(response.resourceCode) : ''
            this.tableLoading = false

            resolve()
          }).catch(error => {
            console.log(error)
            reject()
          })
        })

      },
      transformRouteData() {
        console.log('this.menuData', this.menuData)
        // debugger
        const menuData = this.menuData[0]
        let result = []
        let tableFormData = {}
        const getChildata = (parentTitle, parentName, name, routeData) => {
          if (routeData.configurable !== undefined && !routeData.configurable) {
            return
          }
          if (routeData.children && routeData.children instanceof Array && routeData.children.length > 0) {
            routeData.children.forEach(item => {
              const parentTitle = routeData.meta ? routeData.meta.title || '' : ''
              const parentName = routeData.name
              getChildata(parentTitle, parentName, name, item)
            })
          } else {
            const childName = routeData.meta ? routeData.meta.title || '' : ''
            let title = childName instanceof Array ? childName.join('/') : childName
            result.push({
              title: (parentTitle && parentTitle !== '' ? parentTitle + '/' : '') + title || '',
              parentName: parentName,
              name: routeData.name,
              functionaility: routeData.meta.functionaility,
            })
          }
        }
        getChildata('', '', '', menuData)

        const tempTableFormData = {}
        result.forEach((item, index) => {
          if (!this.authoorityData[item.name]) {
            tempTableFormData[item.name] = {
              active: false,
              functionaility: JSON.parse(JSON.stringify(item.functionaility))
            }
          } else {
            tempTableFormData[item.name] = this.authoorityData[item.name]
          }
        })
        tableFormData = tempTableFormData
        this.tableData = result
        this.tableOriginData = result
        this.tableFormData = tableFormData
        //  queryList = result
        let queryList = JSON.parse(JSON.stringify(result))
        queryList.unshift(Object.assign(JSON.parse(JSON.stringify(queryList[0])), {
          title: '全部',
          name: 'all'
        }))
        this.queryList = queryList
      },

      getFunctionailityTableData(scope) {
        const functionailityList = scope.row.functionaility || []
        let result = []
        const functionailityDictionary = this.functionailityDictionary.map(item => Object.assign(item, {
          active: false
        }))
        functionailityDictionary.forEach((item1, index1) => {
          const routeData = functionailityList.filter(item2 => {
            let result = false
            if (item2 === item1.code) {
              result = true
            }

            return result
          }).length > 0
          let active = false
          if (routeData) {
            active = true
            result.push(Object.assign(item1, {
              active: active
            }))
          }


        })
        return result
      },
      highlightTable() {
        let authoorityData = this.authoorityData
        this.tableData.forEach((item1, index1) => {
          Object.keys(authoorityData).forEach((item2, index2) => {
            if (item1.name === item2 && authoorityData[item2].active) {
              this.$nextTick(item => {
                this.$refs.multipleTable.toggleRowSelection(item1, true); //点击选中
              })
            }
          })

        })
      },
      getTableData() {
        this.tableLoading = true
      },
      query() {
        console.log(this.tableFormData)
        if (this.advanceQueryParams.menuName !== '') {
          // this.tableOriginFormData = this.tableFormData
          if (this.advanceQueryParams.menuName === 'all') {
            this.tableData = this.tableOriginData
          } else {
            this.tableData = this.tableOriginData.filter(item => item.name === this.advanceQueryParams.menuName)
          }
          this.highlightTable()
        }
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
      handleChangeCheckboxGroup(data) {
        console.log(data)
        console.log(this.tableFormData)
      },
      handleSubmit() {
        const submitData = JSON.stringify(this.selectionData2.map(item => {
          return item.name
        }))
        console.log('handleSubmit+++', this.tableFormData)
        this.$http.post(this.saveOrUpdatePerRoleRequest, Object.assign(this.formData, {
          resourceCode: JSON.stringify(this.tableFormData),
        })).then(response => {
          console.log(response)
          this.$message.success('保存成功')
          this.getAuthorityData()
        }).catch(error => {
          console.log(error)
          this.$message.error(error)
        })

      },
      handleDelete() {

      },
      authoritySetting() {
        this.$router.push({
          name: 'authoritySetting'
        })
      },
      handleSelect(selectionList, selection) {
        this.selectionData2 = selectionList
        this.tableFormData[selection.name].active = !this.tableFormData[selection.name].active
      },
      handleSelectionChange2(selection) {

      },

      handleChooseNemuName(data) {
        // let result
      }
    }
  }

</script>

<style lang="scss" scoped></style>
