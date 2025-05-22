<template>
  <v-container fluid>
    <v-row justify="center" class="pt-4 mb-12">
      <v-col cols="6" xs="6" sm="6" md="4">
        <v-card
          class="d-flex flex-column align-center justify-center pa-4"
          rounded="lg"
          elevation="3"
          :color="metrics.dryFull ? 'red' : '#2E5E4E'"
          style="height: 300px"
        >
          <img :src="boxIcon" alt="Dry Waste" style="height: 60px; filter: invert(1)" />
          <div class="text-h4 font-weight-bold mt-2 text-white">
            {{ metrics.dryFull ? 'FULL' : metrics.dry.toFixed(1) + 'g' }}
          </div>
          <div class="text-subtitle-1 text-white mb-2">
            {{ metrics.dryFull ? 'Please Clear the Dry Waste Bin' : 'Dry Waste Weight' }}
          </div>
          <v-btn color="white" variant="tonal" @click="clearDry" size="large" class="text-button font-weight-bold" :disabled="metrics.dry <= 0 && !metrics.dryFull">
            Reset Bin
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="6" xs="6" sm="6" md="4">
        <v-card
          class="d-flex flex-column align-center justify-center pa-4"
          rounded="lg"
          elevation="3"
          :color="metrics.wetFull ? 'red' : '#5A3E36'"
          style="height: 300px"
        >
          <img :src="compostIcon" alt="Wet Waste" style="height: 60px; filter: invert(1)" />
          <div class="text-h4 font-weight-bold mt-2 text-white">
            {{ metrics.wetFull ? 'FULL' : metrics.wet.toFixed(1) + 'g' }}
          </div>
          <div class="text-subtitle-1 text-white mb-2">
            {{ metrics.wetFull ? 'Please Clear the Wet Waste Bin' : 'Wet Waste Weight' }}
          </div>
          <v-btn color="white" variant="tonal" @click="clearWet" size="large" class="text-button font-weight-bold" :disabled="metrics.wet <= 0 && !metrics.wetFull">
            Reset Bin
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="3">
          <v-card-title class="text-h6 custom-table-title">Clear Bin History</v-card-title>
          <v-data-table
            :items="clearLogs"
            :headers="clearHeaders"
            class="elevation-1"
            density="comfortable"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.time="{ item }">
              {{ formatDateTime(item.time) }}
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.type="{ item }">
              <span
                :style="{
                  display: 'inline-block',
                  minWidth: '48px',
                  textAlign: 'center',
                  borderRadius: '6px',
                  padding: '2px 12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: item.type === 'dry' ? '#2E5E4E' : item.type === 'wet' ? '#5A3E36' : '#888'
                }"
              >
                {{ item.type === 'dry' ? 'Dry' : item.type === 'wet' ? 'Wet' : item.type }}
              </span>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    
    <v-snackbar v-model="showError" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import boxIcon from '@/assets/box.png'
import compostIcon from '@/assets/compost.png'
import { useWebSocket } from '@/composables/useWebSocket'
import axios from 'axios'

// Format date and time
const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  if (timestamp.includes(' ')) {
    const [date, time] = timestamp.split(' ')
    const [year, month, day] = date.split('-')
    return `${day}-${month}-${year} ${time}`
  }
  const [year, month, day] = timestamp.split('-')
  return `${day}-${month}-${year}`
}

const metrics = ref({
  dry: 0,
  wet: 0,
  dryFull: false,
  wetFull: false
})

const clearLogs = ref([])

const { connect, messages } = useWebSocket('http://192.168.43.190:3008')

connect()

// Watch for new trash records and update metrics and clear logs
watch(messages, () => {
  const lastMsg = messages.value[messages.value.length - 1]
  if (!lastMsg) return
  if (lastMsg.type === 'initialWeight') {
    metrics.value.dry = lastMsg.dry?.currentWeight || 0
    metrics.value.wet = lastMsg.wet?.currentWeight || 0
    metrics.value.dryFull = !!lastMsg.dry?.isFull
    metrics.value.wetFull = !!lastMsg.wet?.isFull
    clearLogs.value = []
    if (Array.isArray(lastMsg.resetHistory)) {
      lastMsg.resetHistory.forEach(r => {
        clearLogs.value.push({
          time: r.timestamp,
          type: r.type
        })
      })
    }
  } else if (lastMsg.type === 'dry') {
    metrics.value.dry = lastMsg.currentWeight
    metrics.value.dryFull = !!lastMsg.isFull
    if (lastMsg.operationType === 'reset') {
      clearLogs.value.push({
        time: lastMsg.timestamp,
        type: lastMsg.type
      })
    }
  } else if (lastMsg.type === 'wet') {
    metrics.value.wet = lastMsg.currentWeight
    metrics.value.wetFull = !!lastMsg.isFull
    if (lastMsg.operationType === 'reset') {
      clearLogs.value.push({
        time: lastMsg.timestamp,
        type: lastMsg.type
      })
    }
  }
})

// Error handling states
const showError = ref(false)
const errorMessage = ref('')

// Error handling function
const handleError = (error) => {
  console.error('API Error:', error)
  errorMessage.value = error.message === 'Network Error' 
    ? 'Unable to connect to the server. Please check your network connection.'
    : 'An error occurred. Please try again later.'
  showError.value = true
}

const clearDry = async () => {
  if (metrics.value.dry > 0 || metrics.value.dryFull) {
    try {
      const now = new Date()
      const formattedDate = now.toISOString().replace('T', ' ').slice(0, 19)
      await axios.post('http://192.168.43.190:3008/api/smart-bins/reset', {
        type: 'dry',
        operationType: 'reset',
        weight: 0,
        currentWeight: 0,
        binId: 'bin002',
        timestamp: formattedDate,
        isFull: false,
        message: 'Dry waste bin has been cleared'
      })
    } catch (error) {
      handleError(error)
    }
  }
}

const clearWet = async () => {
  if (metrics.value.wet > 0 || metrics.value.wetFull) {
    try {
      const now = new Date()
      const formattedDate = now.toISOString().replace('T', ' ').slice(0, 19)
      await axios.post('http://192.168.43.190:3008/api/smart-bins/reset', {
        type: 'wet',
        operationType: 'reset',
        weight: 0,
        currentWeight: 0,
        binId: 'bin001',
        timestamp: formattedDate,
        isFull: false,
        message: 'Wet waste bin has been cleared'
      })
    } catch (error) {
      handleError(error)
    }
  }
}

const clearHeaders = [
  { 
    title: 'Time', 
    key: 'time',
    format: value => formatDateTime(value)
  },
  { title: 'Type', key: 'type' }
]
</script>

<style scoped>
.text-button {
  font-size: 16px;
  height: 48px;
  min-width: 140px;
}
.custom-table-title {
  background: #e0e0e0;
  color: #222;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
</style>