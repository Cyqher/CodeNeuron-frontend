<template>
  <a-card title="搜索" :bordered="false">
    <div style="margin-bottom: 16px">
      <a-auto-complete
        :value="from"
        :dataSource="dataSource"
        @search="onSearchFrom"
        @select="onSelectFrom"
        @change="onChangeFrom"
        placeholder="from"
        :dropdownStyle="{width: '300px'}"
        :dropdownMatchSelectWidth="false"
        style="width: 100%"
      />
    </div>
    <div style="margin-bottom: 16px">
      <a-auto-complete
        :value="to"
        :dataSource="dataSource"
        @search="onSearchTo"
        @select="onSelectTo"
        @change="onChangeTo"
        placeholder="to"
        :dropdownStyle="{width: '300px'}"
        style="width: 100%"
      />
    </div>
    <a-button type="primary" icon="search" @click="getAllPaths">Search</a-button>
  </a-card>
</template>

<script>
const getLastPartName = name => {
  let splitPos = name.indexOf(":");
  let pos = name.slice(0, splitPos).lastIndexOf(".");
  return name.slice(pos + 1, name.length);
};
export default {
  mounted() {},
  data() {
    return {
      from: "",
      to: "",
      realFrom: "",
      realTo: "",
      dataSource: [],
      dataSourceFullName: [],
      timeoutFrom: null,
      timeoutTo: null
    };
  },
  methods: {
    getAllPaths: function() {
      console.log(this.realFrom||this.from,this.realTo||this.to)
      let url =
        "/api/path/all?source=" +
        (this.realFrom||this.from) +
        "&projectId=" +
        this.$store.state.current.id +
        "&target=" +
        (this.realTo||this.to);
      let that = this;
      this.$axios.get(url).then(function(res) {
        if (res.data.success) {
          let shortestLength = res.data.content.sort((a,b) => a.length-b.length)[0].length;
          let allExceptShortest = res.data.content.filter(path => path.length>=shortestLength);
          let shortest = res.data.content.filter(path=>path.length==shortest);
          that.$store.commit("changeAllPaths",allExceptShortest);
          that.$store.commit("changeShortestPaths",shortest);
        } else {
          that.$message.info(res.data.message);
        }
      });
    },
    onSearchFrom(value) {
      let result = [];
      let fullResult = [];
      this.$store.state.nodes.map(function(node) {
        if (node.name.indexOf(value) != -1) {
          fullResult.push(node.name);
          result.push(getLastPartName(node.name));
        }
      });
      if (result.length > 50) {
        this.dataSourceFullName = fullResult.slice(0, 50);
        this.dataSource = result.slice(0, 50);
      } else {
        this.dataSourceFullName = fullResult;
        this.dataSource = result;
      }
    },
    onSearchTo(value) {
      let result = [];
      let fullResult = [];
      this.$store.state.nodes.map(function(node) {
        if (node.name.indexOf(value) != -1) {
          fullResult.push(node.name);
          result.push(getLastPartName(node.name));
        }
      });
      if (result.length > 50) {
        this.dataSourceFullName = fullResult.slice(0, 50);
        this.dataSource = result.slice(0, 50);
      } else {
        this.dataSourceFullName = fullResult;
        this.dataSource = result;
      }
    },
    onChangeFrom(value) {
      this.from = value;
    },
    onChangeTo(value) {
      this.to = value;
    },
    onSelectFrom(value) {
      this.from = value;
      this.realFrom = this.dataSourceFullName[
        this.dataSource.indexOf(this.from)
      ];
      this.dataSource = [];
      this.dataSourceFullName = [];
    },
    onSelectTo(value) {
      this.to = value;
      this.realTo = this.dataSourceFullName[this.dataSource.indexOf(this.to)];
      this.dataSource = [];
      this.dataSourceFullName = [];
    }
  }
};
</script>

<style scoped>
</style>