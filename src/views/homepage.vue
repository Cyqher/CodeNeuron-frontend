<template>
  <a-layout id="components-layout-demo-fixed">
    <a-layout-header :style="{ position: 'fixed', zIndex: 3, width: '100%' }">
      <a-col style="font-size:24px;float:left;color:#fff;">
        <a-icon style="color:#1890ff;" type="rocket" />&nbsp;CodeNeuron
      </a-col>
      <a-menu
        theme="dark"
        mode="horizontal"
        :defaultSelectedKeys="['1']"
        :selectedKeys="keys"
        :style="{ lineHeight: '64px' }"
        style="margin-left:200px"
      >
        <a-menu-item key="1" @click="goToWorkspace">Workspace</a-menu-item>
        <a-menu-item key="2" @click="goToProjectCenter">Projects</a-menu-item>
        <a-menu-item key="3" @click="goToTeamCenter">Groups</a-menu-item>
        <a-menu-item style="float:right">
          <div>
            <a-badge :count="notificationCount" dot>
              <a-icon key="4" @click="goToChat" style="color:#1890ff;" type="bell" />
            </a-badge>
            <a-dropdown>
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <a-icon type="user" />
                <a-icon type="down" />
              </a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a href="#" @click="Logout">Logout</a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <!-- <keep-alive>TODO:more state -->
      <workspace v-if="currentPage=='workspace'" style="min-height:100vh"></workspace>
    <!-- </keep-alive> -->
    <!-- <keep-alive> -->
      <projectCenter v-if="currentPage=='projectCenter'" style="min-height:100vh"></projectCenter>
    <!-- </keep-alive> -->
    <!-- <keep-alive> -->
      <teamCenter v-if="currentPage=='teamCenter'" style="min-height:100vh"></teamCenter>
    <!-- </keep-alive> -->
    <chat-page v-if="currentPage=='chatPage'&&update" style="min-height:100vh"></chat-page>
    <a-layout-footer :style="{ textAlign: 'center' }">©2020 Created by Code Neuron</a-layout-footer>
  </a-layout>
</template>
<script>
import workspace from "../components/workspace";
import projectCenter from "../components/projectCenter";
import teamCenter from "../components/groupCenter";
import chatPage from "../components/chatpage";

export default {
  beforeMount() {
    let userData = {
      name: localStorage.name,
      id: localStorage.id,
    };
    this.$store.commit("changeUser", userData);
    this.initWebSocket();
  },
  destroyed() {
    this.websocketclose();
  },
  data() {
    return {
      notificationCount: 0,
      update: true,
    };
  },
  components: {
    workspace,
    projectCenter,
    teamCenter,
    chatPage,
  },
  computed: {
    currentPage() {
      return this.$store.state.currentPage;
    },
    keys() {
      if (this.currentPage == "workspace") {
        return ["1"];
      } else if (this.currentPage == "projectCenter") {
        return ["2"];
      } else if (this.currentPage == "teamCenter") {
        return ["3"];
      } else if (this.currentPage == "homePage") {
        return ["4"];
      } else {
        return ["5"];
      }
    },
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    goToWorkspace() {
      this.$store.commit("changeCurrentPage", "workspace");
    },
    goToProjectCenter() {
      this.$store.commit("changeCurrentPage", "projectCenter");
    },
    goToTeamCenter() {
      this.$store.commit("changeCurrentPage", "teamCenter");
    },
    goToChat() {
      this.notificationCount = 0;
      this.$store.commit("changeCurrentPage", "chatPage");
    },
    Logout() {
      localStorage.removeItem("name");
      localStorage.removeItem("id");
      window.location.href = "login";
    },
    initWebSocket: function () {
      console.log(this.user);
      this.websock = new WebSocket(
        "ws://localhost:8091/websocket/" + this.user.id
      );
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen: function () {
      console.log("连接成功");
    },
    websocketonerror: function (e) {
      console.log(e);
    },
    websocketonmessage: function (e) {
      console.log(e);
      this.notificationCount = 1;
      this.update = false;
      // 在组件移除后，重新渲染组件
      // this.$nextTick可实现在DOM 状态更新后，执行传入的方法。
      this.$nextTick(() => {
        this.update = true;
      });
      this.$notification.open({
        message: "New message.",
        description: "Click to see detail",
        onClick: () => {
          this.goToTeamCenter();
        },
      });
    },
    websocketclose: function (e) {
      console.log(e);
    },
  },
};
</script>

<style scoped>
#components-layout-demo-fixed .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 24px 16px 0;
  float: left;
}
</style>
