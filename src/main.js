import Vue from 'vue'
import store from 'store'
import VueSocketIO from 'vue-socket.io'
import axios from 'axios'
import swal from 'sweetalert'
import App from './App.vue'
import router from './router'
import snackbar from './components/Snackbar';
import playSound from './components/playSound'

const endpoint='https://ajedrezenvivoapi.herokuapp.com'
//const endpoint='https://ajedrezenvivoapidev.herokuapp.com'

require('../assets/css/main.scss')
require('../assets/css/chessboard.css')

Vue.use(new VueSocketIO({
  //debug: true,
  connection: endpoint
}))

const generateRandomCode = (() => {
  const USABLE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789".split("")

  return length => {
    return new Array(length).fill(null).map(() => {
      return USABLE_CHARACTERS[Math.floor(Math.random() * USABLE_CHARACTERS.length)]
    }).join("")
  }
})()


new Vue({
  el: '#app',
  router,
  watch: {
    '$route' (to, from) {
      if(from.name === 'play'){
        this.$socket.emit('lobby_join', this.player)
      }
      if(to.name === 'play'){
        this.$socket.emit('lobby_leave', this.player) 
      }
    }
  },
  mounted () {
    document.querySelector('body').addEventListener('click', function (event) {
      var target = event.target
      if (target.classList.contains('is-toggle')) {
        target.parentNode.childNodes.forEach((item) => {
          if (item.classList && item.classList.contains('is-toggle')) {
            item.classList.remove('has-background-warning')
          }
        })
        target.classList.add('has-background-warning')
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
  },
  created: function() {
    const saved = localStorage.getItem('player')
    var preferences = { 
      code: generateRandomCode(6), 
      available: true,
      autoaccept: false,
      sound: true,
      pieces: 'classic',
      board:'classic'
    }

    if(saved){
      preferences = JSON.parse(saved)
    } else {
      localStorage.setItem('player',JSON.stringify(preferences))
    }
    this.player = preferences
    this.$socket.emit('preferences', preferences)
    this.documentTitle = document.title 
    this.loading = false
  },
  sockets: {
    player: function (data) {
      if(data.code === this.player.code){
        if(data.exists){
          snackbar('error','El nombre ' + data.code + ' ya está en uso, por favor elige otro')
          this.$router.push('/preferences')
        } else {
          if(data.available){
            this.$socket.emit('lobby_join', data)
          }        
          this.player = data
          localStorage.setItem('player',JSON.stringify(data))
        }
        this.saving = false
      }
    },
    play: function(data) {
      if(data.asker === this.player.code){
        swal.close()
        this.$router.push(['/play',data.id].join('/'))
      }
    },
    reject: function(data) {
      if(data.asker === this.player.code){
        swal.close()
        swal("Partida declinada", '👤 ' + data.player + ' declinó tu invitación')
      }
    },
    players: function (data) {
      if(data.length > 1){
        snackbar('success','Hay ' + (data.length - 1) +  ' jugador' + (data.length > 2 ? 'es' : '') + ' esperando invitación ')
        document.title = '(' + (data.length - 1) + ') ' + this.documentTitle
        var sound = 'chat.mp3'
        playSound(sound)
      } else {
        snackbar('default','No hay jugadores en este momento')       
        document.title = this.documentTitle
      }        
      this.players = data
    },
    invite: function(data) {
      var t = this
      if(data.player === this.player.code){
        if(this.player.autoaccept){
          axios.post( this.endpoint + '/create', {
            white: data.white,
            black: data.black,
            minutes: data.minutes
          }).then((response) => {
            if(response.data.status === 'success'){
              t.$socket.emit('play', {
                asker: data.asker,
                player: data.player,
                id: response.data.id
              })
              t.$router.push(['/play',response.data.id].join('/'))
            } else {
              snackbar('danger','El juego no pudo ser creado.')
            }        
          })
        } else {
          playSound('chat.mp3')
          const template = (`
  <div class="content">
  <h4>
    <span class="icon">
      <span class="fas fa-user"></span>
    </span> 
    <span>${data.asker}</span>
  </h4>
  <h4>
    <span class="icon">
      <span class="fas fa-stopwatch"></span>
      <span> ${data.minutes}'</span>
    </span>
  </h4>
  </div>`);
          swal({
            title: "¿Aceptás la partida?",
            content: {
              element: 'div',
              attributes: {
                innerHTML: `${template}`,
              }
            },
            buttons: ["Declinar", "Aceptar"]
          })
          .then(accept => {
            if (accept) {
              axios.post( this.endpoint + '/create', {
                white: data.white,
                black: data.black,
                minutes: data.minutes
              }).then((response) => {
                if(response.data.status === 'success'){
                  t.$socket.emit('play', {
                    asker: data.asker,
                    player: data.player,
                    id: response.data.id
                  })
                  t.$router.push(['/play',response.data.id].join('/'))
                } else {
                  snackbar('danger','El juego no pudo ser creado.')
                }        
              })
            } else {
              t.$socket.emit('reject', data)
              console.log('Clicked on cancel')
            }
          })
        }
      }
    }
  },
  methods: {
  	countMoves: (pgn) => {
	    if(pgn && pgn.indexOf('.')){
	      return pgn.split('.').length - 1
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
    }
  },
  data:{
    endpoint:endpoint,
    loading:true,
    saving:true,
    player:{},
    players: [],
    documentTitle:null,
    code:generateRandomCode(6)
  },
  render: h => h(App)
})

