<template>
  <div class="md-layout text-center">
    <div
      class="md-layout-item md-size-33 md-medium-size-50 md-small-size-70 md-xsmall-size-100"
    >
      <login-card header-color="blue">
        <h4 slot="title" class="title">Entrar</h4>
        <md-field class="md-form-group" slot="inputs">
          <md-icon>person</md-icon>
          <label>E-mail</label>
          <md-input v-model="username" :disabled="loading"></md-input>
        </md-field>
        <md-field class="md-form-group" slot="inputs">
          <md-icon>lock_outline</md-icon>
          <label>Senha</label>
          <md-input v-model="password" type="password" :disabled="loading" @keyup.enter="handleLogin"></md-input>
        </md-field>
        <div v-if="errorMessage" class="md-error" style="color: #f44336; margin-top: 10px;" slot="inputs">
          {{ errorMessage }}
        </div>
        <md-button 
          slot="footer" 
          class="md-success md-lg"
          @click="handleLogin"
          :disabled="loading || !username || !password"
        >
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar</span>
        </md-button>
      </login-card>
    </div>
  </div>
</template>
<script>
import { LoginCard } from "@/components";
import AuthService from "@/services/auth";

export default {
  components: {
    LoginCard,
  },
  data() {
    return {
      username: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },
  mounted() {
    // Se já estiver autenticado, redirecionar para o dashboard
    if (AuthService.isAuthenticated()) {
      this.$router.push("/dashboard");
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.errorMessage = "Por favor, preencha todos os campos";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const result = await AuthService.login(this.username, this.password);

        if (result.success) {
          // Login bem-sucedido
          this.$notify({
            type: "success",
            message: "Login realizado com sucesso!",
            horizontalAlign: 'bottom',
            verticalAlign: 'right',
          });

          // Redirecionar para o dashboard
          this.$router.push("/dashboard");
        } else {
          // Erro no login
          this.errorMessage = result.message || "Erro ao fazer login";
        }
      } catch (error) {
        this.errorMessage = "Erro interno. Tente novamente.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style></style>
