import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import $ from 'jquery'
import Landing from '../components/Landing'
import Results from '../components/Results'
import Contact from '../components/Contact'
import Donate from '../components/Donate'
import Play from '../components/Play'
import Lobby from '../components/Lobby'
import Live from '../components/Live'
import Preferences from '../components/Preferences'
import Stockfish from '../components/Stockfish'
import Eco from '../components/Eco'
import PlayEco from '../components/PlayEco'
import Game from '../components/Game'
import Watch from '../components/Watch'
import About from '../components/About'
import NotFound from '../components/NotFound'

window.jQuery = $;
window.$ = $;

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/results',
      name: 'results',
      component: Results
    },
    {
      path: '/eco',
      name: 'eco',
      component: Eco
    },
    {
      path: '/eco/:name',
      name: 'playeco',
      component: PlayEco
    },
    {
      path: '/live',
      name: 'live',
      component: Live
    },
    {
      path: '/game/:game',
      name: 'game',
      component: Game
    },
    {
      path: '/play/:game',
      name: 'play',
      component: Play
    },
    {
      path: '/watch/:game',
      name: 'watch',
      component: Watch
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: Preferences
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: Lobby
    },
    {
      path: '/stockfish',
      name: 'stockfish',
      component: Stockfish
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact
    },
    {
      path: '/donate',
      name: 'donate',
      component: Donate
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '*',
      name: 'notfound',
      component: NotFound
    }
  ]  
});

router.beforeEach(async (to, from, next) => {
  await Vue.nextTick()
  if (!store.state.player) {
    store
      .dispatch('player')
      .then(() => {
        console.log('🙌 Datos de la aplicación cargados')
        router.app.$socket.emit('preferences', store.state.player)
        next()        
      }).catch(err => {
        console.log(`Algo malo sucedió ` + err)
      })
  } else {
    next()
  }
})

router.afterEach(function (to, from, next) {
})


export default router