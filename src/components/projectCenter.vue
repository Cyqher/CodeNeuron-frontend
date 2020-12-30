#eslint-disable-line no-unused-vars
<template>
  <a-layout-content
    :style="{ padding: '10px 15px', marginTop: '64px' }"
    style="background-color: #fff"
  >
    <a-card style="height: auto" :bordered="false">
      <!-- 有project  显示tab -->
      <a-tabs
        :activeKey="key"
        @change="changeTab"
        tabPosition="left"
        v-if="page[0]"
      >
        <a-tab-pane tab="Project Overview" :key="key">
          <div style="display: flex; flex-wrap: wrap">
            <a-card
              class="ProjectCard"
              :title="project.name"
              v-for="project in allProjectInfo"
              :key="project.id"
              ref="projects"
            >
              <div>
                <a-statistic title="Project Name" :value="project.name" />
                <a-statistic title="Team Name" :value="project.teamName" />
                <a-statistic
                  title="Nodes count"
                  :value="project.nodecount"
                  style="margin-right: 50px"
                />
                <a-statistic title="Edges count" :value="project.edgecount" />
                <a-statistic
                  title="Current Closeness Threshold"
                  :precision="2"
                  :value="project.closenessThreshold"
                />
              </div>

              <!-- 只在nodes数为0时显示上传文件 -->
              <div v-show="project.show">
                <br />
                <br />
                <p slot="description">
                  <b>
                    You have not uploaded source code for this project.
                    <br />Please upload a <i>.jar</i> and a <i>.zip</i> file for
                    your project.<br />
                    Please upload <i>.jar</i> file first, after success, upload
                    your <i>.zip</i> file.
                  </b>
                </p>
                <a-button @click="showUploadModal(project.id)">
                  Start Uploading
                </a-button>
                <br />
              </div>
              <div></div>
              <br />
              <div v-show="project.isLeader == true">
                <p>
                  <b>
                    Delete this project.
                    <br />Once deleted, the project can never be restored.
                  </b>
                </p>
                <a-button type="danger" ghost @click="deleteProject(project.id)"
                  >Delete this project</a-button
                >
              </div>
              <div v-show="project.isLeader == false">
                <p>
                  <b
                    >You are not the leader of your group, so you can't delete
                    this project.</b
                  >
                </p>
                <a-button type="danger" disabled ghost @click="deleteProject"
                  >Delete this project</a-button
                >
              </div>
            </a-card>
          </div>
        </a-tab-pane>
        <a-button
          type="primary"
          @click="goCreate"
          slot="tabBarExtraContent"
          style="margin-top: 70px"
          >Create</a-button
        >
      </a-tabs>

      <!-- 没project 显示空 -->
      <a-empty v-if="page[1]" style="margin-top: 100px">
        <span slot="description">No projects.</span>
        <a-button type="primary" @click="goCreate"
          >Create a project now!</a-button
        >
      </a-empty>

      <!-- 加载时显示loading状态 -->
      <a-spin v-if="page[2]" size="large" />

      <a-modal
        title="Create Project"
        :visible="visible"
        @ok="handleOk"
        :confirmLoading="confirmLoading"
        @cancel="handleCancel"
      >
        <a-input
          :value="newProjectName"
          @change="changeNewProjectName"
          placeholder="Name for your new project."
        ></a-input>
        <a-select
          @change="changeNewProjectTeam"
          style="width: 100%;padding-top=10px;"
          placeholder="Please select"
        >
          <a-select-option
            v-for="group in groups"
            :key="group.id"
            :value="group.id"
            >{{ group.name }}</a-select-option
          >
        </a-select>
      </a-modal>
      <a-modal
        title="Delete Project"
        :visible="deleteVisible"
        @ok="handleDeleteOk"
        @cancel="handleDeleteCancel"
        :confirmLoading="deleteConfirmLoading"
      >
        <a-input
          placeholder="Input the project name that you want to delete."
          :value="deleteProjectName"
          @change="changeDeleteProjectName"
        ></a-input>
      </a-modal>
      <a-modal
        title="Upload Files"
        :visible="uploadModalVisible"
        @ok="finishUpload"
        okText="Finish"
        :confirmLoading="confirmLoading"
        @cancel="handleUploadCancel"
      >
        <div>
          <uploader
            :key="uploader_key"
            :options="options"
            class="uploader-example"
            :autoStart="false"
            @file-success="onFileSuccess"
            @file-added="filesAdded"
          >
            <uploader-unsupport></uploader-unsupport>
            <uploader-drop>
              <uploader-btn :single="true" :attrs="attrs"
                >select Files</uploader-btn
              >
            </uploader-drop>
            <uploader-list></uploader-list>
          </uploader>
        </div>
      </a-modal>
    </a-card>
  </a-layout-content>
</template>
<script>
import SparkMD5 from "spark-md5";
export default {
  created() {
    {
      this.updateProjectList();
      console.log(this.$refs.projects.key);
    }
  },
  computed: {
    all() {
      return this.$store.state.all;
    },
  },
  watch: {
    fileList() {
      if (this.fileList.length == 2) {
        let suffix = [
          this.fileList[0].name.slice(-4),
          this.fileList[1].name.slice(-4),
        ];
        if (
          (suffix[0] == ".jar" && suffix[1] == ".zip") ||
          (suffix[1] == ".jar" && suffix[0] == ".zip")
        ) {
          this.checkFile = false;
        } else {
          this.checkFile = true;
        }
      } else {
        this.checkFile = true;
      }
    },
    all() {
      this.updateProjectList();
    },
  },
  data() {
    return {
      allProjectInfo: [],
      fileList: [],
      groups: [],
      uploading: false,
      checkFile: true, //上传文件检查
      key: 0, //tab高亮
      visible: false,
      confirmLoading: false,
      deleteConfirmLoading: false,
      newProjectName: "",
      newProjectTeam: 0,
      deleteVisible: false,
      deleteProjectName: "",
      page: [false, false, true],
      uploader_key: new Date().getTime(),
      options: {
        target: "",
        testChunks: false,
      },
      attrs: {
        accept: [".zip", ".jar"],
      },
      uploadModalVisible: false,
      uploadKey: -1,
      deleteId: -1
    };
  },
  methods: {
    showUploadModal(id) {
      this.uploadModalVisible = true;
      this.uploadKey = id;
      this.options.target = "/api/chunk/chunkUpload/" + this.uploadKey;
    },
    onFileSuccess: function (rootFile, file, response, chunk) {
      console.log(JSON.parse(response).model);
      this.updateProjectList();
    },
    computeMD5(file) {
      const loading = this.$loading({
        lock: true,
        text: "正在计算MD5",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let currentChunk = 0;
      const chunkSize = 10 * 1024 * 1000;
      let chunks = Math.ceil(file.size / chunkSize);
      let spark = new SparkMD5.ArrayBuffer();
      file.pause();

      loadNext();

      fileReader.onload = (e) => {
        spark.append(e.target.result);
        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();
          this.$nextTick(() => {
            console.log(
              "校验MD5 " + ((currentChunk / chunks) * 100).toFixed(0) + "%"
            );
          });
        } else {
          let md5 = spark.end();
          loading.close();
          this.computeMD5Success(md5, file);
          console.log(
            `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
              file.size
            } 用时：${new Date().getTime() - time} ms`
          );
        }
      };
      fileReader.onerror = function () {
        this.error(`文件${file.name}读取出错，请检查该文件`);
        loading.close();
        file.cancel();
      };

      function loadNext() {
        let start = currentChunk * chunkSize;
        let end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },
    computeMD5Success(md5, file) {
      file.uniqueIdentifier = md5; //把md5值作为文件的识别码
      file.resume(); //开始上传
    },
    filesAdded(file, event) {
      //大小判断
      const isLt100M = file.size / 1024 / 1024 < 10;
      if (!isLt100M) {
        this.$message.error(this.$t("error.error_upload_file_max"));
      } else {
        this.computeMD5(file);
      }
    },

    updateProjectList() {
      this.page = [false, false, true];
      this.allProjectInfo = [];
      let that = this;
      let allPromises = [];
      this.$store.state.all.forEach(function (project) {
        let tmp = {};
        Object.assign(tmp, project);
        allPromises.push(
          new Promise((resolve) => {
            that.$axios
              .get("/api/graph/nodecount?projectId=" + tmp.id)
              .then((res) => {
                if (res.data.success) {
                  tmp.nodecount = res.data.content;
                  if (res.data.content == 0) {
                    tmp.show = true;
                  }
                  resolve(res);
                } else {
                  console.log(res.data.message);
                }
              });
          })
        );
        allPromises.push(
          new Promise((resolve) => {
            that.$axios
              .get("/api/graph/edgecount?projectId=" + tmp.id)
              .then((res) => {
                if (res.data.success) {
                  tmp.edgecount = res.data.content;
                  if (res.data.content == 0) {
                    tmp.show = true;
                  }
                  resolve(res);
                } else {
                  console.log(res.data.message);
                }
              });
          })
        );
        allPromises.push(
          new Promise((resolve) => {
            that.$axios.get("/api/team/info?id=" + tmp.teamId).then((res) => {
              if (res.data.success) {
                let info = res.data.content;
                tmp.teamName = info.name;
                tmp.isLeader =
                  that.$store.state.user.id == info.leaderId ? true : false;
                that.allProjectInfo.push(tmp);
                that.allProjectInfo.sort((a, b) => a.id - b.id);
                that.key = that.allProjectInfo[0].id;

                if (res.data.content == 0) {
                  tmp.show = true;
                }
                resolve(res);
              } else {
                console.log(res.data.message);
              }
            });
          })
        );
      });
      Promise.all(allPromises).then(() => {
        if (this.allProjectInfo.length == 0) {
          this.page = [false, true, false];
        } else {
          this.page = [true, false, false];
        }
      });
    },
    goCreate() {
      let that = this;
      this.$axios
        .get("/api/team/list?userId=" + this.$store.state.user.id)
        .then((res) => {
          if (res.data.success) {
            let info = res.data.content;
            that.groups = [];
            info.forEach((team) => {
              if (team.leaderId == that.$store.state.user.id) {
                let tmp = {
                  id: team.id,
                  name: team.name,
                };
                that.groups.push(tmp);
              }
            });
            this.visible = true;
          } else {
            console.log(res.data.message);
          }
        });
    },
    handleOk() {
      console.log(this.newProjectTeam && this.newProjectName);
      console.log(this.newProjectTeam, this.newProjectName);
      if (!(this.newProjectTeam && this.newProjectName)) {
        this.$message.error("Please fill all fields.");
      } else {
        this.confirmLoading = true;
        let data = {
          teamId: this.newProjectTeam,
          closenessThreshold: 0,
          name: this.newProjectName,
        };
        let that = this;
        this.$axios.post("/api/project/create", data).then((res) => {
          if (res.data.success) {
            that.visible = false;
            that.confirmLoading = false;
            that.newProjectName = "";
            that.$store.commit("updateAll");
          } else {
            that.$message.error(res.data.message);
          }
        });
      }
    },
    handleUploadCancel() {
      this.uploadModalVisible = false;
    },
    handleCancel() {
      this.visible = false;
      this.newProjectName = "";
      this.newProjectTeam = 0;
    },
    changeTab(key) {
      this.key = key;
      this.options.target = "/api/chunk/chunkUpload/" + this.key;
    },
    handleChange(info) {
      const status = info.file.status;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        this.$message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    },
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    handleUpload() {
      const { fileList } = this;
      const jarFormData = new FormData();
      const zipFormData = new FormData();
      if (fileList[0].name.slice(-4) == ".jar") {
        jarFormData.append("file", fileList[0]);
        zipFormData.append("file", fileList[1]);
      } else {
        jarFormData.append("file", fileList[1]);
        zipFormData.append("file", fileList[0]);
      }
      this.uploading = true;
      let zipRequest = this.$axios.post(
        "/api/codeAnalysis/uploadzip?id=" + this.uploadKey,
        zipFormData
      );

      let jarRequest = this.$axios.post(
        "/api/codeAnalysis/uploadjar?id=" + this.uploadKey,
        jarFormData
      );
      let that = this;
      this.$axios.all([zipRequest, jarRequest]).then(
        that.$axios.spread((zipResponse, jarResponse) => {
          if (zipResponse.data.success && jarResponse.data.success) {
            that.$store.commit("updateAll");
            that.fileList = [];
            that.uploading = false;
            that.$message.success("upload successfully.");
          } else {
            that.uploading = false;
            that.$message.error("upload failed.");
          }
        })
      );
    },
    changeNewProjectName(e) {
      this.newProjectName = e.target.value;
    },
    changeNewProjectTeam(e) {
      console.log(e);
      this.newProjectTeam = e;
    },
    deleteProject(id) {
      this.deleteVisible = true;
      this.deleteId = id;
    },
    finishUpload() {
      let that = this;
      that.uploadModalVisible = false;
      that.$store.commit("updateAll");
    },
    handleDeleteCancel() {
      this.deleteVisible = false;
      this.deleteProjectName = "";
    },
    changeDeleteProjectName(e) {
      this.deleteProjectName = e.target.value;
    },
    handleDeleteOk() {
      let target = this.allProjectInfo.filter(
        (project) => project.id == this.deleteId
      );
      if (target[0].name == this.deleteProjectName) {
        this.deleteConfirmLoading = true;

        this.$axios
          .delete("/api/project/delete?projectId=" + this.deleteId)
          .then((res) => {
            if (res.data.success) {
              this.deleteConfirmLoading = false;
              this.deleteProjectName = "";
              this.deleteVisible = false;
              this.deleteId = -1;
              this.$store.commit("updateAll");
            } else {
              this.$message.error(res.data.message);
            }
          });
      } else {
        this.$message.error("Not match.");
      }
    },
  },
};
</script>

<style scoped>
.uploader-example {
  width: 99%;
  padding: 15px;
  margin: 10px auto 0;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.uploader-example .uploader-btn {
  margin-right: 4px;
}

.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}
.ProjectCard {
  margin: 30px;
  width: 700px;
  height: auto;
  max-height: 550px;
  overflow: auto;
  overflow-y: scroll;
  border: 1px solid grey;
}
</style>