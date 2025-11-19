<template>
  <div class="sidebar" data-color="azure" data-background-color="black">
    <div class="logo">
      <a href="#" class="simple-text logo-mini" target="">
        <div class="">
          <img :src="logo" />
        </div>
      </a>
      <a href="#" class="simple-text logo-normal" target="">
        <template>{{ title }}</template>
      </a>
    </div>
    <div class="sidebar-wrapper" ref="sidebarScrollArea">
      <slot></slot>
      <md-list class="nav">
        <slot name="links">
        </slot>
      </md-list>
    </div>
  </div>
</template>
<script>
import { ENV } from '@/config/config';

export default {
  name: "sidebar",
  props: {
  },
  methods: {
  },
  computed: {
    homeUrl() {
      return ENV.URL;
    },
    title() {
      return ENV.TITLE;
    },
    logo() {
      return ENV.LOGO;
    }
  },
  beforeDestroy() {
    if (this.$sidebar.showSidebar) {
      this.$sidebar.showSidebar = false;
    }
  },
};
</script>
<style>
@media (min-width: 992px) {
  .navbar-search-form-mobile,
  .nav-mobile-menu {
    display: none;
  }
}
</style>
