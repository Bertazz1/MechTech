<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-blue">
          <div class="card-icon">
            <md-icon>request_quote</md-icon>
          </div>
          <h4 class="title">Cotações</h4>
        </md-card-header>

        <md-card-content>
          <md-table :value="queriedData" class="paginated-table table-striped table-hover">
            <md-table-toolbar>
              <md-button
                  class="md-primary md-raised"
                  @click="goToCreate"
                  :disabled="loading"
              >
                <md-icon>add</md-icon>&nbsp;Nova Cotação
              </md-button>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="#">
                {{ item.id }}
              </md-table-cell>

              <md-table-cell md-label="Descrição">
                {{ item.description }}
              </md-table-cell>

              <md-table-cell md-label="Entrada">
                {{ item.entryTime }}
              </md-table-cell>

              <md-table-cell md-label="Saída">
                {{ item.exitTime }}
              </md-table-cell>

              <md-table-cell md-label="Valor">
                {{ formatPrice(item.price) }}
              </md-table-cell>

              <md-table-cell md-label="Status">
                {{ statusLabel(item.status) }}
              </md-table-cell>

              <md-table-cell md-label="Cliente">
                {{ clientsMap[item.clientId] || item.clientId }}
              </md-table-cell>

              <md-table-cell md-label="Veículo">
                {{
                  vehiclesMap[item.vehicleId]?.licensePlate
                  || item.vehicle?.licensePlate
                  || item.vehicleId
                }}
              </md-table-cell>

              <md-table-cell md-label="Ações">
                <md-button
                    class="md-just-icon md-warning md-simple"
                    @click.native="goToEdit(item)"
                    :disabled="loading || deletingId === item.id"
                >
                  <md-icon>edit</md-icon>
                </md-button>

                <md-button
                    class="md-just-icon md-danger md-simple"
                    @click.native="handleDelete(item)"
                    :disabled="loading || deletingId === item.id"
                >
                  <md-icon v-if="deletingId !== item.id">close</md-icon>
                  <md-progress-spinner
                      v-else
                      md-mode="indeterminate"
                      :md-diameter="16"
                      :md-stroke="2"
                  />
                </md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>

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

import quotationsService from "@/services/quotations";
import clientsService from "@/services/clients";
import vehiclesService from "@/services/vehicles";

export default {
  name: "QuotationsList",
  components: { Pagination },

  data() {
    return {
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

      clients: [],
      clientsMap: {},
      allVehicles: [],
      vehiclesMap: {},

      statusOptions: [
        { value: "AWAITING_CONVERSION", label: "Aguardando conversão" },
        { value: "CONVERTED_TO_ORDER", label: "Convertida em pedido" },
        { value: "CANCELED", label: "Cancelada" },
      ],
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
    formatPrice(value) {
      if (value === null || value === undefined || value === "") return "-";
      const num = Number(value);
      if (Number.isNaN(num)) return value;
      return num.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    statusLabel(value) {
      const found = this.statusOptions.find((s) => s.value === value);
      return found ? found.label : value;
    },

    goToCreate() {
      this.$router.push({ name: "QuotationCreate" });
    },

    goToEdit(item) {
      this.$router.push({
        name: "QuotationEdit",
        params: { id: item.id },
      });
    },

    async fetchQuotations() {
      try {
        this.loading = true;

        const params = {
          page: this.pagination.currentPage - 1,
        };

        const data = await quotationsService.fetchQuotations(params);

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
          text: "Não foi possível carregar as cotações.",
          icon: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchClients() {
      try {
        const data =
            (clientsService.fetchClients &&
                (await clientsService.fetchClients())) ||
            (clientsService.getAll && (await clientsService.getAll())) ||
            {};

        const items =
            data?.items ??
            data?.content ??
            data?.data ??
            data?.results ??
            data ??
            [];

        this.clients = items;
        this.clientsMap = items.reduce((map, client) => {
          map[client.id] =
              client.name ||
              client.razaoSocial ||
              client.description ||
              `Cliente #${client.id}`;
          return map;
        }, {});
      } catch (err) {
        console.error(err);
      }
    },

    async fetchAllVehicles() {
      try {
        const data =
            vehiclesService.fetchVehicles &&
            (await vehiclesService.fetchVehicles({}));

        const items =
            data?.items ??
            data?.content ??
            data?.data ??
            data?.results ??
            data ??
            [];

        this.allVehicles = items;
        this.vehiclesMap = items.reduce((map, v) => {
          map[v.id] = v;
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
        confirmButtonText: "Sim, remover cotação",
      });

      if (!confirm.value) return;

      try {
        this.deletingId = item.id;
        await quotationsService.deleteQuotation(item.id);

        Swal.fire({
          title: "Cotação Removida!",
          text: `Você removeu a cotação #${item.id}`,
          icon: "success",
        });

        if (this.tableData.length === 1 && this.pagination.currentPage > 1) {
          this.pagination.currentPage -= 1;
        } else {
          await this.fetchQuotations();
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Erro",
          text: "Não foi possível excluir a cotação.",
          icon: "error",
        });
      } finally {
        this.deletingId = null;
      }
    },
  },

  mounted() {
    this.fetchClients();
    this.fetchAllVehicles();
    this.fetchQuotations();
  },

  watch: {
    "pagination.currentPage"() {
      this.fetchQuotations();
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
