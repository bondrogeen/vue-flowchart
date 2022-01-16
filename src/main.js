import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import '@/assets/scss/reset.scss'
import '@/assets/scss/main.scss'

Vue.config.productionTip = false;

// import all directivs
import directives from '@/utils/directives'
directives.forEach(directive => Vue.directive(directive.name, directive))

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
