<template>
  <div class="apps-container">
    <el-row>
      <el-col :span="16" class="el-row--flex">
          <label>系统名称:</label>
          <el-input v-model="searchName" placeholder="请输入系统名称" clearable />
        </el-col>
        <el-col :span="8" class="el-row--flex">
            <el-button icon="el-icon-search" size="small" type="primary" @click="searchTable()">查询</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="searchTable(true)">重置</el-button>
          </el-col>
    </el-row>
    <el-row :gutter="14" class="btnList">
        <el-col :span="24">
          <el-button
            size="small"
            type="primary"
            @click="addApp()"
            icon="el-icon-plus"
            v-permission="{function:['ADD']}"
          >新增</el-button>
          <el-button
            size="small"
            type="success"
            @click="editApp()"
            icon="el-icon-edit"
            v-permission="{function:['EDIT']}"
          >修改</el-button>
          <el-button
            size="small"
            type="danger"
            icon="el-icon-delete"
            @click="delApp()"
            v-permission="{function:['REMOVE']}"
          >删除</el-button>
        </el-col>
      </el-row>

      <div>
        <el-table
          border
          v-loading="appTableLoading"
          ref="dragTable"
          :data="appList"
          style="width: 100%"
          @row-click="handleClickTableRow"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="nickname" label="系统名称" />
          <el-table-column prop="username" label="代理登录URL" />
          <el-table-column prop="job" label="原系统URL" />
          <el-table-column prop="phone" label="首页URL" />
          <el-table-column prop="exnumber" label="打开方式" />
          <el-table-column prop="mobile" width="120" label="单点登录" />
          <el-table-column prop="mobile" width="120" label="用户认证" />
          <el-table-column prop="mobile" width="120" label="设置可见范围" />
          <el-table-column prop="mobile" width="120" label="固定应用" />
          <el-table-column prop="mobile" width="120" label="是否有效" />
          <el-table-column prop="mobile" width="120" label="图标" />
        </el-table>
        <pagination
          :page-sizes="[5, 10, 15, 20]"
          :total="total"
          :limit="pageSize"
          :page="currentPage"
          :auto-scroll="true"
          @pagination="pagination"
        />
      </div>
  </div>
</template>

<script>
export default {
  name: 'Apps',
  data () {
    return {
      appList: [],

    }
  },
  methods: {
    addApp() {
      alert('添加APP');
    },
    editApp() {
      alert('编辑APP');
    },
    delApp() {
      alert('删除APP');
    }
  }
}
</script>

<style lang="scss">

</style>
