<template>
  <div class="wrapper">
    <notifications></notifications>
    <side-bar>
      <user-menu></user-menu>
      <mobile-menu></mobile-menu>
      <template slot="links">
        <sidebar-item :link="{ name: 'Dashboard', icon: 'dashboard', path: '/dashboard' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Clientes', icon: 'perm_identity', path: '/clients' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Peças', icon: 'construction', path: '/parts' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Serviços', icon: 'tire_repair', path: '/services' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Veículos', icon: 'directions_car', path: '/vehicles' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Orçamentos', icon: 'request_quote', path: '/quotations' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Ordens de Serviço', icon: 'assignment', path: '/service-orders' }"> </sidebar-item>
        <sidebar-item :link="{ name: 'Agenda', icon: 'date_range', path: '/calendar' }"></sidebar-item>
        <sidebar-item :link="{ name: 'Extras', icon: 'image' }">
          <sidebar-item :link="{ name: 'Pricing', path: '/pricing' }"></sidebar-item>
          <sidebar-item :link="{ name: 'RTL Support', path: '/pages/rtl' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Timeline', path: '/pages/timeline' }" ></sidebar-item>
          <sidebar-item :link="{ name: 'Login', path: '/login' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Register', path: '/register' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Lock Screen', path: '/lock' }"></sidebar-item>
          <sidebar-item :link="{ name: 'User Profile', path: '/pages/user' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Buttons', path: '/components/buttons' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Grid System', path: '/components/grid-system' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Panels', path: '/components/panels' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Sweet Alert', path: '/components/sweet-alert' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Notifications', path: '/components/notifications' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Icons', path: '/components/icons' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Typography', path: '/components/typography' }"></sidebar-item>
          <sidebar-item :link="{ name: 'MultiLevel', disableCollapse: true }">
            <sidebar-item :link="{ name: 'Third level menu', path: '#!' }" />
            <sidebar-item :link="{ name: 'Just another link', path: '#a' }" />
            <sidebar-item :link="{ name: 'One last link', path: '#b' }" />
          </sidebar-item>
          <sidebar-item :link="{ name: 'Regular Forms', path: '/forms/regular' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Extended Forms', path: '/forms/extended' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Validation Forms', path: '/forms/validation' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Wizard', path: '/forms/wizard' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Regular Tables', path: '/table-list/regular' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Extended Tables', path: '/table-list/extended' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Paginated Tables', path: '/table-list/paginated' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Google Maps', path: '/maps/google' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Full Screen Maps', path: '/maps/full-screen' }"></sidebar-item>
          <sidebar-item :link="{ name: 'Vector Maps', path: '/maps/vector-map' }"></sidebar-item>
        <sidebar-item  :link="{ name: 'Widgets', icon: 'widgets', path: '/widgets' }"></sidebar-item>
        <sidebar-item :link="{ name: 'Charts', icon: 'timeline', path: '/charts' }"></sidebar-item>
      </sidebar-item>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>
      <div :class="{ content: !$route.meta.hideContent }" @click="toggleSidebar">
        <router-view></router-view>
      </div>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
    </div>
  </div>
</template>
<script>
/* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
    document.getElementsByClassName(className)[0].scrollTop = 0;
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

function reinitScrollbar() {
  let docClasses = document.body.classList;
  let isWindows = navigator.platform.startsWith("Win");
  if (isWindows) {
    // if we are on windows OS we activate the perfectScrollbar function
    initScrollbar("sidebar");
    initScrollbar("sidebar-wrapper");
    initScrollbar("main-panel");

    docClasses.add("perfect-scrollbar-on");
  } else {
    docClasses.add("perfect-scrollbar-off");
  }
}

import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import MobileMenu from "./Extra/MobileMenu.vue";
import UserMenu from "./Extra/UserMenu.vue";

export default {
  components: {
    TopNavbar,
    ContentFooter,
    MobileMenu,
    UserMenu,
  },
  data() {

  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    minimizeSidebar() {
      if (this.$sidebar) {
        this.$sidebar.toggleMinimize();
      }
    },
  },
  updated() {
    reinitScrollbar();
  },
  mounted() {
    reinitScrollbar();
  },
  watch: {
    sidebarMini() {
      this.minimizeSidebar();
    },
  },
};
</script>
<style lang="scss">
$scaleSize: 0.95;
@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
  to {
    opacity: 1;
  }
}
.main-panel .zoomIn {
  animation-name: zoomIn95;
}
@keyframes zoomOut95 {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}
.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
