<template>
  <a-card title="代码" :bordered="false">
    <a-button @click="showModal" slot="extra">Expand</a-button>
    <a-modal v-model="visible" :title="name" class="modal-container" onOk="handleOk" width="800px">
      <template slot="footer">
        <a-button key="copy" @click="handleCopy">Copy</a-button>
        <a-button key="ok" type="primary" @click="handleOk">Ok</a-button>
      </template>
      <a-empty v-if="code.length==0&&nocodeMessage.length==0" />
      <pre v-highlightjs="code" v-if="code.length!=0"><code class="java">
          </code></pre>
      <p v-if="nocodeMessage.length!=0">{{nocodeMessage}}</p>
    </a-modal>
    <a-empty v-if="code.length==0&&nocodeMessage.length==0" />
    <pre v-highlightjs="code" v-if="code.length!=0"><code class="java">
          </code></pre>
    <p v-if="nocodeMessage.length!=0">{{nocodeMessage}}</p>
  </a-card>
</template>

<script>
export default {
  computed: {
    node() {
      return this.$store.state.focusNode;
    }
  },
  watch: {
    node(val) {
      let that = this;
      console.log(val);
      if (typeof val.id == "undefined") {
        this.code = "";
        this.nocodeMessage = "";
        return;
      }
      this.$axios
        .get("/api/codeAnalysis/getcode?nodeId=" + val.id)
        .then(function(res) {
          if (res.data.success) {
            var tmp = res.data.content
              .split("\n")
              .map(line => line.substring(1))
              .join("\n");
            that.nocodeMessage = "";
            that.code = tmp;
          } else {
            that.code = "";
            that.nocodeMessage = res.data.message;
          }
        });
      if (val.name.length > 90) {
        let res = "";
        let tmp = val.name;
        while (tmp.length > 90) {
          res = res + tmp.slice(0, 90) + "\n";
          tmp = tmp.slice(90, tmp.length);
        }
        res += tmp;
        this.name = res;
      } else {
        this.name = val.name;
      }
    }
  },
  data() {
    return {
      code: "",
      nocodeMessage: "",
      visible: false,
      name: ""
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk() {
      this.visible = false;
    },
    handleCopy() {
      this.$clipboard(this.code.slice(5, this.code.length - 6));
      this.$message.info("复制成功");
    }
  }
};
</script>

<style scoped>
.modal-container {
  overflow: auto;
}
</style>