<template>
  <form @submit.prevent="emitSubmit">
    <!-- CLIENTE E VEÍCULO -->
    <div class="md-layout">
      <div class="md-layout-item md-size-35">
        <md-field>
          <label>Cliente</label>
          <md-select v-model="localForm.clientId">
            <md-option v-for="c in clients" :key="c.id" :value="c.id">
              {{ c.name }}
            </md-option>
          </md-select>
        </md-field>
      </div>

      <div class="md-layout-item md-size-30">
        <md-field>
          <label>Veículo</label>
          <md-select v-model="localForm.vehicleId">
            <md-option
                v-for="v in vehicles"
                :key="v.id"
                :value="v.id"
            >
              {{ v.licensePlate }}
            </md-option>
          </md-select>
        </md-field>
      </div>

      <div class="md-layout-item md-size-30">
        <md-field>
          <label>Entrada</label>
          <md-input type="date" v-model="localForm.entryTime" />
        </md-field>
      </div>
    </div>

    <!-- DESCRIÇÃO / DATA / STATUS -->
    <div class="md-layout">
      <div class="md-layout-item md-size-100">
        <md-field>
          <label>Descrição</label>
          <md-textarea v-model="localForm.description"></md-textarea>
        </md-field>
      </div>
    </div>

    <div class="md-layout">
      <div class="md-layout-item md-size-30">
        <md-field>
          <label>Status</label>
          <md-select v-model="localForm.status">
            <md-option value="pending">Pendente</md-option>
            <md-option value="approved">Aprovada</md-option>
            <md-option value="rejected">Rejeitada</md-option>
          </md-select>
        </md-field>
      </div>
    </div>

    <!-- PEÇAS -->
    <md-divider></md-divider>
    <h4 class="section-title">Peças</h4>

    <div class="add-row">
      <md-field>
        <label>Selecionar peça</label>
        <md-select v-model="selectedPartId">
          <md-option
              v-for="p in parts"
              :key="p.id"
              :value="p.id"
          >
            {{ p.name }} — R$ {{ p.price }}
          </md-option>
        </md-select>
      </md-field>

      <md-field class="qty-field">
        <label>Qtd</label>
        <md-input type="number" min="1" v-model.number="selectedPartQty" />
      </md-field>

      <md-button
          class="md-success md-raised"
          @click="addPart"
          :disabled="!selectedPartId"
      >
        Adicionar
      </md-button>
    </div>

    <md-table v-if="localForm.parts.length">
      <md-table-row>
        <md-table-head>Peça</md-table-head>
        <md-table-head>Qtd</md-table-head>
        <md-table-head>Valor Total</md-table-head>
        <md-table-head></md-table-head>
      </md-table-row>

      <md-table-row
          v-for="(item, index) in localForm.parts"
          :key="index"
      >
        <md-table-cell>{{ item.name }}</md-table-cell>
        <md-table-cell>{{ item.quantity }}</md-table-cell>
        <md-table-cell>
          R$ {{ (item.quantity * item.price).toFixed(2) }}
        </md-table-cell>
        <md-table-cell>
          <md-button class="md-danger md-raised" @click="removePart(index)">
            Remover
          </md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <!-- SERVIÇOS -->
    <md-divider></md-divider>
    <h4 class="section-title">Serviços de Reparo</h4>

    <div class="add-row">
      <md-field>
        <label>Selecionar serviço</label>
        <md-select v-model="selectedServiceId">
          <md-option
              v-for="s in repairServices"
              :key="s.id"
              :value="s.id"
          >
            {{ s.name }} — R$ {{ s.cost }}
          </md-option>
        </md-select>
      </md-field>

      <md-button
          class="md-success md-raised"
          @click="addRepairService"
          :disabled="!selectedServiceId"
      >
        Adicionar
      </md-button>
    </div>

    <md-table v-if="localForm.repairServices.length">
      <md-table-row>
        <md-table-head>Serviço</md-table-head>
        <md-table-head>Valor</md-table-head>
        <md-table-head></md-table-head>
      </md-table-row>

      <md-table-row
          v-for="(item, index) in localForm.repairServices"
          :key="index"
      >
        <md-table-cell>{{ item.name }}</md-table-cell>
        <md-table-cell>R$ {{ item.price }}</md-table-cell>
        <md-table-cell>
          <md-button class="md-danger md-raised" @click="removeService(index)">
            Remover
          </md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <!-- TOTAL -->
    <md-divider></md-divider>

    <div class="totals-box">
      <p><strong>Total Peças:</strong> R$ {{ totalParts }}</p>
      <p><strong>Total Serviços:</strong> R$ {{ totalServices }}</p>
      <p class="grand-total">
        <strong>Total Geral: R$ {{ grandTotal }}</strong>
      </p>
    </div>

    <!-- BOTÕES -->
    <md-card-actions md-alignment="left">
      <md-button
          type="submit"
          class="md-success md-raised"
          :disabled="saving"
      >
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </md-button>

      <md-button class="md-danger md-raised" @click="$emit('cancel')">
        Cancelar
      </md-button>
    </md-card-actions>
  </form>
</template>

<script>
export default {
  name: "QuotationForm",

  props: {
    value: Object, // v-model
    clients: Array,
    vehicles: Array,
    parts: Array,
    repairServices: Array,
    saving: Boolean,
  },

  data() {
    return {
      localForm: JSON.parse(JSON.stringify(this.value)),

      selectedPartId: null,
      selectedPartQty: 1,

      selectedServiceId: null,
    };
  },

  watch: {
    localForm: {
      deep: true,
      handler(val) {
        this.$emit("input", val); // v-model
      },
    },
  },

  computed: {
    totalParts() {
      return this.localForm.parts
          .reduce((sum, p) => sum + p.price * p.quantity, 0)
          .toFixed(2);
    },
    totalServices() {
      return this.localForm.repairServices
          .reduce((sum, s) => sum + s.price, 0)
          .toFixed(2);
    },
    grandTotal() {
      return (parseFloat(this.totalParts) + parseFloat(this.totalServices)).toFixed(2);
    },
  },

  methods: {
    emitSubmit() {
      this.$emit("submit");
    },

    addPart() {
      const part = this.parts.find(p => p.id === this.selectedPartId);
      if (!part) return;

      this.localForm.parts.push({
        id: part.id,
        name: part.name,
        price: part.price,
        quantity: this.selectedPartQty,
      });

      this.selectedPartId = null;
      this.selectedPartQty = 1;
    },

    removePart(index) {
      this.localForm.parts.splice(index, 1);
    },

    addRepairService() {
      const service = this.repairServices.find(s => s.id === this.selectedServiceId);
      if (!service) return;

      this.localForm.repairServices.push({
        id: service.id,
        name: service.name,
        price: service.cost,
      });

      this.selectedServiceId = null;
    },

    removeService(index) {
      this.localForm.repairServices.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.section-title {
  margin: 20px 0 10px;
  font-weight: bold;
  font-size: 18px;
}

.add-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.qty-field {
  max-width: 120px;
}

.totals-box {
  margin-top: 15px;
  font-size: 16px;
}

.grand-total {
  margin-top: 10px;
  font-size: 20px;
  color: #2e7d32;
}
</style>
