<template>
  <div class="user">
    <div class="photo">
      <img :src="displayAvatar" alt="avatar" />
    </div>
    <div class="user-info">
      <a
        data-toggle="collapse"
        :aria-expanded="!isClosed"
        @click.stop="toggleMenu"
        @click.capture="clicked"
      >
        <span>
          {{ displayTitle }}
          <!-- <b class="caret"></b> -->
        </span>
      </a>
    </div>
  </div>
</template>
<script>
// import { CollapseTransition } from "vue2-transitions";
import AuthService from "@/services/auth";

export default {
  components: {
    // CollapseTransition,
  },
  props: {
    cardUserImage: {
      type: String,
      default: "./img/default-avatar.png",
    },
    title: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "./img/faces/avatar.jpg",
    },
  },
  data() {
    return {
      isClosed: true,
      user: null,
    };
  },
  computed: {
    displayTitle() {
      if (this.title) return this.title;
      
      if (this.user?.firstName && this.user?.lastName) {
        return `${this.user.firstName} ${this.user.lastName}`;
      }
      return this.user?.firstName || this.user?.username || 'Usuário';
    },
    displayAvatar() {
      return this.user?.avatar || this.cardUserImage;
    },
  },
  async mounted() {
    await this.loadUserData();
  },
  methods: {
    clicked: function (e) {
      e.preventDefault();
    },
    toggleMenu: function () {
      this.isClosed = !this.isClosed;
    },
    async loadUserData() {
      // Carregar dados do usuário
      this.user = AuthService.getUser();
      
      // Se não houver dados no localStorage, buscar do servidor
      if (!this.user) {
        const result = await AuthService.fetchUserData();
        if (result.success) {
          this.user = result.data;
        }
      }
    },
  },
};
</script>
<style>
.collapsed {
  transition: opacity 1s;
}
</style>
