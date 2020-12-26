<template>
  <a-card title="代码依赖图" :bordered="false">
    <a-button @click="createCytoscape" slot="extra" type="primary">Refresh!</a-button>
    <div style="text-align:center" v-if="visibleOption[0]">
      <a-spin size="large" />
    </div>
    <a-empty v-if="visibleOption[1]">
      <span slot="description">No uploaded source code for this project.</span>
      <a-button type="primary" @click="goUpload">Upload Now</a-button>
    </a-empty>
    <div v-if="visibleOption[2]">
      <div id="button">
        <a-button
          type="primary"
          shape="round"
          icon="dot-chart"
          size="large"
          :loading="iconLoading"
          @click="enterIconLoading"
          class="center"
        >开始渲染代码依赖图</a-button>
      </div>
      <div id="cy" ref="cy"></div>
    </div>
  </a-card>
</template>

<script>
/*eslint-disable*/
export default {
  mounted() {},
  computed: {
    currentProject() {
      return this.$store.state.current;
    },
    // nodes() {
    //   return this.$store.state.nodes;
    // },
    // edges() {
    //   return this.$store.state.edges;
    // },
    domains() {
      return this.$store.state.domains;
    },
    focus() {
      return this.$store.state.focusNode;
    },
    allPaths() {
      return this.$store.state.allPaths;
    },
    shortestPaths() {
      return this.$store.state.shortestPaths;
    },
  },
  watch: {
    currentProject() {
      this.visibleOption = [true, false, false];
      this.nodeName = "";
      let domainReq = this.$axios.get(
        "/api/domain/getCurrent?projectId=" + this.currentProject.id
      );
      let edgeReq = this.$axios.get(
        "/api/project/edges?projectId=" + this.currentProject.id
      );
      let that = this;
      this.$axios.all([domainReq, edgeReq]).then(
        that.$axios.spread((domainResponse, edgeResponse) => {
          that.nodes = [];
          that.edges = [];
          if (domainResponse.data.success && edgeResponse.data.success) {
            if (Object.keys(domainResponse.data.content).length == 0) {
              console.log("empty");
              that.visibleOption = [false, true, false];
            } else {
              var tmpNode = [];

              //
              for (let nodeListIdx in domainResponse.data.content) {
                that.nodes.push({
                  group: "nodes",
                  data: {
                    id: nodeListIdx,
                    type: "domain",
                    included: domainResponse.data.content[nodeListIdx].length,
                  },
                });
                domainResponse.data.content[nodeListIdx].forEach((node) => {
                  // let pos = node.name.indexOf(":");
                  // let length = node.name.length;
                  tmpNode.push(node.name);
                  //let Id = node.id;
                  let newNode = {
                    group: "nodes",
                    data: {
                      id: node.name,
                      parent: nodeListIdx,
                      type: "node",
                    },
                    position: {
                      x: node.x,
                      y: node.y,
                    },
                  };
                  // let newPosition = {
                  //   Id:{
                  //     x: node.x,
                  //     y: node.y
                  //   }
                  // }
                  // that.positions.push(newPosition);
                  that.nodes.push(newNode);
                  // console.log(node.x);
                  // console.log(node.y);
                });
              }
              edgeResponse.data.content.forEach((edge) => {
                if (
                  tmpNode.indexOf(edge.callerName) != -1 &&
                  tmpNode.indexOf(edge.calleeName) != -1 &&
                  edge.closeness >= that.currentProject.closenessThreshold
                ) {
                  that.edges.push({
                    data: {
                      source: edge.callerName,
                      target: edge.calleeName,
                      closeness: edge.closeness,
                    },
                  });
                }
              });
              that.visibleOption = [false, false, true];
            }
          }
        })
      );
    },
    focus(val) {
      // let tmp = "node[id=\""+val.name+"\"]";
      // filter not working with variable????
      let allNodes = this.cy.filter("node");
      allNodes.forEach((node) => {
        if (node._private.data.id == val.name) {
          node.emit("click");
          node.select();
          this.cy.zoom(2);
          this.cy.center(node);
        } else {
          node.unselect();
        }
      });
    },
    allPaths(val) {
      let eles = [];
      let valNode = [];
      let valEdge = [];
      val.forEach((path) => {
        for (let i = 0; i < path.length - 1; i++) {
          if (valNode.indexOf(path[i].node.name) == -1) {
            valNode.push(path[i].node.name);
          }
          if (
            valEdge.indexOf(
              path[i].node.name + " to " + path[i + 1].node.name
            ) == -1
          ) {
            valEdge.push(path[i].node.name + " to " + path[i + 1].node.name);
          }
        }
        if (valNode.indexOf(path[path.length - 1] == -1)) {
          valNode.push(path[path.length - 1].node.name);
        }
      });
      let allNodes = this.cy.filter("node");
      let allEdges = this.cy.filter("edge");
      let centeredEles = [];
      allNodes.forEach((node) => {
        if (valNode.indexOf(node._private.data.id) != -1) {
          centeredEles.push(node);
          node.style("content", node._private.data.id);
          node.select();
        } else {
          node.unselect();
        }
      });
      let start = centeredEles.filter(
        (ele) => ele._private.data.id == valNode[0]
      )[0];
      let end = centeredEles.filter(
        (ele) => ele._private.data.id == valNode[valNode.length - 1]
      )[0];
      this.cy.center(start);
      start.style("width", 40);
      start.style("height", 40);
      start.style("content", "SOURCE");
      end.style("width", 40);
      end.style("height", 40);
      end.style("content", "TARGET");
      allEdges.forEach((edge) => {
        if (
          valEdge.indexOf(
            edge._private.data.source + " to " + edge._private.data.target
          ) != -1
        ) {
          centeredEles.push(edge);
          edge.style("label", edge._private.data.closeness);
          edge.select();
        } else {
          edge.unselect();
        }
      });
      this.cy.zoom(2);
    },
  },
  name: "cytoscape",
  data() {
    return {
      nodes: [],
      edges: [],
      //positions: [],
      nodeName: "",
      visibleOption: [true, false, false],
      timer: "",
      iconLoading: false,
    };
  },
  methods: {
    goUpload() {
      this.$store.commit("changeCurrentPage", "projectCenter");
    },
    enterIconLoading() {
      this.timer = setTimeout(this.showGraph(), 3000);
      this.createCytoscape();
    },
    showGraph() {
      let c = document.getElementById("cy");
      let b = document.getElementById("button");
      c.style.display = "block";
      b.style.display = "none";
    },
    createCytoscape() {
      this.$cytoscape.warnings(false);
      // eslint-disable-next-line no-unused-vars
      const cy = this.$cytoscape({
        container: this.$refs.cy,
        boxSelectionEnabled: true,
        userZoomingEnabled: true, // 滚轮缩放
        wheelSensitivity: 0.2,
        autounselectify: false,
        autoungrabify: false,
        autolock: false,
        layout: {
          name: "preset",
          fit:true
        },
        minZoom: 0.28,
        maxZoom: 3,
        style: [
          {
            selector: "node",
            style: {
              //content: "data(id)",
              "text-opacity": 0.5,
              height: 10,
              width: 10,
              "pie-size": "100%",
              "text-valign": "center",
              "text-halign": "left",
              "pie-1-background-color": "#E8747C",
              // 'pie-1-background-size': 'mapData(occupy, 0, 10, 0, 100)',
            },
          },
          {
            selector: ":parent",
            css: {
              "text-valign": "top",
              "text-halign": "center",
              // 'text-halign': 'right',
              // 'text-rotation': '90deg', //文字旋转
            },
          },
          {
            selector: "edge",
            style: {
              width: 1,
              label: "data(label)",
              "target-arrow-shape": "triangle",
              // "target-arrow-fill": "hollow", //箭头填充 空心
              "line-color": "#9dbaea",
              "target-arrow-color": "#9dbaea",
              "curve-style": "bezier",
            },
          },
        ],
        elements: {
          nodes: this.nodes,
          edges: this.edges,
          //positions:this.positions
        },
      });
      // cy.add(this.nodes);
      // cy.add(this.edges);

      let data_this = this;
      data_this.cy=cy;
      cy.on("mouseover", "node", function (event) {
        let node = event.target;
        if (isNaN(node.id())) {
          data_this.nodeName = node.id();
        }
      });
      cy.center();
      cy.on("click", "node", function (event) {
        if (event.target._private.data.type == "node") {
          let node_name = event.target._private.data.id;
          data_this.$store.state.nodes.forEach((node) => {
            if (node.name == node_name) {
              data_this.$store.commit("changeFocusNode", node);
              data_this.$store.commit("changeType", "node");
              data_this.$store.commit("changeIfSelect", 1);
            }
          });
        } else {
          let domain_name = event.target._private.data.id;
          let included = event.target._private.data.included;
          data_this.$store.commit("changeSelectedDomain", domain_name);
          data_this.$store.commit("changeIncludedNode", included);
          data_this.$store.commit("changeType", "domain");
          data_this.$store.commit("changeIfSelect", 1);
        }
      });
      cy.on("unselect", "node", function (event) {
        event.target.style("width", 20);
        event.target.style("height", 20);
        event.target.style("content", "");
      });
      cy.on("select", "edge", function (event) {
        event.target.style("line-color", "#E8747C");
        event.target.style("target-arrow-color", "#E8747C");
        event.target.style("width", "5");
        let edge_source = event.target._private.data.source;
        let edge_target = event.target._private.data.target;
        data_this.$store.state.edges.forEach((edge) => {
          if (
            edge.callerName == edge_source &&
            edge.calleeName == edge_target
          ) {
            data_this.$store.commit("changeFocusEdge", edge);
            data_this.$store.commit("changeType", "edge");
            data_this.$store.commit("changeIfSelect", 1);
          }
        });
      });
      cy.on("unselect", "edge", function (event) {
        event.target.style("label", "");
        event.target.style("line-color", "#9dbaea");
        event.target.style("target-arrow-color", "#9dbaea");
        event.target.style("width", "1");
      });
      this.cy = cy;
      // var layout = cy.layout({
      //   name: 'preset',
      //   //positions: this.positions,
      //   // grabbedNode: node => true,
      //   // animate: true, // whether to show the layout as it's running
      //   // refresh: 1, // number of ticks per frame; higher is faster but more jerky
      //   // maxSimulationTime: 4000, // max length in ms to run the layout
      //   // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
      //   //fit: false, // on every layout reposition of nodes, fit the viewport
      //   // padding: 30, // padding around the simulation

      //   // layout event callbacks
      //   ready: function() {}, // on layoutready
      //   stop: function() {
      //     cy.center();
      //     cy.on("click", "node", function(event) {
      //       if (event.target._private.data.type == "node") {
      //         let node_name = event.target._private.data.id;
      //         data_this.$store.state.nodes.forEach(node => {
      //           if (node.name == node_name) {
      //             data_this.$store.commit("changeFocusNode", node);
      //             data_this.$store.commit("changeType", "node");
      //             data_this.$store.commit("changeIfSelect", 1);
      //           }
      //         });
      //       } else {
      //         let domain_name = event.target._private.data.id;
      //         let included = event.target._private.data.included;
      //         data_this.$store.commit("changeSelectedDomain", domain_name);
      //         data_this.$store.commit("changeIncludedNode", included);
      //         data_this.$store.commit("changeType", "domain");
      //         data_this.$store.commit("changeIfSelect", 1);
      //       }
      //     });
      //     cy.on("unselect", "node", function(event) {
      //       event.target.style("width", 20);
      //       event.target.style("height", 20);
      //       event.target.style("content", "");
      //     });
      //     cy.on("select", "edge", function(event) {
      //       event.target.style("line-color", "#E8747C");
      //       event.target.style("target-arrow-color", "#E8747C");
      //       event.target.style("width", "5");
      //       let edge_source = event.target._private.data.source;
      //       let edge_target = event.target._private.data.target;
      //       data_this.$store.state.edges.forEach(edge => {
      //         if (
      //           edge.callerName == edge_source &&
      //           edge.calleeName == edge_target
      //         ) {
      //           data_this.$store.commit("changeFocusEdge", edge);
      //           data_this.$store.commit("changeType", "edge");
      //           data_this.$store.commit("changeIfSelect", 1);
      //         }
      //       });
      //     });
      //     cy.on("unselect", "edge", function(event) {
      //       event.target.style("label","");
      //       event.target.style("line-color", "#9dbaea");
      //       event.target.style("target-arrow-color", "#9dbaea");
      //       event.target.style("width", "1");
      //     });
      //   }, // on layoutstop

      //   // avoidOverlap: true, // if true, prevents overlap of node bounding boxes
      //   // handleDisconnected: true, // if true, avoids disconnected components from overlapping
      //   // convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
      //   // nodeSpacing: function(node) {
      //   //   return 20;
      //   // },
      // });
      // this.cy = cy;
      // layout.run();
    },
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
};
</script>

<style scoped>
#cy {
  /* position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 1; */
  height: 60vh;
  z-index: 2;
  display: none;
}
#button {
  height: 60vh;
  z-index: 1;
  display: block;
}
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>