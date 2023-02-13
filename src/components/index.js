import Fireworks from './Fireworks.vue'

const components = [
  {
    name: Fireworks.name || 'vue-damp-fireworks',
    component: Fireworks
  }
]
const install = function (app) {
  // if (install.installed) return
  // install.installed = true
  components.forEach(res => {
    app.component(res.name, res.component)
  })
}

export default {
  install
}
