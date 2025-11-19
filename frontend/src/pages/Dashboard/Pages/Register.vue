<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <signup-card>
        <h2 class="title text-center" slot="title">Cadastre-se</h2>
        <div
          class="md-layout-item md-size-100 md-medium-size-100 md-small-size-100 mr-auto"
          slot="content-right"
        >
          <md-field class="md-form-group">
            <md-icon>face</md-icon>
            <label>Nome</label>
            <md-input v-model="firstname" :disabled="loading"></md-input>
          </md-field>
          <md-field class="md-form-group" slot="inputs">
            <md-icon>person</md-icon>
            <label>E-mail</label>
            <md-input v-model="email" :disabled="loading"></md-input>
          </md-field>
          <md-field class="md-form-group">
            <md-icon>lock_outline</md-icon>
            <label>Senha</label>
            <md-input v-model="password" type="password" :disabled="loading" @keyup.enter="handleRegister"></md-input>
          </md-field>
          <md-checkbox v-model="boolean"
            >Eu aceito os <a>termos e condições</a>.</md-checkbox
          >
          <div class="button-container">
            <md-button 
              class="md-success md-lg"
              @click="handleRegister"
              :disabled="loading || !boolean || !firstname || !email || !password"
            ><span>Entrar</span></md-button>
            <!-- <md-button href class="md-success md-round mt-4" slot="footer"
              >Get Started</md-button
            > -->
          </div>
          <div v-if="errorMessage" class="md-error" style="color: #f44336; margin-top: 10px;" slot="inputs">
            {{ errorMessage }}
          </div>
        </div>
      </signup-card>
    </div>
  </div>
</template>
<script>
import { SignupCard } from "@/components";
import AuthService from "@/services/auth";

export default {
  components: {
    SignupCard,
  },
  data() {
    return {
      firstname: null,
      email: null,
      password: null,
      loading: false,
      boolean: false,
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
    async handleRegister() {
      if (!this.firstname || !this.email || !this.password) {
        this.errorMessage = "Por favor, preencha todos os campos";
        return;
      }

      this.loading = true;
      this.errorMessage = "";

      try {
        const result = await AuthService.register(this.firstname, this.email, this.password);

        if (result.success) {
          // Login bem-sucedido
          this.$notify({
            type: "success",
            message: "Cadastro realizado com sucesso!",
            horizontalAlign: 'bottom',
            verticalAlign: 'right',
          });

          // Redirecionar para o login
          this.$router.push("/login");
        } else {
          // Erro no login
          this.errorMessage = result.message || "Erro ao fazer o cadastro";
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
