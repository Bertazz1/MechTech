<template>
  <div>
    <!-- Formulário de Perfil -->
    <form @submit.prevent="updateProfile">
      <md-card>
        <md-card-header
          class="md-card-header-icon"
          :class="getClass(headerColor)"
        >
          <div class="card-icon">
            <md-icon>perm_identity</md-icon>
          </div>
          <h4 class="title">
            Editar Perfil - <small>Complete seu perfil</small>
          </h4>
        </md-card-header>

        <md-card-content>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-100">
              <md-field>
                <label>Nome de Usuário</label>
                <md-input v-model="formData.username" type="text"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-50">
              <md-field>
                <label>Nome</label>
                <md-input v-model="formData.firstName" type="text"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-50">
              <md-field>
                <label>Sobrenome</label>
                <md-input v-model="formData.lastName" type="text"></md-input>
              </md-field>
            </div>  
            <div class="md-layout-item md-small-size-100 md-size-50">
              <md-field>
                <label>Email</label>
                <md-input v-model="formData.email" type="email"></md-input>
              </md-field>
            </div>          
            <div class="md-layout-item md-small-size-100 md-size-50">
              <md-field>
                <label>Telefone</label>
                <md-input v-model="formData.phone" type="text"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-100 text-right">
              <md-button 
                type="submit"
                class="md-raised md-success mt-4"
                :disabled="loadingProfile"
              >
                {{ loadingProfile ? 'Atualizando...' : 'Atualizar Perfil' }}
              </md-button>
            </div>
          </div>
        </md-card-content>
      </md-card>
    </form>

    <!-- Formulário de Alteração de Senha -->
    <form @submit.prevent="changePassword" class="mt-4">
      <md-card>
        <md-card-header
          class="md-card-header-icon"
          :class="getClass('warning')"
        >
          <div class="card-icon">
            <md-icon>lock</md-icon>
          </div>
          <h4 class="title">
            Alterar Senha - <small>Segurança da conta</small>
          </h4>
        </md-card-header>

        <md-card-content>
          <div class="md-layout">
            <div class="md-layout-item md-small-size-100 md-size-100">
              <md-field>
                <label>Senha Atual</label>
                <md-input v-model="passwordData.currentPassword" type="password"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-50">
              <md-field>
                <label>Nova Senha</label>
                <md-input v-model="passwordData.newPassword" type="password"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-small-size-100 md-size-50">
              <md-field>
                <label>Confirmar Nova Senha</label>
                <md-input v-model="passwordData.confirmPassword" type="password"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-100 text-right">
              <md-button 
                type="submit"
                class="md-raised md-warning mt-4"
                :disabled="loadingPassword"
              >
                {{ loadingPassword ? 'Alterando...' : 'Alterar Senha' }}
              </md-button>
            </div>
          </div>
        </md-card-content>
      </md-card>
    </form>
  </div>
</template>
<script>
import AuthService from "@/services/auth";

export default {
  name: "edit-profile-form",
  props: {
    headerColor: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      user: null,
      loadingProfile: false,
      loadingPassword: false,
      formData: {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    };
  },
  async mounted() {
    await this.loadUserData();
  },
  methods: {
    getClass: function (headerColor) {
      return "md-card-header-" + headerColor + "";
    },

    async loadUserData() {
      // Carregar dados do usuário do localStorage ou do servidor
      this.user = AuthService.getUser();
      
      if (this.user) {
        this.populateForm();
      } else {
        // Se não houver dados no localStorage, buscar do servidor
        const result = await AuthService.fetchUserData();
        if (result.success) {
          this.user = result.data;
          this.populateForm();
        }
      }
    },

    populateForm() {
      if (this.user) {
        this.formData = {
          username: this.user.username || '',
          email: this.user.email || '',
          firstName: this.user.firstName || '',
          lastName: this.user.lastName || '',
          phone: this.user.phone || '',
        };
      }
    },

    async updateProfile() {
      this.loadingProfile = true;
      try {
        const result = await AuthService.updateProfile(this.formData);
        
        if (result.success) {
          this.user = result.data;
          this.$notify({
            type: "success",
            message: result.message,
          });
        } else {
          this.$notify({
            type: "error",
            message: result.message,
          });
        }
      } catch (error) {
        this.$notify({
          type: "error",
          message: "Erro ao conectar com o servidor",
        });
      } finally {
        this.loadingProfile = false;
      }
    },

    async changePassword() {
      // Validações
      if (!this.passwordData.currentPassword) {
        this.$notify({
          type: "error",
          message: "Senha atual é obrigatória",
        });
        return;
      }

      if (!this.passwordData.newPassword) {
        this.$notify({
          type: "error",
          message: "Nova senha é obrigatória",
        });
        return;
      }

      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        this.$notify({
          type: "error",
          message: "As senhas não coincidem",
        });
        return;
      }

      if (this.passwordData.newPassword.length < 6) {
        this.$notify({
          type: "error",
          message: "A nova senha deve ter pelo menos 6 caracteres",
        });
        return;
      }

      if (!this.user?.id) {
        this.$notify({
          type: "error",
          message: "Erro: ID do usuário não encontrado",
        });
        return;
      }

      this.loadingPassword = true;
      try {
        const result = await AuthService.changePassword(
          this.user.id,
          this.passwordData.currentPassword,
          this.passwordData.newPassword,
          this.passwordData.confirmPassword
        );
        
        if (result.success) {
          // Limpar campos de senha
          this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          
          this.$notify({
            type: "success",
            message: result.message,
          });
        } else {
          this.$notify({
            type: "error",
            message: result.message,
          });
        }
      } catch (error) {
        this.$notify({
          type: "error",
          message: "Erro ao conectar com o servidor",
        });
      } finally {
        this.loadingPassword = false;
      }
    },
  },
};
</script>
<style></style>
