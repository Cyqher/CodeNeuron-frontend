<template>
  <a-layout-content :style="{ padding: '0 10px', marginTop: '64px'}" style="background-color:#fff">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-row>
          <wsinfo ></wsinfo>
        </a-row>
        <a-row>
          <searchpaths ></searchpaths>
        </a-row>
        <a-row>
          <commentInfo></commentInfo>
        </a-row>
        <a-row>
          <funccode></funccode>
        </a-row>
        <a-row>
          <structure></structure>
        </a-row>
      </a-col>
      <a-col :span="16">
        <a-row>
          <graph></graph>
        </a-row>
        <a-row>
          <detail></detail>
        </a-row>
      </a-col>
    </a-row>
  </a-layout-content>
</template>
<script>
import searchpaths from "./searchpaths";
import structure from "./structure";
import funccode from "./funccode";
import graph from "./graph";
import wsinfo from "./wsinfo";
import commentInfo from "./commentInfo";
import detail from "./detail";
export default {
  beforeCreate() {
    let project_url = "/api/project/user?userId=" + this.$store.state.user.id;
    let that = this;
    //获得项目信息
    this.$axios.get(project_url).then(function(res) {
      if (res.data.success) {
        that.$store.commit("changeAll", res.data.content);
        that.$store.commit("changeCurrent", res.data.content[0]);
        //获得node、edge
        that.$store.commit("changeFocusNode", {});
        that.$store.commit("updateNodes");
        that.$store.commit("updateEdges");
        that.$store.commit("updateStructure");
        that.$store.commit("updateDomains");
      } else {
        console.log(res.data.message);
      }
    });
  },
  data() {
    return {
      colCounts: 3,
      gutters: 24,
      vgutters: 8
    };
  },
  methods: {

  },
  components: {
    searchpaths,
    structure,
    funccode,
    graph,
    wsinfo,
    commentInfo,
    detail
  }
};
</script>

<style>
#components-layout-demo-fixed .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 24px 16px 0;
  float: left;
}
</style>

