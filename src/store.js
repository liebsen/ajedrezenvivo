import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    player: null,
    players: null,
    status: null,
    endpoint: (process.env.NODE_ENV === 'production' ? 'https://ajedrezenvivoapi.herokuapp.com' : 'http://localhost:4000')
  },
  mutations: {
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
    },
    app_success (state, data) {
      state.app = data
      localStorage.setItem('app', JSON.stringify(data))
    },
    app_error (state) {
      state.status = 'error'
      localStorage.removeItem('app')
    },
    players_success (state, data) {
      state.players = data
      localStorage.setItem('players', JSON.stringify(data))
    },
    players_error (state) {
      state.status = 'error'
      localStorage.removeItem('players')
    }
  },
  getters: {
    nombre (state) {
      return state.userName
    }
  },
  actions: {
    players ({ commit }, data) {
      if (data) {
        commit('players_success', data)
      } else {
        commit('players_error')
      }
    },
    playerId ({ commit }, data) {
      return new Promise((resolve, reject) => {
        const stored = JSON.parse(localStorage.getItem('player'))||{}
        if(Object.keys(stored).length && stored.flag){
          if(stored.darkmode){
            document.documentElement.classList.add('dark-mode')
          }

          commit('playerid_success', stored)
          resolve(stored)
        } else {
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

          axios.post('https://ipapi.co/json').then(json => {
            axios.get('/json/flags.json').then(flags => {
              if (flags.data[json.data.country_code]) {
                preferences.flag = flags.data[json.data.country_code].emoji || ''
                preferences.country = flags.data[json.data.country_code].name || ''
              }
              commit('playerid_success', preferences)
              resolve(preferences)
            })
          })
        }
      })
    }
  }
})
