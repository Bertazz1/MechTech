<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-blue">
          <div class="card-icon">
            <md-icon>perm_identity</md-icon>
          </div>
          <h4 class="title">Clientes</h4>
        </md-card-header>
        <md-card-content>
          <md-table :value="queriedData" :md-sort.sync="currentSort" :md-sort-order.sync="currentSortOrder"
            :md-sort-fn="customSort" class="paginated-table table-striped table-hover">
            <md-table-toolbar>
              <md-button class="md-primary md-raised" @click="openCreate">
                <md-icon>add</md-icon>&nbsp;Novo Cliente
              </md-button>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="ID" >{{ item.id }}</md-table-cell>
              <md-table-cell md-label="Nome" >{{ item.name }}</md-table-cell>
              <md-table-cell md-label="Email" >{{ item.email }}</md-table-cell>
              <md-table-cell md-label="Telefone" >{{ item.phone }}</md-table-cell>
              <md-table-cell md-label="CPF" >{{ item.cpf }}</md-table-cell>

              <md-table-cell md-label="Ações">
                <md-button class="md-just-icon md-warning md-simple" @click.native="handleEdit(item)">
                  <md-icon>edit</md-icon>
                </md-button>
                <md-button class="md-just-icon md-danger md-simple" :disabled="deletingId === item.id"
                  @click.native="handleDelete(item)">
                  <md-icon v-if="deletingId !== item.id">close</md-icon>
                  <md-progress-spinner v-else :md-stroke="2" :md-diameter="18" md-mode="indeterminate" />
                </md-button>
              </md-table-cell>
            </md-table-row>

          </md-table>
        </md-card-content>
        <md-dialog :md-active.sync="createDialog.open">
          <md-dialog-title>Novo Cliente</md-dialog-title>

          <div style="padding: 16px;">
            <form @submit.prevent="saveCreate">
              <md-field :class="{ 'md-invalid': !!formErrors.name }">
                <label>Nome</label>
                <md-input v-model="form.name" />
                <span class="md-error" v-if="formErrors.name">{{ formErrors.name }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.email }">
                <label>Email</label>
                <md-input v-model="form.email" type="email" />
                <span class="md-error" v-if="formErrors.email">{{ formErrors.email }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.phone }">
                <label>Telefone</label>
                <md-input v-model="form.phone" placeholder="(11) 91234-5678" v-mask="'(##) #####-####'" />
                <span class="md-error" v-if="formErrors.phone">{{ formErrors.phone }}</span>
              </md-field>
              
              <md-field :class="{ 'md-invalid': !!formErrors.cpf }">
                <label>CPF</label>
                <md-input v-model="form.cpf" placeholder="" v-mask="'###.###.###-##'"/>
                <span class="md-error" v-if="formErrors.cpf">{{ formErrors.cpf }}</span>
              </md-field>
            </form>
          </div>

          <md-dialog-actions>
            <md-button class="md-default" @click="closeCreate" :disabled="savingCreate">Cancelar</md-button>
            <md-button class="md-primary md-raised" @click="saveCreate" :disabled="savingCreate">
              <template v-if="!savingCreate">Salvar</template>
              <md-progress-spinner v-else md-mode="indeterminate" :md-diameter="18" :md-stroke="2" />
            </md-button>
          </md-dialog-actions>
        </md-dialog>
        <md-dialog :md-active.sync="editDialog.open">
          <md-dialog-title>Editar Cliente</md-dialog-title>

          <div style="padding: 16px;">
            <form @submit.prevent="saveEdit">
              <md-field :class="{ 'md-invalid': !!formErrors.name }">
                <label>Nome</label>
                <md-input v-model="form.name" />
                <span class="md-error" v-if="formErrors.name">{{ formErrors.name }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.email }">
                <label>Email</label>
                <md-input v-model="form.email" type="email" />
                <span class="md-error" v-if="formErrors.email">{{ formErrors.email }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.phone }">
                <label>Telefone</label>
                <md-input v-model="form.phone" placeholder="+55 11 91234-5678" v-mask="'(##) #####-####'" />
                <span class="md-error" v-if="formErrors.phone">{{ formErrors.phone }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.cpf }">
                <label>CPF</label>
                <md-input v-model="form.cpf" placeholder="" v-mask="'###.###.###-##'" />
                <span class="md-error" v-if="formErrors.cpf">{{ formErrors.cpf }}</span>
              </md-field>
            </form>
          </div>

          <md-dialog-actions>
            <md-button class="md-default" @click="closeEdit" :disabled="savingEdit">Cancelar</md-button>
            <md-button class="md-primary md-raised" @click="saveEdit" :disabled="savingEdit">
              <template v-if="!savingEdit">Salvar</template>
              <md-progress-spinner v-else md-mode="indeterminate" :md-diameter="18" :md-stroke="2" />
            </md-button>
          </md-dialog-actions>
        </md-dialog>
        <md-card-actions md-alignment="space-between">
          <div class="">
            <p class="card-category">
              Mostrando {{ from + 1 }} a {{ to }} de {{ total }} registros
            </p>
          </div>
          <pagination class="pagination-no-border pagination-success" v-model="pagination.currentPage"
            :per-page="pagination.perPage" :total="total">
          </pagination>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import { Pagination } from "@/components";
import Swal from "sweetalert2";
import clientsService from "@/services/clients";

export default {
  components: { Pagination },

  data() {
    return {
      currentSort: "name",
      currentSortOrder: "asc",

      pagination: {
        perPage: 20,
        currentPage: 0,
        perPageOptions: [20],
        total: 0,
      },

      // dados da API
      tableData: [],
      total: 0, // total de registros no servidor

      // estado UI
      loading: false,
      deletingId: null,

      // Edição
      editDialog: {
        open: false,
      },
      form: {
        id: null,
        name: "",
        email: "",
        phone: "",
        cpf: "",
      },
      formErrors: {
        name: "",
        email: "",
        phone: "",
        cpf: "",
      },
      savingEdit: false,

      // Criação
      createDialog: { open: false },
      savingCreate: false,
    };
  },

  computed: {
    queriedData() {
      return this.tableData;
    },

    from() {
      return this.tableData.length === 0
        ? 0
        : this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    to() {
      const hi = this.from + this.tableData.length;
      return hi;
    },
  },

  methods: {
    async fetchClients() {
      try {
        this.loading = true;
        const params = {
          page: this.pagination.currentPage - 1,
        };

        const data = await clientsService.fetchClients(params);

        const items =
          data?.items ??
          data?.content ??
          data?.data ??
          data?.results ??
          [];

        const total =
          data?.total ??
          data?.totalElements ??
          data?.meta?.total ??
          data?.count ??
          items.length;

        this.tableData = items;
        this.total = total;
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível carregar os clientes.",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    async handleDelete(item) {
      const confirm = await Swal.fire({
        title: "Você tem certeza?",
        text: `Você não poderá reverter isso!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover cliente",
      });

      if (!confirm.value) return;

      try {
        this.deletingId = item.id;
        await clientsService.deleteClient(item.id);

        Swal.fire({
          title: "Cliente Removido!",
          text: `Você removeu ${item.name}`,
          icon: "success",
        });

        if (this.tableData.length === 1 && this.pagination.currentPage > 1) {
          this.pagination.currentPage -= 1;
        }
        await this.fetchClients();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível excluir o cliente.",
          icon: "error",
        });
      } finally {
        this.deletingId = null;
      }
    },
    handleEdit(item) {
      this.clearFormErrors();
      this.form = {
        id: item.id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        cpf: item.cpf || "",
      };
      this.editDialog.open = true;
    },

    closeEdit() {
      if (this.savingEdit) return;
      this.editDialog.open = false;
    },

    validateForm() {
      this.clearFormErrors();
      let ok = true;

      if (!this.form.name || this.form.name.trim().length < 2) {
        this.formErrors.name = "Informe um nome válido.";
        ok = false;
      }

      const email = this.form.email?.trim();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRe.test(email)) {
        this.formErrors.email = "Informe um email válido.";
        ok = false;
      }

      const phone = this.form.phone?.trim().replace(/[^0-9]/g, '');
      if (!phone || phone.length < 8 || phone.length > 11) {
        this.formErrors.phone = "Informe um telefone válido.";
        ok = false;
      }

      const cpf = this.form.cpf?.trim().replace(/[^0-9]/g, '');
      if (!cpf || cpf.length < 11 || cpf.length > 11) {
        this.formErrors.cpf = "Informe um CPF válido.";
        ok = false;
      }

      return ok;
    },

    async saveEdit() {
      if (!this.validateForm()) return;

      try {
        this.savingEdit = true;
        const { id } = this.form;
        const payload = {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone.replace(/[^0-9]/g, ''),
          cpf: this.form.cpf.replace(/[^0-9]/g, ''),
        };
        await clientsService.updateClient(id, payload);

        this.editDialog.open = false;

        Swal.fire({
          title: "Atualizado!",
          text: "Cliente atualizado com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        // Recarrega a página atual mantendo a paginação
        await this.fetchClients();
      } catch (err) {
        console.error(err);
        console.log(err.response.data.message);
        Swal.fire({
          title: "Erro",
          text: err.response.data.message,
          icon: "error",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-danger btn-fill",
        });
      } finally {
        this.savingEdit = false;
      }
    },
    openCreate() {
      this.clearFormErrors();
      this.form = { name: "", email: "", phone: "", cpf: "" };
      this.createDialog.open = true;
    },

    closeCreate() {
      if (this.savingCreate) return;
      this.createDialog.open = false;
    },

    clearFormErrors() {
      this.formErrors = { name: "", email: "", phone: "", cpf: "" };
    },

    async saveCreate() {
      if (!this.validateForm()) return;

      try {
        this.savingCreate = true;
        const payload = {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone.replace(/[^0-9]/g, ''),
          cpf: this.form.cpf.replace(/[^0-9]/g, ''),
        };

        await clientsService.createClient(payload);

        this.createDialog.open = false;

        // feedback
        this.$nextTick(() => {
          this.$emit?.("created"); // opcional caso outras telas escutem
        });

        this.pagination.currentPage = 0;
        await this.fetchClients();
      } catch (err) {
        console.error(err);
        console.log(err.response.data.message);
        Swal.fire({
          title: "Erro",
          text: err.response.data.message,
          icon: "error",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-danger btn-fill",
        });
      } finally {
        this.savingCreate = false;
      }
    },
  },

  mounted() {
    this.fetchClients();
  },

  watch: {
    // Paginação
    "pagination.currentPage"() {
      this.fetchClients();
    },
  },
};
</script>

<style lang="css" scoped>
.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}
</style>