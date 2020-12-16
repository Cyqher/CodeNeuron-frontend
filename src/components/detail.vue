<template>
  <a-card title="选中元素详细信息" :bordered="false">
    <div v-if="this.Type=='node'">
        <p>元素类型:  {{this.Type}}</p>
      <p>节点名称：{{this.Name}}</p>
    </div>
    <div v-else-if="this.Type=='edge'">
        <p>元素类型:  {{this.Type}}</p>
        <p>源节点: {{this.source}}</p>
        <p>目标节点: {{this.target}}</p>
        <p>紧密度: {{this.closeness}}</p>
        <p>引用类型: {{this.typeOfCall}}</p>
    </div>
    <div v-else-if="this.Type=='domain'">
        <p>元素类型:  {{this.Type}}</p>
        <p>包含节点个数: {{this.includedNode}}</p>
    </div>
    <a-empty v-else></a-empty>
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
    },
    focus() {
      return this.$store.state.focusNode;
    },
    type() {
      return this.$store.state.type;
    },
    focusEdge() {
      return this.$store.state.focusEdge;
    },
    included(){
        return this.$store.state.includedNode;
    }
  },
  watch: {
    type() {
      let typetype = this.type;
      this.showType(typetype);
    },
    focus() {
      let nodeName = this.focus.name;
      this.changeName(nodeName);
    },
    focusEdge(){
        let sourceName = this.focusEdge.callerName;
        let targetName = this.focusEdge.calleeName;
        let typeofcall = this.focusEdge.typeOfCall;
        let c = this.focusEdge.closeness;
        this.changeEdgeName(sourceName,targetName,typeofcall,c);
    },
    included(){
        let include = this.included;
        this.changeIncluded(include);
    }
  },
  data() {
    return {
      Type: "",
      Name: "",
      source:"",
      target:"",
      typeOfCall:"",
      closeness:0,
      includedNode:0,
    };
  },
  methods: {
    changeName(nodeName) {
      let that = this;
      that.Name = nodeName;
    },
    showType(typetype) {
      let that = this;
      that.Type = typetype;
    },
    changeEdgeName(sourceName,targetName,typeofcall,c){
        let that = this;
        that.source = sourceName;
        that.target = targetName;
        that.typeOfCall = typeofcall;
        that.closeness = c.toFixed(4);
    },
    changeIncluded(included){
        let that = this;
        that.includedNode = included;
    }
  }
};
</script>

<style scoped>
   .p{
       word-break:break-all；
   }
</style>