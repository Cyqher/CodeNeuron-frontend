<template>
  <a-layout-content :style="{ padding: '0 10px' }" style="background-color:#fff">
    <a-card style="height:700px; border: none">
      <a-tabs :activeKey="tabKey" @change="changeTab" tabPosition="left">
        <a-tab-pane tab="Invitation" :precision="2" :key="1">
          <a-empty v-if="data.length==0" style="margin-top:100px"></a-empty>
          <a-list v-else item-layout="horizontal" :data-source="data" style="width:60%">
            <a-list-item slot="renderItem" slot-scope="item">
              <a
                slot="actions"
                v-if="item.state==0"
                @click="acceptInvitation(item.id,item.teamId)"
              >Accept</a>
              <a slot="actions" v-if="item.state==0" @click="refuseInvitation(item.id)">Refuse</a>
              <a slot="actions" v-if="item.state==1">You have accepted</a>
              <a slot="actions" v-if="item.state==2">You have refused</a>
              <a-list-item-meta :description="item.time.format('YYYY-MM-DD HH:mm:ss')">
                <a slot="title">
                  <span style="font-size:20px;">{{ item.fromUsername+' '}}</span> invite you to join group
                  <span
                    style="font-size:20px;"
                  >{{' \''+item.teamName +'\''}}</span>
                </a>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-tab-pane>
        <a-tab-pane tab="Personal" :precision="2" :key="2">
          <div
            style="display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:space-between;width:100%"
          >
            <div style="flex:2">
              <a-list item-layout="horizontal" :data-source="personalData">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-list-item-meta>
                    <a slot="title" @click="changeCurrentUser(item.id)">{{ item.name }}</a>
                    <a-avatar
                      slot="avatar"
                      src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                    />
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </div>
            <div style="flex:8;">
              <a-card style="height:500px;overflow:auto">
                <div v-if="current!=0">
                  <div>
                    <a-textarea
                      :value="personalMsgInputValue"
                      placeholder="Input your message..."
                      allow-clear
                      @change="changePersonalMsgInputValue"
                      :auto-size="{ minRows: 3, maxRows: 5 }"
                      style="width:70%;margin-right:10px"
                    />
                    <a-button @click="sendPersonalMessage(current)">Send</a-button>
                  </div>
                  <a-list
                    item-layout="horizontal"
                    :data-source="personalMsg[current]"
                    style="height:80%"
                  >
                    <a-list-item slot="renderItem" slot-scope="item">
                      <a-list-item-meta :description="item.time.format('YYYY-MM-DD HH:mm:ss')">
                        <a slot="title">
                          <span v-if="item.from_username.length!=0">{{item.from_username +':'}}</span>
                          <span v-else>You:</span>
                          {{ item.content }}
                        </a>
                      </a-list-item-meta>
                    </a-list-item>
                  </a-list>
                </div>
                <a-empty v-else style="margin-top:100px"></a-empty>
              </a-card>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane tab="Group" :precision="2" :key="3">
          <div
            style="display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:space-between;width:100%"
          >
            <div style="flex:2">
              <a-list item-layout="horizontal" :data-source="groupData">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-list-item-meta>
                    <a slot="title" @click="changeCurrentGroup(item.id)">{{ item.name }}</a>
                    <a-avatar
                      slot="avatar"
                      src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                    />
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </div>
            <div style="flex:8;">
              <a-card style="height:500px;overflow:auto">
                <div v-if="currentGroup!=0">
                  <div>
                    <a-textarea
                      :value="groupMsgInputValue"
                      placeholder="Input your message..."
                      allow-clear
                      @change="changeGroupMsgInputValue"
                      :auto-size="{ minRows: 3, maxRows: 5 }"
                      style="width:70%;margin-right:10px"
                    />
                    <a-button @click="sendGroupMessage(currentGroup)">Send</a-button>
                  </div>
                  <a-list
                    item-layout="horizontal"
                    :data-source="groupMsg[currentGroup]"
                    style="height:80%"
                  >
                    <a-list-item slot="renderItem" slot-scope="item">
                      <a-list-item-meta :description="item.time.format('YYYY-MM-DD HH:mm:ss')">
                        <a slot="title">
                          <span v-if="item.fromUsername.length!=0">{{item.fromUsername +':'}}</span>
                          {{ item.content }}
                        </a>
                      </a-list-item-meta>
                    </a-list-item>
                  </a-list>
                </div>
                <a-empty v-else style="margin-top:100px"></a-empty>
              </a-card>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </a-layout-content>
</template>
<script>
import moment from "moment";

export default {
  created() {
    this.updateInvitation();
    this.updatePersonalMsgs();
    this.updateGroupMsgs();
  },
  props:{
    tabKey: Number,
    current: Number
  },
  data() {
    return {
      data: [],
      personalData: [],
      personalMsg: {},
      personalMsgInputValue: "",
      groupData: [],
      groupMsg: {},
      currentGroup: 0,
      groupMsgInputValue: "",
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    changeTab(key) {
      this.tabKey = key;
    },
    updateInvitation() {
      this.$axios
        .get("/socket/message/allInvitation?toUser=" + this.user.id)
        .then((res) => {
          if (res.data.success) {
            let invs = res.data.content;
            invs.forEach((inv) => {
              inv.time = moment(inv.time);
            });
            invs.reverse();
            console.log(invs);
            this.data = invs;
          } else {
            console.log(res.data.message);
          }
        });
    },
    acceptInvitation(id, tid) {
      this.$axios
        .get("/socket/message/updateInvitation?state=1&id=" + id)
        .then((res) => {
          if (res.data.success) {
            let joinForm = {
              userId: this.user.id,
              teamId: tid,
            };
            this.$axios.post("/api/team/join", joinForm).then((res) => {
              if (res.data.success) {
                this.$message.success("Joined successfully");
                this.updateInvitation();
              } else {
                console.log(res.data.message);
              }
            });
          }
        });
      console.log(id);
    },
    refuseInvitation(id) {
      this.$axios
        .get("/socket/message/updateInvitation?state=2&id=" + id)
        .then((res) => {
          if (res.data.success) {
            this.$message.success("You have refused the invitation");
            this.updateInvitation();
          } else {
            console.log(res.data.content);
          }
        });
    },
    updatePersonalMsgs() {
      this.$axios
        .get("/socket/message/30d?userId=" + this.user.id)
        .then((res) => {
          if (res.data.success) {
            this.personalData = [];
            this.personalMsg = {};
            let allMsgs = res.data.content;
            var k;
            for (k in allMsgs) {
              this.personalData.push({
                id: allMsgs[k].userId,
                name: allMsgs[k].userName,
              });
              this.personalMsg[k] = allMsgs[k].msgs;
              this.personalMsg[k].forEach((msg) => {
                msg.time = moment(msg.time);
                msg.from_username =
                  msg.from_user == this.user.id ? "" : allMsgs[k].userName;
              });
              this.personalMsg[k].reverse();
            }
          } else {
            console.log(res.data.content);
          }
        });
    },
    updateGroupMsgs() {
      this.$axios
        .get("/socket/message/group30d?userId=" + this.user.id)
        .then((res) => {
          if (res.data.success) {
            this.groupData = [];
            this.groupMsg = {};
            let allMsgs = res.data.content;
            var k;
            for (k in allMsgs) {
              this.groupData.push({
                id: k,
                name: allMsgs[k].team_name,
              });
              this.groupMsg[k] = allMsgs[k].msgs;
              this.groupMsg[k].forEach((msg) => {
                msg.time = moment(msg.time);
              });
              this.groupMsg[k].reverse();
            }
          } else {
            console.log(res.data.content);
          }
        });
    },
    changeCurrentUser(id) {
      this.current = id;
    },
    changeCurrentGroup(id) {
      this.currentGroup = id;
    },
    changePersonalMsgInputValue(e) {
      this.personalMsgInputValue = e.target.value;
    },
    changeGroupMsgInputValue(e) {
      this.groupMsgInputValue = e.target.value;
    },
    sendPersonalMessage(current) {
      if (this.personalMsgInputValue.length == 0) {
        this.$message.error("Cannot send empty message");
        return;
      }
      let data = {
        fromUser: this.user.id,
        toUser: current,
        content: this.personalMsgInputValue,
      };
      this.$axios.post("/socket/message/sendIndMsg", data).then((res) => {
        if (res.data.success) {
          this.$message.success("Send successfully");
          this.personalMsgInputValue = "";
          this.updatePersonalMsgs();
        } else {
          console.log(res.data.message);
        }
      });
    },
    sendGroupMessage(currentGroup) {
      if (this.groupMsgInputValue.length == 0) {
        this.$message.error("Cannot send empty message");
        return;
      }
      let data = {
        fromUser: this.user.id,
        fromUsername: this.user.name,
        groupId: currentGroup,
        groupName: this.groupMsg[currentGroup][0].teamName,
        content: this.groupMsgInputValue,
      };
      this.$axios.post("/socket/message/sendGrpMsg", data).then((res) => {
        if (res.data.success) {
          this.$message.success("Send successfully");
          this.groupMsgInputValue = "";
          this.updateGroupMsgs();
        } else {
          console.log(res.data.message);
        }
      });
    },
  },
};
</script>
