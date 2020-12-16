<template>
  <a-layout id="components-layout-demo-fixed-sider">
    <a-layout-sider
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 , width: '250px'}"
      style="max-width:250px"
    >
      <div class="adminAvatar">
        <a-avatar @click="showLogoutModal" style="backgroundColor:#87d068" icon="user" />
        <span style="margin-left:15px;color:#fff;">{{adminname}}</span>
      </div>
      <a-menu theme="dark" mode="inline" :defaultSelectedKeys="['1']">
        <a-menu-item key="1" @click="goToStatistics">
          <a-icon type="bar-chart" />
          <span class="nav-text">Statistics</span>
        </a-menu-item>
        <a-menu-item key="2" @click="goToAdmins">
          <a-icon type="user" />
          <span class="nav-text">Admins</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout :style="{ marginLeft: '250px','min-height':'100vh' }">
      <a-layout-header :style="{ background: '#fff', padding: 0 }" />
      <a-layout-content
        v-if="currentPage=='statistics'"
        :style="{ margin: '24px 16px 0', overflow: 'initial' }"
      >
        <div :style="{ padding: '24px', background: '#fff', textAlign: 'center' }">
          <a-table
            :columns="columns"
            :dataSource="outerData"
            :expandedRowRender="getSubTableData"
            class="components-table-demo-nested"
            v-if="!onLoading"
          >
            <a slot="operation">Delete</a>
            <a-icon type="bar-chart" slot="expandIcon" />
          </a-table>
          <a-spin size="large" v-if="onLoading"/>
        </div>
      </a-layout-content>
      <a-layout-content
        v-if="currentPage=='admins'"
        :style="{ margin: '24px 16px 0', overflow: 'initial' }"
      >
        <div :style="{ padding: '24px', background: '#fff', textAlign: 'center' }">admins page</div>
      </a-layout-content>
      <a-layout-footer :style="{ textAlign: 'center' }">CodeNeuron @2020</a-layout-footer>
    </a-layout>
    <a-modal title="Logout" v-model="visible" @ok="logout">
      <p>Are you sure to logout?</p>
    </a-modal>
    <a-drawer
      title="NODES DETAIL"
      placement="left"
      :closable="true"
      @close="onClose"
      :visible="nodeDrawerVisible"
      width="60%"
    >
      <a-table :columns="nodeDrawerColumns" :dataSource="nodeDrawerData"></a-table>
    </a-drawer>
    <a-drawer
      title="EDGES DETAIL"
      placement="left"
      :closable="true"
      @close="onClose"
      :visible="edgeDrawerVisible"
      width="60%"
      style="overflow:auto"
    >
      <a-table :columns="edgeDrawerColumns" :dataSource="edgeDrawerData"></a-table>
    </a-drawer>
    <a-drawer
      title="DOMAINS DETAIL"
      placement="left"
      :closable="true"
      @close="onClose"
      :visible="domainDrawerVisible"
      width="60%"
    >
      <a-table :columns="domainDrawerColumns" :dataSource="domainDrawerData"></a-table>
    </a-drawer>
    <a-drawer
      title="COMMENTS DETAIL"
      placement="left"
      :closable="true"
      @close="onClose"
      :visible="commentDrawerVisible"
      width="60%"
    >
      <a-table :columns="commentDrawerColumns" :dataSource="commentDrawerData"></a-table>
    </a-drawer>
  </a-layout>
</template>

<script>
const columns = [
  { title: "User ID", dataIndex: "userId", key: "userId" },
  { title: "User Name", dataIndex: "userName", key: "userName" },
  { title: "Total Projects", dataIndex: "totalProjects", key: "totalProjects" },
  {
    title: "Action",
    key: "operation",
    scopedSlots: { customRender: "operation" }
  }
];

const innerColumns = [
  { title: "Project ID", dataIndex: "projectId", key: "projectId" },
  { title: "Project Name", dataIndex: "projectName", key: "projectName" },
  {
    title: "Current Threshold",
    dataIndex: "currentThreshold",
    key: "currentThreshold"
  },
  { title: "Nodes count", dataIndex: "nodesCount", key: "nodesCount" },
  { title: "Edges count", dataIndex: "edgesCount", key: "edgesCount" },
  { title: "Domains count", dataIndex: "domainsCount", key: "domainsCount" },
  { title: "Comments count", dataIndex: "commentsCount", key: "commentsCount" },
  {
    title: "Action",
    dataIndex: "operation2",
    key: "operation2",
    scopedSlots: { customRender: "operation2" }
  }
];
const nodeDrawerColumns = [
  { title: "id", dataIndex: "id", key: "id" },
  { title: "name", dataIndex: "name", key: "name", ellipsis: true },
  { title: "project id", dataIndex: "projectId", key: "projectId" }
];
const edgeDrawerColumns = [
  { title: "id", dataIndex: "id", key: "id" },
  {
    title: "caller name",
    dataIndex: "callerName",
    key: "callerName",
    ellipsis: true
  },
  {
    title: "callee name",
    dataIndex: "calleeName",
    key: "calleeName",
    ellipsis: true
  },
  { title: "closeness", dataIndex: "closeness", key: "closeness" }
];
const domainDrawerColumns = [
  {
    title: "domain id",
    dataIndex: "domainId",
    key: "domainId"
  },
  {
    title: "node id",
    dataIndex: "nodeId",
    key: "nodeId"
  },
  {
    title: "node name",
    dataIndex: "nodeName",
    key: "nodeName"
  }
];
const commentDrawerColumns = [
  {
    title: "id",
    dataIndex: "commentId",
    key: "commentId"
  },
  {
    title: "title",
    dataIndex: "commentTitle",
    key: "commentTitle"
  },
  {
    title: "content",
    dataIndex: "commentContent",
    key: "commentContent"
  },
  {
    title: "type",
    dataIndex: "commentType",
    key: "commentType"
  },
  {
    title: "related id",
    dataIndex: "relatedId",
    key: "relatedId"
  }
];
//点击头像logout
export default {
  created() {
    let that = this;
    this.$axios.get("/api/user/allUser").then(res => {
      if (res.data.success) {
        let allPromises = [];
        res.data.content.forEach(user => {
          let tmp = {};
          tmp.key = user.id;
          tmp.userId = user.id;
          tmp.userName = user.name;
          allPromises.push(
            new Promise(resolve => {
              that.$axios
                .get("/api/project/user?userId=" + user.id)
                .then(res => {
                  if (res.data.success) {
                    tmp.totalProjects = res.data.content.length;
                    that.outerData.push(tmp);
                    resolve(res);
                  } else {
                    console.log(res.data.message);
                  }
                });
            })
          );
        });
        Promise.all(allPromises).then(() => {
          let that = this;
          this.outerData.forEach(function(user) {
            let userid = user.userId;
            that.innerData[userid] = [];
            that.$axios.get("/api/project/user?userId=" + userid).then(res => {
              if (res.data.success) {
                res.data.content.forEach(project => {
                  let tmpProject = {};
                  tmpProject.key = project.id;
                  tmpProject.projectId = project.id;
                  tmpProject.projectName = project.name;
                  tmpProject.currentThreshold = project.closenessThreshold;
                  let nodeReq = that.$axios.get(
                    "/api/graph/nodecount?projectId=" + project.id
                  );
                  let edgeReq = that.$axios.get(
                    "/api/graph/edgecount?projectId=" + project.id
                  );
                  let domainReq = that.$axios.get(
                    "/api/domain/getCount?threshold=" +
                      project.closenessThreshold +
                      "&projectId=" +
                      project.id
                  );
                  let commentReq1 = that.$axios.get(
                    "/api/comment/get?type=node&projectId=" + project.id
                  );
                  let commentReq2 = that.$axios.get(
                    "/api/comment/get?type=edge&projectId=" + project.id
                  );
                  let commentReq3 = that.$axios.get(
                    "/api/comment/get?type=domain&projectId=" + project.id
                  );
                  that.$axios
                    .all([
                      nodeReq,
                      edgeReq,
                      domainReq,
                      commentReq1,
                      commentReq2,
                      commentReq3
                    ])
                    .then(
                      that.$axios.spread(
                        (
                          nodeReq,
                          edgeReq,
                          domainReq,
                          commentReq1,
                          commentReq2,
                          commentReq3
                        ) => {
                          if (
                            nodeReq.data.success ||
                            edgeReq.data.success ||
                            domainReq.data.success
                          ) {
                            tmpProject.nodesCount = nodeReq.data.content;
                            tmpProject.edgesCount = edgeReq.data.content;
                            if (!domainReq.data.success) {
                              tmpProject.domainsCount = domainReq.data.message;
                            } else {
                              tmpProject.domainsCount = domainReq.data.content;
                            }
                            tmpProject.commentsCount =
                              commentReq1.data.content.length +
                              commentReq2.data.content.length +
                              commentReq3.data.content.length;
                            that.innerData[userid].push(tmpProject);
                            that.innerData[userid].sort((a, b) => a.id - b.id);
                          } else {
                            console.log(nodeReq.data.message);
                            console.log(edgeReq.data.message);
                            console.log(domainReq.data.message);
                          }
                        }
                      )
                    );
                    that.onLoading= false;
                });
              } else {
                console.log(res.data.message);
              }
            });
          });
        });
      } else {
        console.log(res.data.message);
      }
    });
  },
  watch: {
    outerData() {}
  },
  data() {
    return {
      id: localStorage.adminid,
      adminname: localStorage.adminname,
      visible: false,
      onLoading: true,
      currentPage: "statistics",
      outerData: [],
      columns,
      innerColumns,
      innerData: {},
      nodeDrawerVisible: false,
      edgeDrawerVisible: false,
      domainDrawerVisible: false,
      commentDrawerVisible: false,
      nodeDrawerColumns,
      nodeDrawerData: [],
      edgeDrawerData: [],
      edgeDrawerColumns,
      domainDrawerColumns,
      domainDrawerData: [],
      commentDrawerColumns,
      commentDrawerData: []
    };
  },
  methods: {
    showLogoutModal() {
      this.visible = true;
    },
    displayNode(e) {
      this.nodeDrawerData = [];
      console.log(e.key);
      let id = e.key.slice(e.key.lastIndexOf("_") + 1, e.key.length);
      this.drawerTitle = "Nodes detail";
      let that = this;
      this.$axios.get("/api/project/nodes?projectId=" + id).then(function(res) {
        if (res.data.success) {
          res.data.content.forEach(node => {
            that.nodeDrawerData.push({
              id: node.id,
              name: node.name,
              projectId: node.projectId
            });
          });
          that.nodeDrawerVisible = true;
        } else {
          console.log(res.data.message);
        }
      });
    },
    displayEdge(e) {
      this.edgeDrawerData = [];
      console.log(e.key);
      let id = e.key.slice(e.key.lastIndexOf("_") + 1, e.key.length);
      this.drawerTitle = "Edges detail";
      let that = this;
      this.$axios.get("/api/project/edges?projectId=" + id).then(function(res) {
        if (res.data.success) {
          res.data.content.forEach(edge => {
            that.edgeDrawerData.push({
              id: edge.id,
              callerName: edge.callerName,
              calleeName: edge.calleeName,
              closeness: edge.closeness
            });
          });
          that.edgeDrawerVisible = true;
        } else {
          console.log(res.data.message);
        }
      });
    },
    displayDomain(e) {
      this.domainDrawerData = [];

      let id = e.key.slice(e.key.lastIndexOf("_") + 1, e.key.length);
      let that = this;
      this.$axios
        .get("/api/domain/getCurrent?projectId=" + id)
        .then(function(res) {
          if (res.data.success) {
            Object.keys(res.data.content).forEach(domainid => {
              res.data.content[domainid].forEach(node => {
                that.domainDrawerData.push({
                  domainId: domainid,
                  nodeId: node.id,
                  nodeName: node.name
                });
              });
            });
            console.log(res.data.content);
            that.domainDrawerVisible = true;
          } else {
            console.log(res.data.message);
          }
        });
    },
    displayComment(e) {
      this.commentDrawerData = [];
      let id = e.key.slice(e.key.lastIndexOf("_") + 1, e.key.length);
      let that = this;
      let nodeReq = this.$axios.get(
        "/api/comment/get?type=node&projectId=" + id
      );
      let edgeReq = this.$axios.get(
        "/api/comment/get?type=edge&projectId=" + id
      );
      let domainReq = this.$axios.get(
        "/api/comment/get?type=domain&projectId=" + id
      );
      that.$axios.all([nodeReq, edgeReq, domainReq]).then(
        that.$axios.spread((node, edge, domain) => {
          if (node.data.success && edge.data.success && domain.data.success) {
            let all = node.data.content
              .concat(edge.data.content)
              .concat(domain.data.content);
            all.forEach(n => {
              that.commentDrawerData.push({
                commentId: n.id,
                commentTitle: n.title,
                commentContent: n.content,
                commentType: n.type,
                relatedId: n.relatedId
              });
              that.commentDrawerVisible = true;
            });
          }
        })
      );

      this.drawerVisible = true;
    },
    onClose() {
      this.nodeDrawerVisible = false;
      this.edgeDrawerVisible = false;
      this.domainDrawerVisible = false;
      this.commentDrawerVisible = false;
    },
    logout() {
      localStorage.removeItem("adminname");
      localStorage.removeItem("adminid");
      this.visible = false;
      window.location.href = "login";
    },
    goToAdmins() {
      this.currentPage = "admins";
    },
    goToStatistics() {
      this.currentPage = "statistics";
    },
    getSubTableData(record) {
      var insertNode;
      let that = this;
      //vnode
      //  <a-table
      //         :columns="innerColumns"
      //         :dataSource="innerData[record.key]"
      //         :pagination="false"
      //       >
      //         <span slot="operation" class="table-operation">
      //           <a-dropdown>
      //             <a-menu slot="overlay">
      //               <a-menu-item>All nodes</a-menu-item>
      //               <a-menu-item>All edges</a-menu-item>
      //               <a-menu-item>All domains</a-menu-item>
      //               <a-menu-item>All comments</a-menu-item>
      //             </a-menu>
      //             <a>
      //               More
      //               <a-icon type="down" />
      //             </a>
      //           </a-dropdown>
      //         </span>
      //       </a-table>
      // let that = this;
      insertNode = this.$createElement("a-table", {
        props: {
          columns: that.innerColumns,
          dataSource: that.innerData[record.key],
          pagination: false
        },
        scopedSlots: {
          operation2: (noused, line) =>
            that.$createElement(
              "span",
              {
                class: "table-operation"
              },
              [
                that.$createElement("a-dropdown", [
                  that.$createElement(
                    "a-menu",
                    {
                      slot: "overlay"
                    },
                    [
                      that.$createElement(
                        "a-menu-item",
                        {
                          on: {
                            click: that.displayNode
                          },
                          key: "node_for_" + line.key
                        },
                        "All Nodes"
                      ),
                      that.$createElement(
                        "a-menu-item",
                        {
                          on: {
                            click: that.displayEdge
                          },
                          key: "edge_for_" + line.key
                        },
                        "All Edges"
                      ),
                      that.$createElement(
                        "a-menu-item",
                        {
                          on: {
                            click: that.displayDomain
                          },
                          key: "domain_for_" + line.key
                        },
                        "All Domains"
                      ),
                      that.$createElement(
                        "a-menu-item",
                        {
                          on: {
                            click: that.displayComment
                          },
                          key: "comment_for_" + line.key
                        },
                        "All Comments"
                      )
                    ]
                  ),
                  that.$createElement("a", [
                    "more",
                    that.$createElement("a-icon", {
                      attrs: {
                        type: "down"
                      }
                    })
                  ])
                ])
              ]
            )
        }
      });
      return insertNode;
    }
  }
};
</script>
<style>
#components-layout-demo-fixed-sider .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

.adminAvatar {
  height: 32px;
  margin: 16px;
}
</style>
