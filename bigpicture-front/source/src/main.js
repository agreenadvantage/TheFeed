// jscs: disable
import Vue from 'vue';
import App from './App';
import axios from 'axios';
import VeeValidate from 'vee-validate';
import ScrollTo from 'vue-scrollto';

Vue.prototype.$http = axios.create({
  baseURL: process.env.HTTP_PATH,
  'Content-Type': 'application/json',
  withCredentials: true,
});

Vue.config.productionTip = false
Vue.use(VeeValidate);
Vue.use(ScrollTo, {
     container: "body",
     duration: 500,
     easing: "ease",
     offset: 0,
     cancelable: true,
     onDone: false,
     onCancel: false,
     x: false,
     y: true
 });

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
});
