import Vue from "vue";
import VueRouter from "vue-router";
import DashboardPlugin from "./material-dashboard";
import VueMask from 'v-mask';

// Plugins
import App from "./App.vue";
import Chartist from "chartist";

// router setup
import routes from "./routes/routes";
import AuthService from "./services/auth";

// plugin setup
Vue.use(VueRouter);
Vue.use(DashboardPlugin);
Vue.use(VueMask);

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash, behavior: "smooth" };
    } else {
      return { x: 0, y: 0 };
    }
  },
  linkExactActiveClass: "nav-item active",
});

// Navigation guard para verificar autenticação
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = AuthService.isAuthenticated();

  if (requiresAuth && !isAuthenticated) {
    // Rota requer autenticação mas usuário não está logado
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Usuário já está logado e tentando acessar login
    next('/dashboard');
  } else {
    // Permitir navegação
    next();
  }
});

// global library setup
Vue.prototype.$Chartist = Chartist;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
});
