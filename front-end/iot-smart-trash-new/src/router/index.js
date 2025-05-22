import { createRouter, createWebHistory } from 'vue-router'
import StatisticsView from '@/components/StatisticsView.vue'
import GraphsView from '@/components/GraphsView.vue'

const routes = [
  { path: '/', component: StatisticsView },
  { path: '/graphs', component: GraphsView }
]

export default createRouter({
  history: createWebHistory(),
  routes,
})