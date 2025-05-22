<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Bar } from 'vue-chartjs'

// eslint-disable-next-line no-undef
defineProps({
  chartData: Object,
  chartOptions: Object,
})
</script>
