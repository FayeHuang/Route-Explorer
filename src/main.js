// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import * as firebase from 'firebase';
import Element from 'element-ui';
import locale from 'element-ui/lib/locale/lang/zh-TW';
import 'element-ui/lib/theme-chalk/index.css';
import App from './components/App';
import router from './router';

Vue.config.productionTip = false;
Vue.use(Element, { locale });

const config = {
  apiKey: 'AIzaSyBIaOapFrsM-c0yz6O4NrUj57Ks6nwzWb4',
  authDomain: 'routeexplorer-eed26.firebaseapp.com',
  databaseURL: 'https://routeexplorer-eed26.firebaseio.com',
  projectId: 'routeexplorer-eed26',
  storageBucket: 'routeexplorer-eed26.appspot.com',
  messagingSenderId: '359240775793',
};
firebase.initializeApp(config);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
