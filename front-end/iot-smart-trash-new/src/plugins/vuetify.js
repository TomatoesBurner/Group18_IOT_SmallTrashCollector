// src/plugins/vuetify.js
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import {
  VApp,
  VAppBar,
  VBtn,
  VCard,
  VContainer,
  VRow,
  VCol,
  VMenu,
  VTextField,
  VDatePicker,
  VNavigationDrawer,
  VList,
  VListItem,
  VDataTable,
  VIcon,
} from 'vuetify/components'

export default createVuetify({
  components: {
    VApp,
    VAppBar,
    VBtn,
    VCard,
    VContainer,
    VRow,
    VCol,
    VMenu,
    VTextField,
    VDatePicker,
    VNavigationDrawer,
    VList,
    VListItem,
    VDataTable,
    VIcon,
  },
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme: {
        dark: false,
        colors: {
          primary: '#2E5E4E',
          secondary: '#5A3E36',
        },
      },
    },
  },
})
