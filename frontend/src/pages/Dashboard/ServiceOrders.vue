<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-blue">
          <div class="card-icon">
            <md-icon>build</md-icon>
          </div>
          <h4 class="title">Serviços de Reparo</h4>
        </md-card-header>

        <md-card-content>
          <md-table
              :value="queriedData"
              :md-sort.sync="currentSort"
              :md-sort-order.sync="currentSortOrder"
              :md-sort-fn="customSort"
              class="paginated-table table-striped table-hover"
          >
            <md-table-toolbar>
              <md-button class="md-primary md-raised" @click="openCreate">
                <md-icon>add</md-icon>&nbsp;Novo Serviço
              </md-button>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Nome">{{ item.name }}</md-table-cell>
              <md-table-cell md-label="Descrição">
                {{ item.description }}
              </md-table-cell>
              <md-table-cell md-label="Custo">
                {{ formatCost(item.cost) }}
              </md-table-cell>
              <md-table-cell md-label="Ações">
                <md-button
                    class="md-just-icon md-warning md-simple"
                    @click.native="handleEdit(item)"
                >
                  <md-icon>edit</md-icon>
                </md-button>
                <md-button
                    class="md-just-icon md-danger md-simple"
                    @click.native="handleDelete(item)"
                >
                  <md-icon>close</md-icon>
                </md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>

        <!-- DIALOG CRIAR -->
        <md-dialog :md-active.sync="createDialog.open">
          <md-dialog-title>Novo Serviço de Reparo</md-dialog-title>

          <div style="padding: 16px;">
            <form @submit.prevent="saveCreate">
              <md-field :class="{ 'md-invalid': !!formErrors.name }">
                <label>Nome</label>
                <md-input v-model="form.name" />
                <span class="md-error" v-if="formErrors.name">
                  {{ formErrors.name }}
                </span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.description }">
                <label>Descrição</label>
                <md-textarea v-model="form.description" />
                <span class="md-error" v-if="formErrors.description">
                  {{ formErrors.description }}
                </span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.cost }">
                <label>Custo</label>
                <md-input v-model.number="form.cost" type="number" step="0.01" />
                <span class="md-error" v-if="formErrors.cost">
                  {{ formErrors.cost }}
                </span>
              </md-field>
            </form>
          </div>

          <md-dialog-actions>
            <md-button class="md-default" @click="closeCreate" :disabled="savingCreate">
              Cancelar
            </md-button>
            <md-button class="md-primary md-raised" @click="saveCreate" :disabled="savingCreate">
              <template v-if="!savingCreate">Salvar</template>
              <md-progress-spinner
                  v-else
                  md-mode="indeterminate"
                  :md-diameter="18"
                  :md-stroke="2"
              />
            </md-button>
          </md-dialog-actions>
        </md-dialog>

        <!-- DIALOG EDITAR -->
        <md-dialog :md-active.sync="editDialog.open">
          <md-dialog-title>Editar Serviço de Reparo</md-dialog-title>

          <div style="padding: 16px;">
            <form @submit.prevent="saveEdit">
              <md-field :class="{ 'md-invalid': !!formErrors.name }">
                <label>Nome</label>
                <md-input v-model="form.name" />
                <span class="md-error" v-if="formErrors.name">
                  {{ formErrors.name }}
                </span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.description }">
                <label>Descrição</label>
                <md-textarea v-model="form.description" />
                <span class="md-error" v-if="formErrors.description">
                  {{ formErrors.description }}
                </span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.cost }">
                <label>Custo</label>
                <md-input v-model.number="form.cost" type="number" step="0.01" />
                <span class="md-error" v-if="formErrors.cost">
                  {{ formErrors.cost }}
                </span>
              </md-field>
            </form>
          </div>

          <md-dialog-actions>
            <md-button class="md-default" @click="closeEdit" :disabled="savingEdit">
              Cancelar
            </md-button>
            <md-button class="md-primary md-raised" @click="saveEdit" :disabled="savingEdit">
              <template v-if="!savingEdit">Salvar</template>
              <md-progress-spinner
                  v-else
                  md-mode="indeterminate"
                  :md-diameter="18"
                  :md-stroke="2"
              />
            </md-button>
          </md-dialog-actions>
        </md-dialog>

        <md-card-actions md-alignment="space-between">
          <div>
            <p class="card-category">
              Mostrando {{ from + 1 }} a {{ to }} de {{ total }} registros
            </p>
          </div>
          <pagination
              class="pagination-no-border pagination-success"
              v-model="pagination.currentPage"
              :per-page="pagination.perPage"
              :total="total"
          />
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import { Pagination } from "@/components";
import Swal from "sweetalert2";
import repairServicesService from "@/services/repair-services";

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

      tableData: [],
      total: 0,

      loading: false,
      deletingId: null,

      editDialog: {
        open: false,
      },
      createDialog: { open: false },

      form: {
        id: null,
        name: "",
        description: "",
        cost: null,
      },
      formErrors: {
        name: "",
        description: "",
        cost: "",
      },
      savingEdit: false,
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
    customSort(a, b, sortBy) {
      if (!sortBy) return 0;
      const valA = (a[sortBy] ?? "").toString().toLowerCase();
      const valB = (b[sortBy] ?? "").toString().toLowerCase();
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    },

    formatCost(value) {
      if (value === null || value === undefined || value === "") return "-";
      const num = Number(value);
      if (Number.isNaN(num)) return value;
      return num.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    async fetchRepairServices() {
      try {
        this.loading = true;
        const params = {
          page: this.pagination.currentPage - 1,
        };

        const data = await repairServicesService.fetchRepairServices(params);

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
          text: "Não foi possível carregar os serviços de reparo.",
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
        confirmButtonText: "Sim, remover serviço",
      });

      if (!confirm.value) return;

      try {
        this.deletingId = item.id;
        await repairServicesService.deleteRepairService(item.id);

        Swal.fire({
          title: "Serviço Removido!",
          text: `Você removeu ${item.name || item.id}`,
          icon: "success",
        });

        if (this.tableData.length === 1 && this.pagination.currentPage > 1) {
          this.pagination.currentPage -= 1;
        }
        await this.fetchRepairServices();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível excluir o serviço.",
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
        description: item.description || "",
        cost: item.cost ?? null,
      };
      this.editDialog.open = true;
    },

    closeEdit() {
      if (this.savingEdit) return;
      this.editDialog.open = false;
    },

    openCreate() {
      this.clearFormErrors();
      this.form = {
        id: null,
        name: "",
        description: "",
        cost: null,
      };
      this.createDialog.open = true;
    },

    closeCreate() {
      if (this.savingCreate) return;
      this.createDialog.open = false;
    },

    clearFormErrors() {
      this.formErrors = {
        name: "",
        description: "",
        cost: "",
      };
    },

    validateForm() {
      this.clearFormErrors();
      let ok = true;

      if (!this.form.name || this.form.name.trim().length < 2) {
        this.formErrors.name = "Informe um nome válido.";
        ok = false;
      }

      if (!this.form.description || this.form.description.trim().length < 5) {
        this.formErrors.description = "Informe uma descrição válida.";
        ok = false;
      }

      const costNumber = Number(this.form.cost);
      if (
          this.form.cost === null ||
          this.form.cost === "" ||
          Number.isNaN(costNumber) ||
          costNumber < 0
      ) {
        this.formErrors.cost = "Informe um custo válido.";
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
          description: this.form.description,
          cost: Number(this.form.cost),
        };

        await repairServicesService.updateRepairService(id, payload);

        this.editDialog.open = false;

        Swal.fire({
          title: "Atualizado!",
          text: "Serviço atualizado com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        await this.fetchRepairServices();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: err?.response?.data?.message || "Erro ao atualizar o serviço.",
          icon: "error",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-danger btn-fill",
        });
      } finally {
        this.savingEdit = false;
      }
    },

    async saveCreate() {
      if (!this.validateForm()) return;

      try {
        this.savingCreate = true;
        const payload = {
          name: this.form.name,
          description: this.form.description,
          cost: Number(this.form.cost),
        };

        await repairServicesService.createRepairService(payload);

        Swal.fire({
          title: "Criado!",
          text: "Serviço criado com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        this.createDialog.open = false;

        this.$nextTick(() => {
          this.$emit?.("created");
        });

        this.pagination.currentPage = 1;
        await this.fetchRepairServices();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: err?.response?.data?.message || "Erro ao criar o serviço.",
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
    this.fetchRepairServices();
  },

  watch: {
    "pagination.currentPage"() {
      this.fetchRepairServices();
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
