<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-blue">
          <div class="card-icon">
            <md-icon>directions_car</md-icon>
          </div>
          <h4 class="title">Veículos</h4>
        </md-card-header>
        <md-card-content>
          <md-table :value="queriedData" :md-sort.sync="currentSort" :md-sort-order.sync="currentSortOrder" :md-sort-fn="customSort" class="paginated-table table-striped table-hover">
            <md-table-toolbar>
              <md-button class="md-primary md-raised" @click="openCreate">
                <md-icon>add</md-icon>&nbsp;Novo Veículo
              </md-button>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Ano">{{item.year}}</md-table-cell>
              <md-table-cell md-label="Modelo">{{item.model}}</md-table-cell>
              <md-table-cell md-label="Placa">{{ item.licensePlate }}</md-table-cell>
              <md-table-cell md-label="Cor">{{ item.color }}</md-table-cell>
              <md-table-cell md-label="Marca">{{ item.brand }}</md-table-cell>
              <md-table-cell md-label="Cliente">{{ clientsMap[item.clientId] || item.clientId }}</md-table-cell>
              <md-table-cell md-label="Actions">
                <md-button class="md-just-icon md-warning md-simple" @click.native="handleEdit(item)">
                  <md-icon>edit</md-icon>
                </md-button>
                <md-button class="md-just-icon md-danger md-simple" @click.native="handleDelete(item)">
                  <md-icon>close</md-icon>
                </md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>
        <md-dialog :md-active.sync="createDialog.open">
          <md-dialog-title>Novo Veículo</md-dialog-title>

          <div style="padding: 16px;">
            <form @submit.prevent="saveCreate">
              <md-field :class="{ 'md-invalid': !!formErrors.year }">
                <label>Ano</label>
                <md-input v-model="form.year" />
                <span class="md-error" v-if="formErrors.year">{{ formErrors.year }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.model }">
                <label>Modelo</label>
                <md-input v-model="form.model" />
                <span class="md-error" v-if="formErrors.model">{{ formErrors.model }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.licensePlate }">
                <label>Placa</label>
                <md-input v-model="form.licensePlate" placeholder="" />
                <span class="md-error" v-if="formErrors.licensePlate">{{ formErrors.licensePlate }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.color }">
                <label>Cor</label>
                <md-input v-model="form.color" />
                <span class="md-error" v-if="formErrors.color">{{ formErrors.color }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.brand }">
                <label>Marca</label>
                <md-input v-model="form.brand" />
                <span class="md-error" v-if="formErrors.brand">{{ formErrors.brand }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.clientId }">
                <label>Cliente</label>
                <md-select v-model="form.clientId">
                  <md-option
                      v-for="client in clients"
                      :key="client.id"
                      :value="client.id"
                  >
                    {{ client.name || client.razaoSocial || client.description || ('Cliente #' + client.id) }}
                  </md-option>
                </md-select>
                <span class="md-error" v-if="formErrors.clientId">{{ formErrors.clientId }}</span>
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
          <md-dialog-title>Editar Veículo</md-dialog-title>

          <div style="padding: 16px;">
            <form @submit.prevent="saveEdit">
              <md-field :class="{ 'md-invalid': !!formErrors.year }">
                <label>Ano</label>
                <md-input v-model="form.year" />
                <span class="md-error" v-if="formErrors.year">{{ formErrors.vyear }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.model }">
                <label>Modelo</label>
                <md-input v-model="form.model" />
                <span class="md-error" v-if="formErrors.model">{{ formErrors.model }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.licensePlate}">
                <label>Placa</label>
                <md-input v-model="form.licensePlate" />
                <span class="md-error" v-if="formErrors.licensePlate">{{ formErrors.licensePlate }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.color }">
                <label>Cor</label>
                <md-input v-model="form.color" />
                <span class="md-error" v-if="formErrors.color">{{ formErrors.color }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.brand }">
                <label>Marca</label>
                <md-input v-model="form.brand" />
                <span class="md-error" v-if="formErrors.brand">{{ formErrors.brand }}</span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.clientId }">
                <label>Cliente</label>
                <md-select v-model="form.clientId">
                  <md-option
                      v-for="client in clients"
                      :key="client.id"
                      :value="client.id"
                  >
                    {{ client.name || client.razaoSocial || client.description || ('Cliente #' + client.id) }}
                  </md-option>
                </md-select>
                <span class="md-error" v-if="formErrors.clientId">{{ formErrors.clientId }}</span>
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
          <pagination class="pagination-no-border pagination-success" v-model="pagination.currentPage" :per-page="pagination.perPage" :total="total">
          </pagination>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import { Pagination } from "@/components";
import Swal from "sweetalert2";
import vehiclesService from "@/services/vehicles";
import clientsService from "@/services/clients";

export default {
  components: { Pagination },

  data() {
    return {
      currentSort: "name",
      currentSortOrder: "asc",

      pagination: {
        perPage: 20,
        currentPage: 1,
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
        year: "",
        model: "",
        licensePlate: "",
        color: "",
        brand: "",
        clientId: "",
      },
      formErrors: {
        year: "",
        model: "",
        licensePlate: "",
        color: "",
        brand: "",
        clientId: "",
      },
      savingEdit: false,

      // Criação
      createDialog: { open: false },
      savingCreate: false,

      clientsMap: {},
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
    async fetchVehicles() {
      try {
        this.loading = true;
        const params = {
          page: this.pagination.currentPage - 1,
        };

        const data = await vehiclesService.fetchVehicles(params);

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
          text: "Não foi possível carregar os veiculos.",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchClients() {
      try {
        const data = clientsService.fetchClients && await clientsService.fetchClients();

        const items =
            data?.items ??
            data?.content ??
            data?.data ??
            data?.results ??
            data ??
            [];

        this.clients = items;
        this.clientsMap = items.reduce((map, client) => {
          map[client.id] = `#${client.id} - ${client.name}`;
          return map;
        }, {});
      } catch (err) {
        console.error(err);
      }
    },
    async handleDelete(item) {
      const confirm = await Swal.fire({
        title: "Você tem certeza?",
        text: `Você não poderá reverter isso!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, remover veículo",
      });

      if (!confirm.value) return;

      try {
        this.deletingId = item.id;
        await vehiclesService.deleteVehicle(item.id);

        Swal.fire({
          title: "Veículo Removido!",
          text: `Você removeu ${item.licensePlate}`,
          icon: "success",
        });

        if (this.tableData.length === 1 && this.pagination.currentPage > 1) {
          this.pagination.currentPage -= 1;
        }
        await this.fetchVehicles();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível excluir o veículo.",
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
        year: item.year || "",
        model: item.model || "",
        licensePlate: item.licensePlate || "",
        color: item.color || "",
        brand: item.brand || "",
        clientId: item.clientId || "",
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

      if (!this.form.year || this.form.year.trim().length < 2) {
        this.formErrors.name = "Informe um ano válido.";
        ok = false;
      }

      if (!this.form.model || this.form.model.trim().length < 2) {
        this.formErrors.model = "Informe um modelo válido.";
        ok = false;
      }

      if (!this.form.licensePlate || this.form.licensePlate.trim().length < 2) {
        this.formErrors.licensePlate = "Informe uma placa válida.";
        ok = false;
      }

      if (!this.form.color || this.form.color.trim().length < 2) {
        this.formErrors.color = "Informe uma cor válida.";
        ok = false;
      }

      if (!this.form.brand || this.form.brand.trim().length < 2) {
        this.formErrors.brand = "Informe uma marca válida.";
        ok = false;
      }

      if (!this.form.clientId) {
        this.formErrors.clientId = "Informe um clientId válido.";
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
          year: this.form.year,
          model: this.form.model,
          licensePlate: this.form.licensePlate.trim(),
          color: this.form.color,
          brand: this.form.brand,
          clientId: this.form.clientId,
        };

        await vehiclesService.updateVehicle(id, payload);

        console.log("entrou2");
        this.editDialog.open = false;

        Swal.fire({
          title: "Atualizado!",
          text: "Veículo atualizado com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        // Recarrega a página atual mantendo a paginação
        await this.fetchVehicles();
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
      this.form = { year: "", model: "", licensePlate: "", color: "", brand: "", clientId: "" };
      this.createDialog.open = true;
    },

    closeCreate() {
      if (this.savingCreate) return;
      this.createDialog.open = false;
    },

    clearFormErrors() {
      this.formErrors = { year: "", model: "", licensePlate: "", color: "", brand: "", clientId: "" };
    },

    async saveCreate() {
      if (!this.validateForm()) return;

      try {
        this.savingCreate = true;
        const payload = {
          year: this.form.year,
          model: this.form.model,
          licensePlate: this.form.licensePlate.trim(),
          color: this.form.color,
          brand: this.form.brand,
          clientId: this.form.clientId,
        };

        await vehiclesService.createVehicle(payload);

        Swal.fire({
          title: "Criado!",
          text: "Veículo criado com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        this.createDialog.open = false;

        // feedback
        this.$nextTick(() => {
          this.$emit?.("created"); // opcional caso outras telas escutem
        });

        this.pagination.currentPage = 0;
        await this.fetchVehicles();
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
    this.fetchVehicles();
    this.fetchClients();
  },
  watch: {
    // Paginação
    "pagination.currentPage"() {
      this.fetchVehicles();
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
