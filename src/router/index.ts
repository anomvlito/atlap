import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/marcas',
      name: 'marcas',
      component: () => import('../views/MarcasView.vue'),
    },
    {
      path: '/entrenamientos',
      name: 'entrenamientos',
      component: () => import('../views/EntrenamientosView.vue'),
    },
    {
      path: '/analisis',
      name: 'analisis',
      component: () => import('../views/AnalisisView.vue'),
    },
    {
      path: '/equipo',
      name: 'equipo',
      component: () => import('../views/EquipoView.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/PerfilView.vue'),
    },
  ],
})

export default router
