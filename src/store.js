import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    player: null,
    status: null
  },
  mutations: {
    initialiseStore (state) {
      let auth = JSON.parse(localStorage.getItem('auth'))
      if (auth) {
        state.auth = auth
      }
    },
    /* A fit-them-all commit */
    basic (state, payload) {
      state[payload.key] = payload.value
    },

    /* Auth */
    auth (state, payload) {
      if (payload) {
        state.auth = payload
      }
    },

    /* Aside Mobile */
    asideMobileStateToggle (state, payload = null) {
      const htmlClassName = 'has-aside-mobile-expanded'

      let isShow

      if (payload !== null) {
        isShow = payload
      } else {
        isShow = !state.isAsideMobileExpanded
      }

      if (isShow) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }

      state.isAsideMobileExpanded = isShow
    },

    /* Auth */
    auth_request (state) {
      state.status = 'loading'
    },
    preferences_success (state, data) {
      state.player = data
      localStorage.setItem('player', JSON.stringify(data))
    },
    preferences_error (state) {
      state.status = 'error'
      localStorage.removeItem('player')
    },
    playerid_success (state, data) {
      state.player = data
      localStorage.setItem('player', JSON.stringify(data))
    },
    playerid_error (state) {
      state.status = 'error'
      localStorage.removeItem('player')
    }
  },
  getters: {
    nombre (state) {
      return state.userName
    }
  },
  actions: {
    playerId ({ commit }, data) {
      return new Promise((resolve, reject) => {
        const stored = JSON.parse(localStorage.getItem('player'))||{}
        const code = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5)
        var preferences = { 
          code: code,
          flag: '🇷🇪',
          country: '🇷🇪',
          observe: false,
          autoaccept: false,
          strongnotification: false,
          darkmode: false,
          sound: true,
          pieces: 'classic',
          board:'classic'
        }

        if(Object.keys(stored).length && stored.flag){
          if(!stored.observe){
            stored.observe = preferences.observe
          }

          commit('playerid_success', stored)
          resolve(stored)
        } else {
          axios.post('https://ipapi.co/json').then(json => {
            axios.get('/static/json/flags.json').then(flags => {
              if (flags.data[json.data.country_code]) {
                preferences.flag = flags.data[json.data.country_code].emoji
                preferences.country = flags.data[json.data.country_code].name
              }
              commit('playerid_success', preferences)
              resolve(preferences)
            })
          })
        }

        if(preferences.darkmode){
          document.documentElement.classList.add('dark-mode')
        }
      })
    }
  }
})
