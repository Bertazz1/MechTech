<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-blue">
          <div class="card-icon">
            <md-icon>build</md-icon>
          </div>
          <h4 class="title">Peças</h4>
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
                <md-icon>add</md-icon>&nbsp;Nova Peça
              </md-button>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Nome">{{ item.name }}</md-table-cell>
              <md-table-cell md-label="Descrição">
                {{ item.description }}
              </md-table-cell>
              <md-table-cell md-label="Código">{{ item.code }}</md-table-cell>
              <md-table-cell md-label="Preço">
                {{ formatPrice(item.price) }}
              </md-table-cell>
              <md-table-cell md-label="Fornecedor">
                {{ item.supplier || '-' }}
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
          <md-dialog-title>Nova Peça</md-dialog-title>

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

              <md-field :class="{ 'md-invalid': !!formErrors.code }">
                <label>Código</label>
                <md-input v-model="form.code" />
                <span class="md-error" v-if="formErrors.code">
                  {{ formErrors.code }}
                </span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.price }">
                <label>Preço</label>
                <md-input v-model.number="form.price" type="number" step="0.01" />
                <span class="md-error" v-if="formErrors.price">
                  {{ formErrors.price }}
                </span>
              </md-field>

              <md-field>
                <label>Fornecedor</label>
                <md-input v-model="form.supplier" />
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
          <md-dialog-title>Editar Peça</md-dialog-title>

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

              <md-field :class="{ 'md-invalid': !!formErrors.code }">
                <label>Código</label>
                <md-input v-model="form.code" />
                <span class="md-error" v-if="formErrors.code">
                  {{ formErrors.code }}
                </span>
              </md-field>

              <md-field :class="{ 'md-invalid': !!formErrors.price }">
                <label>Preço</label>
                <md-input v-model.number="form.price" type="number" step="0.01" />
                <span class="md-error" v-if="formErrors.price">
                  {{ formErrors.price }}
                </span>
              </md-field>

              <md-field>
                <label>Fornecedor</label>
                <md-input v-model="form.supplier" />
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
import partsService from "@/services/parts";

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
        code: "",
        price: null,
        supplier: "",
      },
      formErrors: {
        name: "",
        description: "",
        code: "",
        price: "",
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

    formatPrice(value) {
      if (value === null || value === undefined || value === "") return "-";
      const num = Number(value);
      if (Number.isNaN(num)) return value;
      return num.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    async fetchParts() {
      try {
        this.loading = true;
        const params = {
          page: this.pagination.currentPage - 1,
        };

        const data = await partsService.fetchParts(params);

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
          text: "Não foi possível carregar as peças.",
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
        confirmButtonText: "Sim, remover peça",
      });

      if (!confirm.value) return;

      try {
        this.deletingId = item.id;
        await partsService.deletePart(item.id);

        Swal.fire({
          title: "Peça Removida!",
          text: `Você removeu ${item.name || item.code || item.id}`,
          icon: "success",
        });

        if (this.tableData.length === 1 && this.pagination.currentPage > 1) {
          this.pagination.currentPage -= 1;
        }
        await this.fetchParts();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível excluir a peça.",
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
        code: item.code || "",
        price: item.price ?? null,
        supplier: item.supplier || "",
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
        code: "",
        price: null,
        supplier: "",
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
        code: "",
        price: "",
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

      if (!this.form.code || this.form.code.trim().length < 2) {
        this.formErrors.code = "Informe um código válido.";
        ok = false;
      }

      const priceNumber = Number(this.form.price);
      if (
          this.form.price === null ||
          this.form.price === "" ||
          Number.isNaN(priceNumber) ||
          priceNumber < 0
      ) {
        this.formErrors.price = "Informe um preço válido.";
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
          code: this.form.code.trim(),
          price: Number(this.form.price),
          supplier: this.form.supplier || null,
        };

        await partsService.updatePart(id, payload);

        this.editDialog.open = false;

        Swal.fire({
          title: "Atualizado!",
          text: "Peça atualizada com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        await this.fetchParts();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: err?.response?.data?.message || "Erro ao atualizar a peça.",
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
          code: this.form.code.trim(),
          price: Number(this.form.price),
          supplier: this.form.supplier || null,
        };

        await partsService.createPart(payload);

        Swal.fire({
          title: "Criado!",
          text: "Peça criada com sucesso.",
          icon: "success",
          buttonsStyling: false,
          confirmButtonClass: "md-button md-success btn-fill",
        });

        this.createDialog.open = false;

        this.$nextTick(() => {
          this.$emit?.("created");
        });

        this.pagination.currentPage = 1;
        await this.fetchParts();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: err?.response?.data?.message || "Erro ao criar a peça.",
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
    this.fetchParts();
  },

  watch: {
    "pagination.currentPage"() {
      this.fetchParts();
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
