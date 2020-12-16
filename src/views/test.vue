<template>
  <div id="box">
    <h1>demo</h1>
    <button @click="createCytoscape">test</button>
    <div id="cy"></div>
  </div>
</template>

<script>
export default {
  name: "cytoscape",
  components: {},
  created() {
    this.$axios
      .get("/api/project/nodes?projectId=" + this.projectId)
      .then(res => {
        if (res.data.success) {
          res.data.content.forEach(node => {
            let pos = node.name.indexOf(":");
            let length = node.name.length;
            this.nodes.push({
              group: "nodes",
              data: { id: node.name.slice(pos + 1, length) }
            });
          });
          console.log("nodesFinish");
          console.log(this.nodes);
        } else {
          console.log(res.data.message);
        }
      });
    this.$axios
      .get("/api/project/edges?projectId=" + this.projectId)
      .then(res => {
        if (res.data.success) {
          res.data.content.forEach(edge => {
            let callername = edge.callerName.slice(
              edge.callerName.indexOf(":") + 1,
              edge.callerName.length
            );
            let calleename = edge.calleeName.slice(
              edge.calleeName.indexOf(":") + 1,
              edge.calleeName.length
            );
            this.edges.push({
              group: "edges",
              data: { source: callername, target: calleename }
            });
          });
          console.log("edgesFinish");
        } else {
          console.log(res.data.message);
        }
      });
  },
  data() {
    return {
      projectId: 1,
      nodes: [],
      edges: []
    };
  },
  methods: {
    createCytoscape() {
      this.$cytoscape.warnings(false);
      // eslint-disable-next-line no-unused-vars
      const cy = this.$cytoscape({
        container: document.getElementById("cy"),
        boxSelectionEnabled: false,
        userZoomingEnabled: true, // 滚轮缩放
        wheelSensitivity: 0.1,
        autounselectify: false,
        autoungrabify: true,
        layout: {
          // name: 'breadthfirst',
        },
        minZoom: 0.003,
        style: [
          {
            selector: "node",
            style: {
              content: "data(id)",
              "text-opacity": 0.5,
              height: 80,
              width: 80,
              "pie-size": "100%",
              "text-valign": "center",
              "text-halign": "left",
              "pie-1-background-color": "#E8747C"
              // 'pie-1-background-size': 'mapData(occupy, 0, 10, 0, 100)',
            }
          },
          {
            selector: ":parent",
            css: {
              "text-valign": "top",
              "text-halign": "center"
              // 'text-halign': 'right',
              // 'text-rotation': '90deg', //文字旋转
            }
          },
          {
            selector: "edge",
            style: {
              width: 3,
              label: "data(label)",
              "target-arrow-shape": "triangle",
              // "target-arrow-fill": "hollow", //箭头填充 空心
              "line-color": "#9dbaea",
              "target-arrow-color": "#9dbaea",
              "curve-style": "bezier"
            }
          }
        ],
        elements: {
          // 节点数据
          nodes: [],
          //
          edges: []
        }
      });
      console.log(this.nodes);
      console.log(this.edges);
      cy.add(this.nodes);
      cy.add(this.edges);
      var layout = cy.layout({
        name: 'random'
        
        //这些layout都好让人密恐，太难顶了 https://js.cytoscape.org/#layouts
        });

      layout.run();
    }
  },
  mounted() {}
};
</script>

<style>
#box {
  width: 100vh;
  height: 100vh;
}

#cy {
  width: 100%;
  height: 100%;
}

h1 {
  opacity: 0.5;
  font-size: 1em;
}
</style>