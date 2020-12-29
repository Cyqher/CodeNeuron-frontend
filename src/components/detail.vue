<template>
  <a-card title="Element Selected Detail Info" :bordered="false">
    <div v-if="this.Type=='node'">
        <p><i>Element Type</i>：{{this.Type}}</p>
      <p><i>Node Name</i>：{{this.Name}}</p>
    </div>
    <div v-else-if="this.Type=='edge'">
        <p><i>Element Type</i>:  {{this.Type}}</p>
        <p><i>Source Node</i>: {{this.source}}</p>
        <p><i>Target Node</i>: {{this.target}}</p>
        <p><i>Closeness</i>: {{this.closeness}}</p>
        <p><i>Reference Type</i>: {{this.typeOfCall}}</p>
    </div>
    <div v-else-if="this.Type=='domain'">
        <p><i>Element Type</i>:  {{this.Type}}</p>
        <p><i>Number of Nodes included</i>: {{this.includedNode}}</p>
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