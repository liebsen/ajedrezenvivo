import Vue from 'vue'
import store from './store'
import router from './router'
import VueSocketIO from 'vue-socket.io'
import axios from 'axios'
import swal from 'sweetalert'
import moment from 'moment'
import App from './App.vue'
import Chess from 'chess.js'
import Chessboard from '../static/js/chessboard'
import snackbar from './components/Snackbar';
import playSound from './components/playSound'
import { mapState } from 'vuex'
import '../static/js/fontawesome_all.js'

axios.defaults.baseURL = store.state.endpoint

require('../static/css/main.scss')
require('../static/css/chessboard.scss')

moment.locale('es')

Vue.use(new VueSocketIO({
  debug: process.env.NODE_ENV==='development',
  connection: process.env.ENDPOINT
}))

new Vue({
  el: '#app',
  router,
  store,
  watch: {
    onLine(status) {
      if(status){
        snackbar('success','Se restauró la conexión a internet.')
      } else {
        snackbar('error','No hay conexión a internet. Por favor revise la configuración de la red.')
      }
    }
  },
  computed: {
    ...mapState([
      'player',
      'players'
    ])
  },
  created () {
    this.documentTitle = document.title 

    document.querySelector('body').addEventListener('click', function (event) {
      var target = event.target
      if (target.classList.contains('is-toggle')) {
        target.parentNode.childNodes.forEach((item) => {
          if (item.classList && item.classList.contains('is-toggle')) {
            item.classList.remove('has-background-success')
          }
        })
        target.classList.add('has-background-success')
      }
    })
          
    document.addEventListener('DOMContentLoaded', () => {
      var tosAgree = function(target){
        localStorage.setItem("tosagree",true)
        document.querySelector('.tosprompt').classList.remove('slideIn')
        document.querySelector('.tosprompt').classList.add('fadeOut')      
        setTimeout(() => {
          document.querySelector('.tosprompt').style.display = 'none';
        },1000)
      }

      document.querySelectorAll('.menu-burger, .menu-items').forEach(function(item) {
        item.addEventListener("click", function() {
          if(document.querySelector('.menu').classList.contains('fs')){
            document.querySelector('.menu').classList.remove('fs')
            document.querySelector('.menu-burger').classList.remove('cross')
          } else {
            document.querySelector('.menu').classList.add('fs')
            document.querySelector('.menu-burger').classList.add('cross')
          }
        },false)
      })

      document.querySelectorAll('.hidden-loading').forEach((item) => {
        item.classList.remove('hidden-loading')
      })

      if(!localStorage.getItem("tosagree")){
        document.querySelector('.tosprompt').classList.add('slideIn')
      } else {
        document.querySelector('.tosprompt').style.display = 'none';
      }
    })

    window.addEventListener('click', event => {
      // ensure we use the link, in case the click has been received by a subelement
      let { target } = event
      while (target && target.tagName !== 'A') target = target.parentNode
      // handle only links that do not reference external resources
      if (target && target.matches("a:not([href*='://'])") && target.href) {
        // some sanity checks taken from vue-router:
        // https://github.com/vuejs/vue-router/blob/dev/src/components/link.js#L106
        const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } = event
        // don't handle with control keys
        if (metaKey || altKey || ctrlKey || shiftKey) return
        // don't handle when preventDefault called
        if (defaultPrevented) return
        // don't handle right clicks
        if (button !== undefined && button !== 0) return
        // don't handle if `target="_blank"`
        if (target && target.getAttribute) {
          const linkTarget = target.getAttribute('target')
          if (/\b_blank\b/i.test(linkTarget)) return
        }
        // don't handle same page links/anchors
        const url = new URL(target.href)
        const to = url.pathname
        if (window.location.pathname !== to && event.preventDefault) {
          event.preventDefault()
          this.$router.push(to)
        }
      }
    })

    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.loading = false
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  sockets: {
    opponent_not_found () {
      this.isFindingOpponent = false
      snackbar('default', `No se encontraron oponentes`)
    },
    game_spawn (data) {
      this.isFindingOpponent = false
      let match = {
        match: data.match,
        group: data.group
      }
      localStorage.setItem('match', JSON.stringify(match))
      this.$router.push(`/play/${data.game}`)
    }
  },
  methods: {
    play () {
      this.isFindingOpponent = true
      let group = 'landing'
      if (this.$route.name === 'group') {
        group = this.$route.params.group
      }
      console.log('group: ' + group)
      this.$socket.emit('find_opponent', {
        player: this.player,
        group: group
      })
    },
    createGroup () {
      const template = (`
<div class="content">
<div class="columns columns-bottom is-flex has-text-centered">
  <div class="column">
    <h4>
      <span class="icon">
        <span class="fas fa-retweet"></span>
      </span>
      <span>Rondas</span>
    </h4>
    <div class="control has-text-centered column">
      <div class="buttons levels has-addons groupgames" title="Nro. partidas de este match">
        <button class="button is-toggle is-rounded has-background-success" title="Match a 1 partida">1</button>
        <button class="button is-toggle" title="Match a 3 partidas">3</button>
        <button class="button is-toggle" title="Match a 5 partidas al match">5</button>
        <button class="button is-toggle" title="Match a 10 partidas">10</button>
        <button class="button is-toggle is-rounded" title="Match a 16 partidas">16</button>
      </div>
    </div>
  </div>
</div>
<div class="columns is-flex has-text-centered">
  <div class="column">
    <h4>
      <span class="icon">
        <span class="fas fa-clock"></span>
      </span>
      <span>Minutos</span>
    </h4>
    <div class="control has-text-centered column">
      <div class="buttons levels has-addons gameclock" title="Establece la duración de las partidas en minutos">
        <button class="button is-toggle is-rounded has-background-success" title="Partidas de 3 minutos">3'</button>
        <button class="button is-toggle" title="Partidas de 5 minutos">5'</button>
        <button class="button is-toggle" title="Partidas de 10 minutos">10'</button>
        <button class="button is-toggle is-rounded" title="Partidas de 30 minutos">30'</button>
      </div>
    </div>
  </div>
</div>
<div class="columns is-flex has-text-centered">
  <div class="column">
    <h4>
      <span class="icon">
        <span class="fas fa-stopwatch"></span>
      </span>
      <span>Compensación en segundos</span>
    </h4>
    <div class="control has-text-centered column">
      <div class="buttons levels has-addons gamecompensation" title="Agregar compensación por movimiento">
        <button class="button is-toggle is-rounded" title="Partidas sin compensación por movimiento">+0</button>
        <button class="button is-toggle" title="Partidas con 1 segundo de compensación por cada movimiento">+1</button>
        <button class="button is-toggle has-background-success" title="Partidas con 2 segundos de compensación por cada movimiento">+2</button>
        <button class="button is-toggle is-rounded" title="Partidas con 3 segundos de compensación por cada movimiento">+3</button>
      </div>
    </div>
  </div>
</div>

</div>`);
      swal({
        title: 'Crear un grupo',
        buttons: ["Cancelar", "Crear"],
        closeOnClickOutside: false,
        content: {
          element: 'div',
          attributes: {
            innerHTML: `${template}`,
          }
        }
      }).then(accept => {
        if (accept) {
          this.isCreatingGroup = true
          var gameclock = document.querySelector('.gameclock > .has-background-success')
          var groupgames = document.querySelector('.groupgames > .has-background-success')
          var gamecompensation = document.querySelector('.gamecompensation > .has-background-success')
          var minutes = parseInt(gameclock.textContent)
          var games = parseInt(groupgames.textContent)
          var compensation = parseInt(gamecompensation.textContent)

          swal({
            title: "Creando grupo",
            text: 'Tu grupo se está creando...',
            buttons: false
          })

          const code = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5)
          setTimeout(() => {
            let group = {
              code: code,
              owner: this.player,
              minutes: minutes,
              games: games,
              compensation: compensation
            }

            axios.post('/group/create', group).then(res => {
              this.isCreatingGroup = false
              this.isLoading = false
              swal.close()
              if (res.data.status === 'success') {
                snackbar('success', `Grupo creado`)
                this.$router.push('/group/' + res.data.data._id)
              } else {
                snackbar('error', `Algo pasó y no se pudo crear el grupo`)
              }
            })
          }, 1000)
        }
      })
    },
    getTimeDisplay: function(time){
      var min = parseInt(time / 60, 10)
      var sec = parseInt(time % 60, 10)

      min = min < 10 ? "0" + min : min
      sec = sec < 10 ? "0" + sec : sec

      return min + ":" + sec
    },
    countMoves: (pgn) => {
      if(pgn && pgn.indexOf('.')){
        return pgn.split('.').length
      }
    },
    msToTime(duration){
      duration = duration * 1000
      var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

      //hours = (hours < 10) ? "0" + hours : hours;
      //minutes = (minutes < 10) ? "0" + minutes : minutes;
      seconds = (seconds < 10) ? "0" + seconds : seconds;

      //return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
      if(minutes){
        return minutes + "m" + seconds + "s";
      } else {
        return seconds + "s";
      }
      },
    checkBoardStyle (val) {
      document.querySelector('body').classList.remove('is3d')
      document.querySelector('body').classList.remove('magi3d')
      if (val.indexOf('jade3d') > -1) {
        document.querySelector('body').classList.add('jade3d')
      } else if (val.indexOf('magi3d') > -1) {
        document.querySelector('body').classList.add('magi3d')
      } else {
        if (val.indexOf('3d') > -1) {
          document.querySelector('body').classList.add('is3d')
        }
      }
    },
    getLocale () {
      return new Promise((reject, resolve) => {
        if (this.player.locale) {
          resolve(this.player.locale)
        }
        return axios.post('http://ip-api.com/json').then(res => {
          resolve(res)
        })
      })
    },
    fullscreen() {
      var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

      var docElm = document.documentElement;
      if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    },
    fullscreenBoard: function(){
      if(document.querySelector('.board') && document.body.clientHeight < document.body.clientWidth && document.body.clientWidth > 768){
        var offset = 0
        if(!document.querySelector('.menu-logo').classList.contains('is-hidden')) {
          offset+= 70
        }
        document.querySelector('.board').style.width = document.body.clientHeight - document.querySelector('.menu').clientHeight - offset + 'px'
      }
    },
    goFS: function(){
      if(document.querySelector('.menu-logo').classList.contains('is-hidden')){
        document.querySelector('.menu-logo').classList.remove('is-hidden')
        document.querySelector('.menu-primary').classList.remove('is-hidden')
        document.querySelector('body').classList.remove('fs')
      } else {
        document.querySelector('.menu-logo').classList.add('is-hidden')
        document.querySelector('.menu-primary').classList.add('is-hidden')
        document.querySelector('body').classList.add('fs')
      }
      setTimeout(() => {
        this.fullscreenBoard()
        this.fullscreen();
      },750)      
    },
    updateOnlineStatus(e) {
      const {
        type
      } = e;
      this.onLine = type === 'online';
    }
  },
  data () {
    return {
      isFindingOpponent: false,
      isCreatingGroup: false,
      endpoint: process.env.ENDPOINT,
      onLine: navigator.onLine,
      loading: true,
      saving: false,
      processing: false,
      matches: [],
      games: [],
      boards: [],
      chatlast: null,
      documentTitle: null,
      boardColor: null
    }
  },
  render: h => h(App)
})

