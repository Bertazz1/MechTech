<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-100">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-blue">
          <div class="card-icon">
            <md-icon>assignment</md-icon>
          </div>
          <h4 class="title">
            Editar Cotação
            <small v-if="form.id">#{{ form.id }}</small>
          </h4>
        </md-card-header>

        <md-card-content>
          <quotation-form
              v-if="!loading"
              v-model="form"
              :clients="clients"
              :vehicles="vehicles"
              :parts="parts"
              :repairServices="repairServices"
              :saving="saving"
              @submit="handleSubmit"
              @cancel="goBack"
          />

          <div v-else class="loading-wrapper">
            <md-progress-spinner
                md-mode="indeterminate"
                :md-diameter="48"
                :md-stroke="4"
            />
          </div>
        </md-card-content>
      </md-card>
    </div>
  </div>
</template>

<script>
import QuotationForm from "@/components/Quotations/QuotationForm.vue";

import clientsService from "@/services/clients";
import vehiclesService from "@/services/vehicles";
import partsService from "@/services/parts";
import repairServicesService from "@/services/repair-services";
import quotationsService from "@/services/quotations";

const normalizeList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.content)) return res.content;
  return [];
};

export default {
  name: "QuotationEdit",
  components: { QuotationForm },

  data() {
    return {
      loading: false,
      saving: false,

      form: {
        id: null,
        clientId: null,
        vehicleId: null,
        description: "",
        entryTime: "",
        exitTime: "",
        status: "",          // ex: "AWAITING_CONVERSION"
        parts: [],           // [{ id, name, quantity, price }]
        repairServices: [],  // [{ id, name, price }]
      },

      clients: [],
      vehicles: [],
      parts: [],
      repairServices: [],
    };
  },

  async created() {
    await this.loadDependencies();
    await this.loadQuotation();
  },

  methods: {
    async loadDependencies() {
      try {
        this.loading = true;

        const [clientsRes, vehiclesRes, partsRes, repairRes] = await Promise.all([
          clientsService.fetchClients({ page: 0 }),
          vehiclesService.fetchVehicles({ page: 0 }),
          partsService.fetchParts({ page: 0 }),
          repairServicesService.fetchRepairServices({ page: 0 }),
        ]);

        this.clients = normalizeList(clientsRes);
        this.vehicles = normalizeList(vehiclesRes);
        this.parts = normalizeList(partsRes);
        this.repairServices = normalizeList(repairRes);
      } catch (err) {
        console.error("Erro ao carregar dependências:", err);
      } finally {
        this.loading = false;
      }
    },

    async loadQuotation() {
      try {
        this.loading = true;

        const id = this.$route.params.id;
        const data = await quotationsService.fetchQuotationById(id);

        const normalizeDate = (value) => {
          if (!value) return "";
          return value.substring(0, 10); // "2025-08-30T09:00:00" -> "2025-08-30"
        };

        this.form = {
          id: data.id,
          description: data.description || "",
          entryTime: normalizeDate(data.entryTime),
          exitTime: normalizeDate(data.exitTime),
          status: data.status || "",

          clientId: data.client?.id ?? data.clientId ?? null,
          vehicleId: data.vehicle?.id ?? data.vehicleId ?? null,

          // Itens de peças (partItems)
          parts: (data.partItems || []).map((item) => ({
            id: item.part?.id ?? item.partId ?? item.id,
            name: item.part?.name ?? item.name,
            quantity: item.quantity ?? 1,
            price:
                item.part?.price ??
                item.unitPrice ??
                item.price ??
                0,
          })),

          // Itens de serviços (serviceItems)
          repairServices: (data.serviceItems || []).map((item) => ({
            id: item.repairService?.id ?? item.serviceId ?? item.id,
            name: item.repairService?.name ?? item.name,
            price:
                item.repairService?.cost ??
                item.price ??
                item.cost ??
                0,
          })),
        };
      } catch (err) {
        console.error("Erro ao carregar cotação:", err);
        this.$toast?.open?.({
          message: "Erro ao carregar a cotação.",
          type: "danger",
        });
      } finally {
        this.loading = false;
      }
    },

    toIsoDate(dateStr) {
      if (!dateStr) return null;
      // ajuste se quiser horário diferente
      return `${dateStr}T00:00:00Z`;
    },

    async handleSubmit() {
      this.saving = true;
      try {
        // IDs
        const partIds = (this.form.parts || []).map((p) => p.id);
        const repairServiceIds = (this.form.repairServices || []).map(
            (s) => s.id
        );

        // Total de peças
        const totalParts = (this.form.parts || []).reduce((sum, p) => {
          const q = Number(p.quantity ?? 1);
          const price = Number(p.price ?? 0);
          return sum + q * price;
        }, 0);

        // Total de serviços
        const totalServices = (this.form.repairServices || []).reduce(
            (sum, s) => {
              const price = Number(s.price ?? 0);
              return sum + price;
            },
            0
        );

        const price = totalParts + totalServices;

        // Se a API realmente espera número em status, mapeie aqui:
        // const statusMap = {
        //   AWAITING_CONVERSION: 4,
        //   CONVERTED_TO_ORDER: 5,
        //   CANCELED: 6,
        // };
        // const status = statusMap[this.form.status] ?? this.form.status;

        const payload = {
          description: this.form.description,
          entryTime: this.toIsoDate(this.form.entryTime),
          exitTime: this.toIsoDate(this.form.exitTime),
          price,
          status: this.form.status, // ou "status" se mapear para número
          clientId: this.form.clientId,
          vehicleId: this.form.vehicleId,
          partIds,
          repairServiceIds,
        };

        await quotationsService.updateQuotation(this.form.id, payload);

        this.$toast?.open?.({
          message: "Cotação atualizada com sucesso!",
          type: "success",
        });

        this.goBack();
      } catch (err) {
        console.error(err);
        this.$toast?.open?.({
          message: err?.response?.data?.message || "Erro ao atualizar a cotação.",
          type: "danger",
        });
      } finally {
        this.saving = false;
      }
    },

    goBack() {
      this.$router.push("/quotations");
    },
  },
};
</script>

<style scoped>
.loading-wrapper {
  padding: 32px 0;
  display: flex;
  justify-content: center;
}
</style>
