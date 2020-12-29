<template>
  <a-card title="Project Info" :bordered="false">
    <a-dropdown slot="extra">
      <a class="ant-dropdown-link" @click="e => e.preventDefault()">
        Switch Workspace
        <a-icon type="down" />
      </a>
      <a-menu slot="overlay">
        <a-menu-item :key="project.id" v-for="project in all">
          <a
            @click="changeProject(project.id)"
            v-if="project.name==current.name"
          >{{project.name}}(current)</a>
          <a @click="changeProject(project.id)" v-else>{{project.name}}</a>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
    <div v-if="this.all.length!=0">
      <p><i>Workspace Name</i>：{{this.current.name}}</p>
      <p><i>Clossness Threshold</i>：{{this.current.closenessThreshold}}</p>
      <p><i>Set Threshold：(0-1 between)</i></p>
      <a-input-number
        size="small"
        :min="0"
        :max="1"
        :step="0.1"
        @change="onChange"
        :defaultValue="this.current.closenessThreshold"
      />
      <a-popconfirm title="Are you sure to update the threshold？" @confirm="updateThreshold" okText="Yes" cancelText="No" style="margin-left:8px">
        <a href="#" >Update</a>
      </a-popconfirm>
    </div>
    <a-empty v-else>
      <span slot="description">No projects.</span>
      <a-button type="primary" @click="goCreate">Create a project now!</a-button>
    </a-empty>
  </a-card>
</template>

<script>
export default {
  computed: {
    all() {
      console.log(this.$store.state.all);
      return this.$store.state.all;
    },
    current() {
      return this.$store.state.current;
    }
  },
  data() {
    return {
      threshold: 0
    };
  },
  methods: {
    changeProject: function(projectId) {
      let that = this;
      this.$store.state.all.forEach(function(p) {
        if (p.id === projectId) {
          that.$store.commit("changeCurrent", p);
        }
      });
      this.$store.commit("changeFocusNode", {});
      this.$store.commit("updateNodes");
      this.$store.commit("updateEdges");
      this.$store.commit("updateStructure");
      this.$store.commit("updateDomains");
    },
    onChange: function(value) {
      this.threshold = value;
    },
    updateThreshold: function() {
      console.log(this.threshold);
      if (this.threshold === null) {
        return;
      }
      let url =
        "/api/domain/setThreshold?threshold=" +
        this.threshold +
        "&projectId=" +
        this.current.id;
      let that = this;
      this.$axios.post(url).then(function(res) {
        if (res.data.success) {
          that.updateCurrentAndAll();
        } else {
          console.log(res.data.message);
        }
      });
    },
    updateCurrentAndAll: function() {
      let that = this;
      this.$axios
        .get("/api/project/user?userId=" + this.$store.state.user.id)
        .then(function(res) {
          if (res.data.success) {
            that.$store.commit("changeAll", res.data.content);
            res.data.content.forEach(project => {
              if (project.id == that.current.id) {
                that.$store.commit("changeCurrent", project);
              }
            });
            that.$store.commit("updateDomains");
            that.$message.success("Update successfully");
          }
        });
    },
    goCreate() {
      this.$store.commit("changeCurrentPage", "projectCenter");
    }
  }
};
</script>

<style scoped>
</style>