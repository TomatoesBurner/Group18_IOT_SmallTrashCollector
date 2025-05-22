<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container fluid>
    <div class="graphs-flex-root" style="display: flex; justify-content: center; align-items: stretch; gap: 48px; margin-top: 32px;">

      <div style="display: flex; flex-direction: column; align-items: stretch; justify-content: stretch; height: 440px; padding: 0; margin: 0;">
        <div style="display: flex; gap: 32px; height: 100%;">
          <v-date-picker v-model="startDate" label="Start Date" style="width: 350px; height: 100%; margin: 0; padding: 0;" />
          <v-date-picker v-model="endDate" label="End Date" style="width: 350px; height: 100%; margin: 0; padding: 0;" />
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; height: 440px; justify-content: stretch; padding: 0; margin: 0;">
        <v-card class="d-flex flex-column align-center justify-center pa-4" rounded="lg" elevation="3" color="#2E5E4E" style="flex: 1 1 0; min-height: 0; width: 350px; margin: 0;">
          <img :src="boxIcon" alt="Dry Waste" style="height: 60px; filter: invert(1)" />
          <div class="text-h5 font-weight-bold mt-2 text-white">Total Dry Waste</div>
          <div class="text-h3 font-weight-bold text-white">{{ totalDryCountAll }}</div>
        </v-card>
        <v-card class="d-flex flex-column align-center justify-center pa-4" rounded="lg" elevation="3" color="#5A3E36" style="flex: 1 1 0; min-height: 0; width: 350px; margin: 0;">
          <img :src="compostIcon" alt="Wet Waste" style="height: 60px; filter: invert(1)" />
          <div class="text-h5 font-weight-bold mt-2 text-white">Total Wet Waste</div>
          <div class="text-h3 font-weight-bold text-white">{{ totalWetCountAll }}</div>
        </v-card>
        <div style="display: flex; align-items: flex-end; justify-content: center; margin: 0; margin-top: 12px;">
          <v-btn color="primary" @click="generateChart" style="min-width: 200px; width: 350px;">
            Generate Chart
          </v-btn>
        </div>
      </div>
    </div>

    <v-row justify="center" style="margin-top: 32px;">
      <v-col cols="auto">
        <v-card elevation="3" rounded="lg" class="pa-4" style="height: 400px; width: 550px; margin: 0 auto;">
          <BarChart :chart-data="chartData" :chart-options="chartOptions" style="height: 100%;" />
        </v-card>
      </v-col>
      <v-col cols="auto">
        <v-card elevation="3" rounded="lg" class="pa-4" style="height: 400px; width: 550px; margin: 0 auto;">
          <v-card-title class="text-h6 custom-table-title">Waste History</v-card-title>
          <v-data-table
            :items="allRecords.filter(r => r.timestamp && r.type && r.weight > 0)"
            :headers="[
              { 
                text: 'Time',
                value: 'timestamp',
                class: 'custom-table-header',
                format: value => formatDateTime(value)
              },
              { text: 'Type', value: 'type', class: 'custom-table-header' },
              { text: 'Weight', value: 'weight', class: 'custom-table-header' }
            ]"
            class="elevation-1"
            density="comfortable"
            :items-per-page="-1"
            hide-default-footer
            style="height: calc(100% - 48px);"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.timestamp="{ item }">
              {{ formatDateTime(item.timestamp) }}
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

            <template #item.weight="{ item }">
              {{ item.weight > 0 ? item.weight : 0 }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="showBinFull" timeout="6000" color="error">
      {{ binFullMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BarChart from '@/components/BarChart.vue'
import axios from 'axios'
import boxIcon from '@/assets/box.png'
import compostIcon from '@/assets/compost.png'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


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

const todayStr = new Date().toISOString().split('T')[0]
const startDate = ref(todayStr)
const endDate = ref(todayStr)

const chartData = ref({
  labels: [],
  datasets: [
    { label: 'Dry Waste', data: [], backgroundColor: '#2E5E4E' },
    { label: 'Wet Waste', data: [], backgroundColor: '#5A3E36' },
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Daily Waste Comparison' },
  },
}

const showBinFull = ref(false)
const binFullMessage = ref('')

const dailyTotals = ref({})
const totalDryCount = ref(0)
const totalWetCount = ref(0)
const totalDryCountAll = ref(0)
const totalWetCountAll = ref(0)

const allRecords = ref([])

const generateChart = async () => {
  if (!startDate.value || !endDate.value) {
    alert('Please choose start date and end date')
    return
  }
  
  const formatDate = val => {
    if (val instanceof Date) {
      const year = val.getFullYear()
      const month = String(val.getMonth() + 1).padStart(2, '0')
      const day = String(val.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return val
    }
    const d = new Date(val)
    if (!isNaN(d)) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return ''
  }
  const params = {
    startDate: formatDate(startDate.value),
    endDate: formatDate(endDate.value),
  }
  try {
    const res = await axios.get('http://192.168.43.190:3008/api/smart-bins/records', { params })
    if (res.data.success && Array.isArray(res.data.data)) {
      // Reset totals
      dailyTotals.value = {}
      totalDryCount.value = 0
      totalWetCount.value = 0
      // Aggregate data
      res.data.data.forEach(record => {
        const dateStr = record.timestamp.split(' ')[0] || record.timestamp.split('T')[0]
        if (!dailyTotals.value[dateStr]) {
          dailyTotals.value[dateStr] = { dry: 0, wet: 0 }
        }
        const weight = record.weight < 0 ? 0 : record.weight
        if (record.type === 'dry') {
          dailyTotals.value[dateStr].dry += weight
          totalDryCount.value += 1
        } else if (record.type === 'wet') {
          dailyTotals.value[dateStr].wet += weight
          totalWetCount.value += 1
        }
      })
      // Update chart
      const sortedDates = Object.keys(dailyTotals.value).sort()
      chartData.value = {
        labels: sortedDates.map(date => formatDateTime(date)),
        datasets: [
          {
            label: 'Dry Waste',
            data: sortedDates.map(d => dailyTotals.value[d].dry),
            backgroundColor: '#2E5E4E'
          },
          {
            label: 'Wet Waste',
            data: sortedDates.map(d => dailyTotals.value[d].wet),
            backgroundColor: '#5A3E36'
          }
        ]
      }
    }
  } catch (e) {
    alert('Failed to fetch data')
    console.error(e)
  }
}

const fetchAllWasteCounts = async () => {
  try {
    const params = {
      startDate: '2000-01-01',
      endDate: new Date().toISOString().split('T')[0]
    }
    const res = await axios.get('http://192.168.43.190:3008/api/smart-bins/records', { params })
    if (res.data.success && Array.isArray(res.data.data)) {
      let dry = 0, wet = 0
      res.data.data.forEach(record => {
        if (record.type === 'dry') dry++
        if (record.type === 'wet') wet++
      })
      totalDryCountAll.value = dry
      totalWetCountAll.value = wet
    }
  } catch (e) {
    totalDryCountAll.value = 0
    totalWetCountAll.value = 0
    console.error('Failed to fetch all waste counts', e)
  }
}

const fetchAllRecords = async () => {
  try {
    const params = {
      startDate: '2000-01-01',
      endDate: new Date().toISOString().split('T')[0]
    }
    const res = await axios.get('http://192.168.43.190:3008/api/smart-bins/records', { params })
    if (res.data.success && Array.isArray(res.data.data)) {
      allRecords.value = res.data.data
    }
  } catch (e) {
    allRecords.value = []
    console.error('Failed to fetch all records', e)
  }
}

onMounted(() => {
  generateChart()
  fetchAllWasteCounts()
  fetchAllRecords()
})
</script>

<style>
.custom-table-header {
  background: #f5f5f5 !important;
  color: #333 !important;
  padding: 8px 16px !important;
}
.custom-table-title {
  background: #f5f5f5;
  color: #333;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 8px 16px;
}
.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}
.v-data-table .v-data-table__wrapper table thead tr th:first-child {
  border-top-left-radius: 8px;
}
.v-data-table .v-data-table__wrapper table thead tr th:last-child {
  border-top-right-radius: 8px;
}
@media (max-width: 960px) {
  .graphs-flex-root {
    flex-direction: column !important;
    gap: 16px !important;
    align-items: stretch !important;
  }
  .graphs-flex-root > div {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .graphs-flex-root .d-flex {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .graphs-flex-root .v-card,
  .graphs-flex-root .v-btn {
    width: 100% !important;
    min-width: 0 !important;
    margin: 0 0 16px 0 !important;
  }
  
  .v-row > .v-col {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    padding: 8px !important;
  }
  
  .v-row > .v-col .v-card {
    height: 300px !important;
    width: 100% !important;
  }
  
  .v-data-table {
    font-size: 14px !important;
  }
  
  .v-data-table__wrapper {
    overflow-x: auto !important;
  }
  
  .custom-table-header {
    padding: 6px 8px !important;
    white-space: nowrap !important;
  }
  
  .v-data-table .v-data-table__wrapper {
    max-width: calc(100vw - 32px) !important;
  }

  .graphs-flex-root .v-card img {
    height: 40px !important;
    width: 40px !important;
  }

  .graphs-flex-root .v-card .text-h5 {
    font-size: 1.1rem !important;
    margin-top: 8px !important;
  }

  .graphs-flex-root .v-card .text-h3 {
    font-size: 1.8rem !important;
  }

  .graphs-flex-root .v-card.pa-4 {
    padding: 12px !important;
  }

  .graphs-flex-root .v-btn {
    height: 40px !important;
    font-size: 0.9rem !important;
  }
}
</style>
