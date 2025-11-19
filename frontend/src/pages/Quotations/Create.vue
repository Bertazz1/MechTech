<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-100">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-green">
          <div class="card-icon">
            <md-icon>assignment</md-icon>
          </div>
          <h4 class="title">Nova Cotação</h4>
        </md-card-header>

        <md-card-content>
          <quotation-form
              v-model="form"
              :clients="clients"
              :vehicles="vehicles"
              :parts="parts"
              :repairServices="repairServices"
              :saving="saving"
              @submit="handleSubmit"
              @cancel="goBack"
          />
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
import repairServiceApi from "@/services/repair-services";
import quotationsService from "@/services/quotations";

export default {
  name: "QuotationCreate",
  components: { QuotationForm },

  data() {
    return {
      saving: false,

      // Estrutura de form usada pelo QuotationForm
      form: {
        description: "",
        entryTime: "",          // "2025-08-30" (date input)
        exitTime: "",           // "2025-08-31"
        status: 4,              // numérico, ex.: 4
        clientId: null,
        vehicleId: null,
        // arrays de objetos – o form monta isso
        parts: [],              // [{ id, name, price, quantity }]
        repairServices: [],     // [{ id, name, price }]
      },

      clients: [],
      vehicles: [],
      parts: [],
      repairServices: [],
    };
  },

  async created() {
    await this.loadDependencies();
  },

  methods: {
    async loadDependencies() {
      try {
        const [clientsRes, vehiclesRes, partsRes, repairRes] = await Promise.all([
          clientsService.fetchClients({ page: 0 }),
          vehiclesService.fetchVehicles && vehiclesService.fetchVehicles({ page: 0 }),
          partsService.fetchParts && partsService.fetchParts({ page: 0 }),
          repairServiceApi.fetchRepairServices && repairServiceApi.fetchRepairServices({ page: 0 }),
        ]);

        // clients -> vem em "content"
        this.clients = clientsRes?.content ?? [];

        // vehicles / parts / repairServices: tratamos genericamente
        const normalize = (res) =>
            res?.content ??
            res?.items ??
            res?.data ??
            res?.results ??
            res ??
            [];

        this.vehicles = vehiclesRes ? normalize(vehiclesRes) : [];
        this.parts = partsRes ? normalize(partsRes) : [];
        this.repairServices = repairRes ? normalize(repairRes) : [];
      } catch (err) {
        console.error("Erro ao carregar dependências:", err);
      }
    },

    // helper para converter "2025-08-30" -> "2025-08-30T00:00:00Z"
    toIsoDate(dateStr) {
      if (!dateStr) return null;
      // se quiser horário fixo, ajuste aqui (ex.: T09:00:00Z)
      return `${dateStr}T00:00:00Z`;
    },

    async handleSubmit() {
      this.saving = true;
      try {
        // extrair IDs das peças e serviços
        const partIds = (this.form.parts || []).map(p => p.id || p.partId);
        const repairServiceIds = (this.form.repairServices || []).map(s => s.id || s.repairServiceId);

        // calcular total das peças (considerando quantidade)
        const totalParts = (this.form.parts || []).reduce((sum, p) => {
          const q = Number(p.quantity ?? 1);
          const price = Number(p.price ?? 0);
          return sum + q * price;
        }, 0);

        // total dos serviços
        const totalServices = (this.form.repairServices || []).reduce((sum, s) => {
          const price = Number(s.price ?? s.cost ?? 0);
          return sum + price;
        }, 0);

        const price = totalParts + totalServices;

        const payload = {
          description: this.form.description,
          entryTime: this.toIsoDate(this.form.entryTime),
          exitTime: this.toIsoDate(this.form.exitTime),
          price,
          status: this.form.status,       // numérico: ex. 4
          clientId: this.form.clientId,
          vehicleId: this.form.vehicleId,
          partIds,
          repairServiceIds,
        };

        await quotationsService.createQuotation(payload);

        this.$toast?.open?.({
          message: "Cotação criada com sucesso!",
          type: "success",
        });

        this.$router.push("/quotations");
      } catch (err) {
        console.error(err);
        this.$toast?.open?.({
          message: err?.response?.data?.message || "Erro ao criar cotação",
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

