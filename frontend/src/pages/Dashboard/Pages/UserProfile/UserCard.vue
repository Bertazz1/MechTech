<template>
  <md-card class="md-card-profile">
    <div class="md-card-avatar">
      <img class="img" :src="userAvatar" />
    </div>

    <md-card-content>
      <h4 class="card-title">{{ userFullName || 'Nome não informado' }}</h4>
      <md-button 
        class="md-round" 
        :class="getColorButton(buttonColor)"
        @click="refreshUserData"
        :disabled="loading"
      >
        {{ loading ? 'Carregando...' : 'Atualizar Dados' }}
      </md-button>
    </md-card-content>
  </md-card>
</template>
<script>
import AuthService from "@/services/auth";

export default {
  name: "user-card",
  props: {
    cardUserImage: {
      type: String,
      default: "./img/default-avatar.png",
    },
    buttonColor: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      user: null,
      loading: false,
    };
  },
  computed: {
    userAvatar() {
      return this.user?.avatar || this.cardUserImage;
    },
    userFullName() {
      if (this.user?.firstName && this.user?.lastName) {
        return `${this.user.firstName} ${this.user.lastName}`;
      }
      return this.user?.username || this.user?.name;
    },
  },
  async mounted() {
    await this.loadUserData();
  },
  methods: {
    getColorButton: function (buttonColor) {
      return "md-" + buttonColor + "";
    },
    
    async loadUserData() {
      // Primeiro, tenta carregar do localStorage
      this.user = AuthService.getUser();
      
      // Se não houver dados ou se quisermos dados atualizados, busca do servidor
      if (!this.user) {
        await this.refreshUserData();
      }
    },
    
    async refreshUserData() {
      this.loading = true;
      try {
        const result = await AuthService.fetchUserData();
        if (result.success) {
          this.user = result.data;
          this.$notify({
            type: "success",
            message: "Dados do usuário atualizados com sucesso!",
          });
        } else {
          this.$notify({
            type: "error",
            message: result.message || "Erro ao carregar dados do usuário",
          });
        }
      } catch (error) {
        this.$notify({
          type: "error",
          message: "Erro ao conectar com o servidor",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style></style>
