<template>
  <a-card title="目录结构" :bordered="false" class="outter-container">
    <a-button @click="showModal" slot="extra">Expand</a-button>
    <a-modal v-model="visible" onOk="handleOk" width="800px" :bodyStyle="body">
      <template slot="footer">
        <a-button key="ok" type="primary" @click="handleOk">Ok</a-button>
      </template>
      <a-input-search
        style="margin-bottom: 8px"
        placeholder="Press Enter to Search"
        @pressEnter="onSearch"
      />
      <div class="container" style="height:350px">
        <a-tree
          @expand="onExpand"
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          :treeData="gData"
          @select="onSelect"
        >
          <template slot="title" slot-scope="{title}">
            <span v-if="title.indexOf(searchValue) > -1" >
              {{title.substr(0, title.indexOf(searchValue))}}
              <span
                style="color: #f50"
              >{{searchValue}}</span>
              {{title.substr(title.indexOf(searchValue) + searchValue.length)}}
            </span>
            <span v-else>{{title}}</span>
          </template>
        </a-tree>
      </div>
    </a-modal>
    <a-input-search
      style="margin-bottom: 8px"
      placeholder="Press Enter to Search"
      @pressEnter="onSearch"
    />
    <div class="container" style="height:auto;overflow:auto">
      <a-tree
        @expand="onExpand"
        :expandedKeys="expandedKeys"
        :autoExpandParent="autoExpandParent"
        :treeData="gData"
        @select="onSelect"
      >
        <template slot="title" slot-scope="{title}">
          <span v-if="title.indexOf(searchValue) > -1">
            {{title.substr(0, title.indexOf(searchValue))}}
            <span style="color: #f50">{{searchValue}}</span>
            {{title.substr(title.indexOf(searchValue) + searchValue.length)}}
          </span>
          <span v-else>{{title}}</span>
        </template>
      </a-tree>
    </div>
  </a-card>
</template>

<script>
const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};
const res = [];
export default {
  mounted() {},
  computed: {
    current() {
      return this.$store.state.current;
    },
    gData() {
      return this.$store.state.structure;
    },
    focus() {
      return this.$store.state.focusNode;
    },
    dataList() {
      const generateList = data => {
        for (let i = 0; i < data.length; i++) {
          data[i].scopedSlots = { title: "title" };
          const node = data[i];
          const key = node.key;
          res.push({ key, title: key });
          if (node.children) {
            generateList(node.children);
          }
        }
        return res;
      };
      return generateList(this.gData);
    }
  },
  watch: {
    focus() {
      let val = this.focus.name;
      if(val===val){
        this.expandFromGraph(val);  
      }
    }
  },
  data() {
    return {
      expandedKeys: [],
      searchValue: "",
      autoExpandParent: true,
      visible: false,
      body: { width: "95%" }
    };
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onSearch(e) {
      let value = e.target.value;
      let that = this;
      let tmpCounter= 0;
      this.dataList.forEach(data => {
        if(data.key.indexOf(value)>-1){
          tmpCounter+=1;
        }
      })
      console.log(this.dataList);
      console.log(tmpCounter);
      if(tmpCounter==1){
        this.$store.state.nodes.forEach(node=>{
          if(node.name.indexOf(value)!=-1){
            this.$store.commit("changeFocusNode",node);
          }
        })
      }
      const expandedKeys = this.dataList
        .map(item => {
          if (item.key.indexOf(value) > -1) {
            return getParentKey(item.key, that.gData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      if(value.indexOf(":")!=-1){
        value = value.substring(value.indexOf(":")+1,value.length);
      }
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      });
    },
    expandFromGraph(val) {
      let that = this;
      const expandedKeys = this.dataList
        .map(item => {
          if (item.key.indexOf(val) > -1) {
            return getParentKey(item.key, that.gData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      Object.assign(this, {
        expandedKeys,
        searchValue: val.substring(val.indexOf(":")+1,val.length),
        autoExpandParent: true
      });
    },
    onSelect(selectedKeys) {
      let that = this;
      this.$store.state.nodes.forEach(function(node) {
        if (node.name === selectedKeys[0]) {
          that.$store.commit("changeFocusNode", node);
        }
      });
    },
    showModal() {
      this.visible = true;
    },
    handleOk() {
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.outter-container {
  overflow: auto;
}
.container {
  overflow: auto;
}
/* .ant-tree li {
  overflow: hidden;
  text-overflow:ellipsis;
word-wrap:break-word; 
word-break:break-all; }

.ant-tree li .ant-tree-node-content-wrapper {
  display: inline;
} */
</style>