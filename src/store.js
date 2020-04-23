import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

let games = JSON.parse(localStorage.getItem('games')) || []

export default new Vuex.Store({
  state: {
    player: null,
    players: null,
    games: games,
    status: null,
    endpoint: process.env.ENDPOINT
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
    player_success (state, data) {
      state.player = data
      localStorage.setItem('player', JSON.stringify(data))
    },
    player_error (state) {
      state.status = 'error'
      localStorage.removeItem('player')
    },
    games_success (state, data) {
      state.games.push(data)
      localStorage.setItem('games', JSON.stringify(state.games))
    },
    games_error (state) {
      state.status = 'error'
      localStorage.removeItem('games')
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
    games ({ commit }, data) {
      if (data) {
        commit('games_success', data)
      } else {
        commit('games_error') 
      }
    },
    player ({ commit }, data) {
      return new Promise((resolve, reject) => {
        const stored = data || JSON.parse(localStorage.getItem('player')) || {}
        if(Object.keys(stored).length && stored.id){
          if(stored.darkmode){
            document.documentElement.classList.add('dark-mode')
          }

          commit('player_success', stored)
          resolve(stored)
        } else {
          const id = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5)
          const code = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5)
          var preferences = {
            id: id,
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
              commit('player_success', preferences)
              resolve(preferences)
            })
          })
        }
      })
    }
  }
})
