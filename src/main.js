import Vue from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import router from './router'
import axios from 'axios'
import userStore from './store/UserStore'
import Clipboard from 'v-clipboard'
import cytoscape from 'cytoscape'
import cola from 'cytoscape-cola'
import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/atelier-sulphurpool-light.css'
import uploader from 'vue-simple-uploader'

 
Vue.prototype.$axios=axios
Vue.prototype.$cytoscape=cytoscape

Vue.config.productionTip = false

cytoscape.use(cola);
Vue.use(VueHighlightJS);
Vue.use(Antd);
Vue.use(Clipboard);
Vue.use(uploader);

new Vue({
  render: h => h(App),
  router,
  store: userStore
}).$mount('#app')
