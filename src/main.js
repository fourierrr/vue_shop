import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import { Button, Form, FormItem, Input, Message } from 'element-ui'
import axios from 'axios'
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1'
Vue.prototype.$http = axios
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
