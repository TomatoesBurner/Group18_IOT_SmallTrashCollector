<template>
  <v-app class="main-background">
    <!-- Top Navigation Bar -->
    <v-app-bar app flat color="#fafafa" dark elevation="2" class="mb-4">
      <v-container class="pa-0">
        <div class="d-flex align-center justify-space-between">
          <h1 class="text-h5 font-weight-bold text-truncate mb-0">Smart Trash Management Dashboard</h1>

          <div class="d-none d-md-flex">
            <v-btn class="custom-nav-btn mr-4" variant="text" @click="$router.push('/')">HOME</v-btn>
            <v-btn class="custom-nav-btn" variant="text" @click="$router.push('/graphs')">GRAPHS</v-btn>
          </div>


          <v-app-bar-nav-icon class="d-flex d-md-none" @click="drawer = !drawer" />
        </div>
      </v-container>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary class="d-md-none">
      <v-list>
        <v-list-item @click="$router.push('/'); drawer = false">Home</v-list-item>
        <v-list-item @click="$router.push('/graphs'); drawer = false">Graphs</v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)
</script>

<style>
.main-background {
  background-color: #fafafa;
}

.custom-nav-btn {
  color: #2c3e50;
  font-weight: bold;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 8px;
}

.custom-nav-btn:hover {
  background-color: #3f7666;
  color: white;
}

@media (max-width: 960px) {
  .text-h5 {
    font-size: 1.2rem !important;
  }
  
  .v-container {
    padding: 0 16px !important;
  }
}
</style>