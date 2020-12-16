import Vue from 'vue'
import vuex from 'vuex'
import axios from 'axios'

Vue.use(vuex)
export default new vuex.Store({
  state: {
    user: {
    },
    current: {
    },
    all: [],
    nodes: [],
    edges: [],
    domains: [],
    structure: [],
    groups: [],
    focusNode: {},
    focusEdge: {},
    type:"",
    ifSelect:0,
    includedNode:0,
    selectedDomain:null,
    currentPage: 'workspace',
    currentGroup: 'joinGroup',
    allPaths: [],  //but not shortest
    shortestPaths: []
  },
  mutations: {
    updateAll(state) {
      let url = "/api/project/user?userId=" + state.user.id;
      axios.get(url).then(function (res) {
        if (res.data.success) {
          console.log(res.data.content);
          state.all = res.data.content;
        } else {
          console.log(res.data.message);
        }
      });
    },
    updateNodes(state) {
      let url = "/api/project/nodes?projectId=" + state.current.id;
      axios.get(url).then(function (res) {
        if (res.data.success) {
          console.log(res.data.content);
          state.nodes = res.data.content;
        } else {
          console.log(res.data.message);
        }
      });
    },
    updateEdges(state) {
      let url = "/api/project/edges?projectId=" + state.current.id;
      axios.get(url).then(function (res) {
        if (res.data.success) {
          console.log(res.data.content);
          state.edges = res.data.content;
        } else {
          console.log(res.data.message);
        }
      });
    },
    updateStructure(state) {
      let url = "/api/structure?id=" + state.current.id;
      axios.get(url).then(function (res) {
        if (res.data.success) {
          console.log(res.data.content);
          state.structure = res.data.content;
        } else {
          console.log(res.data.message);
        }
      });
    },
    updateDomains(state) {
      let url = "/api/domain/getCurrent?projectId=" + state.current.id;
      axios.get(url).then(function (res) {
        if (res.data.success) {
          console.log(res.data.content);
          state.domains = res.data.content;
        } else {
          console.log(res.data.message);
        }
      });
    },
    changeUser(state, payload) {
      state.user = payload;
    },
    changeCurrent(state, payload) {
      state.current = payload;
    },
    changeAll(state, payload) {
      state.all = payload;
    },
    changeNodes(state, payload) {
      state.nodes = payload;
    },
    changeEdges(state, payload) {
      state.edges = payload;
    },
    changeDomains(state, payload) {
      state.domains = payload;
    },
    changeGroups(state,payload){
      state.groups = payload;
    },
    changeStructure(state, payload) {
      state.structure = payload;
    },
    changeFocusNode(state, payload) {
      state.focusNode = payload;
    },
    changeType(state, payload){
      state.type = payload;
    },
    changeSelectedDomain(state, payload){
      state.selectedDomain = payload;
    },
    changeIfSelect(state, payload){
      state.ifSelect = payload;
    },
    changeFocusEdge(state, payload) {
      state.focusEdge = payload;
    },
    changeIncludedNode(state, payload){
      state.includedNode = payload;
    },
    changeCurrentPage(state, payload) {
      state.currentPage = payload;
    },
    changeCurrentGroup(state, payload) {
      state.currentGroup = payload;
    },
    changeAllPaths(state, payload) {
      state.allPaths = payload;
    },
    changeShortestPaths(state, payload) {
      state.shortestPaths = payload;
    }
  }
})
