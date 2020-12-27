<template>
  <div>
    <a-layout-content
      :style="{ padding: '10px 15px', marginTop: '64px' }"
      style="background-color:#fff;min-height:100vh"
    >
      <a-card style="height:700px"  :bordered="false">
        <a-tabs :activeKey="key" @change="changeTab" tabPosition="left">
          <a-tab-pane tab="Joined" :precision="2" :key="1">
            <div style="display:flex;flex-wrap:wrap;" v-if="joinedPage[0]">
              <a-card
                :title="group.name"
                style="margin:30px;width: 300px"
                v-for="group in joinedGroups"
                :key="group.id"
              >
                <a-icon slot="extra" type="message" @click="sendGrpMsg(group.id,group.name)" />
                <!-- <a slot="extra">
                  <a-icon type="plus" />INVITE
                </a>-->
                <p v-for="teammate in group.teammates" :key="teammate.id">
                  {{teammate.name}}
                  <span v-if="teammate.id==group.leaderId">
                    <b>
                      <i>Leader</i>
                    </b>
                  </span>
                  <a-icon
                    @click="sendPersonalMsg(teammate.id)"
                    v-if="teammate.id!=user.id"
                    type="message"
                  />
                </p>
              </a-card>
            </div>
            <!-- 没joinedPage 显示空 -->
            <a-empty v-if="joinedPage[1]" style="margin-top:100px">
              <span slot="description">You have not joined any group.</span>
            </a-empty>

            <!-- 加载时显示loading状态 -->
            <a-spin v-if="joinedPage[2]" size="large" />
          </a-tab-pane>
          <a-tab-pane tab="Owned" :precision="2" :key="2">
            <a-row :gutter=[16,16]>
              <a-col :span="8">
              <div style="display:flex;flex-wrap:wrap;" v-if="ownedPage[0]">
                <a-card
                        :title="group.name"
                        style="margin:30px;width: 300px"
                        v-for="group in ownedGroups"
                        :key="group.id"
                >
                  <a-icon slot="extra" type="message" @click="sendGrpMsg(group.id,group.name)" />
                  <a slot="extra" @click="showInvitationModal(group.id,group.name)">
                    <a-icon type="plus" />INVITE
                  </a>
                  <p v-for="teammate in group.teammates" :key="teammate.id">
                    {{teammate.name}}
                    <span v-if="teammate.id==group.leaderId">
                    <b>
                      <i>Leader</i>
                    </b>
                  </span>
                    <a-icon
                            v-if="teammate.id!=user.id"
                            type="message"
                            @click="sendPersonalMsg(teammate.id)"
                    />
                  </p>
                </a-card>
              </div>
              </a-col>
              <a-col :span="16">
                <chat-page :tabKey="tabKey" :current="current" :currentGroup="currentGroupKey"></chat-page>
              </a-col>
            </a-row>
            <!-- 没ownedPage 显示空 -->
            <a-empty v-if="ownedPage[1]" style="margin-top:100px">
              <span slot="description">You have not created any group.</span>
            </a-empty>

            <!-- 加载时显示loading状态 -->
            <a-spin v-if="ownedPage[2]" size="large" />
          </a-tab-pane>
          <a-button
            type="primary"
            @click="createGroup"
            slot="tabBarExtraContent"
            style="margin-top:70px"
          >Create</a-button>
        </a-tabs>
      </a-card>
    </a-layout-content>

    <a-modal
      title="Create Group"
      :visible="visible"
      @ok="handleOk"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
    >
      <a-input
        :value="newGroupName"
        @change="changeNewGroupName"
        placeholder="Name for your new Group."
      ></a-input>
    </a-modal>
    <a-modal
      title="Invite user"
      :visible="invitationVisible"
      :confirm-loading="invitationLoading"
      @ok="sendInvitation"
      @cancel="cancelInvitation"
    >
      <a-select
        mode="multiple"
        label-in-value
        :value="value"
        placeholder="Select users"
        style="width: 100%"
        :filter-option="false"
        :not-found-content="fetching ? undefined : null"
        @search="fetchUser"
        @change="handleChange"
      >
        <a-spin v-if="fetching" slot="notFoundContent" size="small" />
        <a-select-option v-for="d in invitationData" :key="d.id">{{ d.name }}</a-select-option>
      </a-select>
    </a-modal>
    <a-modal
      title="Send message"
      @ok="sendMessage"
      @cancel="cancelMessage"
      :visible="messageVisible"
    >
      <a-input
        placeholder="Please input your message"
        :value="message"
        @change="changeMessageValue"
      ></a-input>
    </a-modal>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import chatPage from "../components/chatpage";
import workspace from "./workspace";
import projectCenter from "./projectCenter";
export default {
  created() {
    this.updateGroups();
  },
  data() {
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchUser, 800);

    return {
      visible: false,
      newGroupName: "",
      loading: false,
      confirmLoading: false,
      key: 1,
      CompoKey: 0,
      joinedPage: [false, false, true],
      ownedPage: [false, false, true],
      joinedGroups: [],
      ownedGroups: [],
      invitationVisible: false,
      invitationLoading: false,
      invitationUsername: "test",
      invitationData: [],
      value: [],
      fetching: false,
      targetGroupId: 0,
      targetGroupName: "",
      message: "",
      messageVisible: false,
      messageType: 0, //0:group,1:personal
      toGroupId: 0,
      toGroupName: "",
      toUserId: 0,
      tabKey: 1,
      current: 0,
      currentGroupKey: 0
    };
  },
  components: {
    chatPage
  },
  computed: {
    currentGroup() {
      return this.$store.state.currentGroup;
    },
    user() {
      return this.$store.state.user;
    },
    all() {
      return this.$store.state.all;
    },
  },
  methods: {
    createGroup() {
      this.visible = true;
    },
    handleOk() {
      this.confirmLoading = true;
      let data = {
        leaderId: this.user.id,
        name: this.newGroupName,
      };
      let that = this;
      this.$axios.post("/api/team/create", data).then((res) => {
        if (res.data.success) {
          that.visible = false;
          that.newGroupName = "";
          that.confirmLoading = false;
          that.updateGroups();
        } else {
          that.$message.error(res.data.message);
        }
      });
    },
    handleCancel() {
      this.visible = false;
      this.newGroupName = "";
    },
    changeNewGroupName(e) {
      this.newGroupName = e.target.value;
    },
    changeTab() {
      this.key = this.key == 1 ? 2 : 1;
    },
    updateGroups() {
      this.joinedPage = [false, false, true];
      this.ownedPage = [false, false, true];
      this.joinedGroups = [];
      this.ownedGroups = [];
      let userId = this.user.id;
      let that = this;
      this.$axios.get("/api/team/list?userId=" + userId).then((res) => {
        if (res.data.success) {
          let info = res.data.content;
          info.forEach((teamInfo) => {
            let team = {};
            Object.assign(team, teamInfo);
            that.$axios
              .get("/api/team/teammates?userId=" + team.id)
              .then((res) => {
                if (res.data.success) {
                  team.teammates = res.data.content;
                  if (team.leaderId == userId) {
                    that.ownedGroups.push(team);
                  } else {
                    that.joinedGroups.push(team);
                  }
                  if (that.joinedGroups.length != 0) {
                    that.joinedPage = [true, false, false];
                  } else {
                    that.joinedPage = [false, true, false];
                  }
                  if (that.ownedGroups.length != 0) {
                    that.ownedPage = [true, false, false];
                  } else {
                    that.ownedPage = [false, true, false];
                  }
                } else {
                  console.log(res.data.message);
                  that.ownedPage = [false, true, false];
                  that.joinedPage = [false, true, false];
                }
              });
          });
        } else {
          console.log(res.data.message);
        }
      });
    },
    showInvitationModal(tid, tname) {
      this.invitationVisible = true;
      this.targetGroupId = tid;
      this.targetGroupName = tname;
    },
    cancelInvitation() {
      this.invitationVisible = false;
      this.value = [];
      this.invitationData = [];
      this.fetching = false;
      this.targetGroupId = 0;
      this.targetGroupName = "";
    },
    fetchUser(value) {
      console.log("fetching user", value);
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.invitationData = [];
      this.fetching = true;
      this.$axios.get("/api/user/namelike?name=" + value).then((res) => {
        if (res.data.success) {
          if (fetchId !== this.lastFetchId) {
            // for fetch callback order
            return;
          }
          const data = [];
          res.data.content.forEach((user) => {
            if (user.id != this.user.id) {
              data.push({
                name: user.name,
                id: user.id,
              });
            }
          });
          this.invitationData = data;
          this.fetching = false;
        } else {
          this.fetching = false;
        }
      });
    },
    handleChange(value) {
      this.value = value;
      this.invitationData = [];
      this.fetching = false;
    },
    sendInvitation() {
      let targetUsers = this.value;
      console.log(targetUsers);
      //发送消息
      let that = this;
      targetUsers.forEach((user) => {
        let invitation = {
          fromUsername: that.user.name,
          toUser: user.key,
          teamId: that.targetGroupId,
          teamName: that.targetGroupName,
        };
        this.$axios.post("/socket/message/invite", invitation).then((res) => {
          if (res.data.success) {
            this.$message.success("Already sent invitation.");
            this.invitationVisible = false;
            this.value = [];
            this.invitationData = [];
            this.fetching = false;
            this.targetGroupId = 0;
            this.targetGroupName = "";
          } else {
            console.log(res.data.message);
          }
        });
      });
    },
    changeMessageValue(e) {
      this.message = e.target.value;
    },
    sendGrpMsg(gid, gname) {
      // this.toGroupId = gid;
      // this.toGroupName = gname;
      // this.messageType = 0;
      // this.messageVisible = true;
      this.tabKey = 3;
      this.currentGroupKey = gid;
    },
    sendPersonalMsg(uid) {
      // this.toUserId = uid;
      // this.messageType = 1;
      // this.messageVisible = true;
      this.tabKey=2;
      this.current = uid;
    },
    cancelMessage() {
      this.message = "";
      this.messageVisible = false;
    },
    sendMessage() {
      if (this.messageType == 0) {
        if (this.message.length == 0) {
          this.$message.error("Cannot send empty message");
          return;
        }
        let data = {
          fromUser: this.user.id,
          fromUsername: this.user.name,
          groupId: this.toGroupId,
          groupName: this.toGroupName,
          content: this.message,
        };
        this.$axios.post("/socket/message/sendGrpMsg", data).then((res) => {
          if (res.data.success) {
            this.$message.success("Send successfully");
            this.message = "";
            this.messageVisible = false;
          } else {
            console.log(res.data.message);
          }
          this.currentGroupKey = this.toGroupId;
        });
      } else if (this.messageType == 1) {
        if (this.message.length == 0) {
          this.$message.error("Cannot send empty message");
          return;
        }
        let data = {
          fromUser: this.user.id,
          toUser: this.toUserId,
          content: this.message,
        };
        this.$axios.post("/socket/message/sendIndMsg", data).then((res) => {
          if (res.data.success) {
            this.$message.success("Send successfully");
            this.message = "";
            this.messageVisible = false;
          } else {
            console.log(res.data.message);
          }
        });
      }
    },
  },
};
</script>
