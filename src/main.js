import Vue from 'vue'
import store from 'store'
import VueSocketIO from 'vue-socket.io'
import axios from 'axios'
import swal from 'sweetalert'
import App from './App.vue'
import router from './router'
import Chess from 'chess.js'
import Chessboard from '../assets/js/chessboard'
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
        this.$socket.emit('match_end', from.params.game)
      }
      if(to.name === 'play'){
        this.$socket.emit('lobby_leave', this.player) 
      } else {
        if(!this.player.observe) {
          setTimeout(() => {
            this.$socket.emit('lobby_join', this.player)
          },500)
        }        
      }
    }
  },
  mounted () {
    this.isOnline = window.navigator.onLine
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

    if (this.isOnline) {
      var observe  = this.player.observe
      if(!observe){
        this.$socket.emit('lobby_join', this.player)
      }        
      snackbar('success', (this.player.observe ? "👁️" : "👨") + " Estas conectado" +(this.player.observe ? ' en modo Observador' : ' y disponible para jugar'))
    } else {
      snackbar('error',"📶 Te desconectaste. Verifica tu conexión a internet ")
    }
  },
  created: function() {
    const savedd = localStorage.getItem('player')
    const saved = JSON.parse(savedd)

    var preferences = { 
      code: generateRandomCode(6), 
      observe: false,
      autoaccept: false,
      strongnotification: false,
      darkmode: false,
      sound: true,
      pieces: 'classic',
      board:'classic'
    }

    if(saved){
      if(!saved.observe){
        saved.observe = preferences.observe
      }
      preferences = saved
    } else {
      localStorage.setItem('player',JSON.stringify(preferences))
    }

    if(preferences.darkmode){
      document.documentElement.classList.add('dark-mode')
    }
    
    this.player = preferences
    this.$socket.emit('preferences', preferences)
    this.documentTitle = document.title 
    this.loading = false
  },
  sockets: {
    lobby_chat: function(data){
      const chatbox = document.querySelector(".lobby_chat")
      if(chatbox){
        const owned = this.$root.player.code === data.sender
        const cls = owned ? 'is-pulled-right has-text-right has-background-info has-text-white' : 'is-pulled-left has-text-left'
        const sender = data.sender === this.$root.player.code ? '' : data.sender
        chatbox.innerHTML+= `<div class="box ${cls}"><strong class="has-text-info">${sender}</strong> ${data.line}</div>`
        chatbox.scrollTop = chatbox.scrollHeight
        if(data.sender != this.$root.player.code){
          playSound('chat.ogg')
        }
      }
    },
    players: function (data) {
      if(this.$route.name === 'play') return
      var available = 0
      for(var i in data){
        if(!data[i].observe){
          available++
        }
      }
      if(available > 1){
        document.title = '(' + (available - 1) + ') ' + this.documentTitle
        if(this.$route.name === 'lobby'){
          snackbar('default','Hay ' + (available - 1) +  ' jugador' + (available > 2 ? 'es' : '') + ' esperando invitación ')
          playSound('pop.mp3')
        }
      } else {
        //snackbar('default','No hay jugadores en este momento')       
        document.title = this.documentTitle
      }        
      this.players = JSON.parse(JSON.stringify(data))
    },
    player: function (data) {
      if(data.ref === this.player.code){
        if(data.exists){
          snackbar('error','El nombre ' + data.code + ' ya está en uso, por favor elige otro')
          this.$router.push('/preferences')
        } else {
          if(data.available){
            this.$socket.emit('lobby_join', data)
          }        
          this.player = data
          document.querySelector('.menu-primary .icon').innerHTML = '<span v-if="$root.player.observe" class="fas fa-user' + (this.player.observe ? '-astronaut' : '-circle') +'"></span>'
          localStorage.setItem('player',JSON.stringify(data))
          snackbar('success','Tus preferencias fueron actualizadas correctamente.')
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
          playSound('pop.mp3')
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
    },
    matches_live: function(data){
      this.matches = data
      var gamesContainer = document.querySelector('.live-games')
      if(gamesContainer){
        for(var i in data){
          if(!this.games[data[i].id]){
            this.gameStart(data[i])
          }
        }
      }
    },
    match_live: function(data){
      var t = this
      var gamesContainer = document.querySelector('.live-games')
      if(gamesContainer){
        var exists = false 
        for(var i in t.matches){
          if(t.matches[i].id === data.id){
            exists = true
          }
        }

        if(exists === false){
          t.matches.push(data)
        }

        setTimeout(() => {
          t.gameMove(data)  
        },500)        
      }
    }
  },
  methods: {
    gameStart: function(data){
      var t = this
      return new Promise(function(resolve,reject){

        var pos = 'start'
        var pieces = '/assets/img/chesspieces/classic/{piece}.png'

        if(data.fen){
          pos = data.fen
        }

        if(t.player.pieces){
          pieces = '/assets/img/chesspieces/' + t.player.pieces + '/{piece}.png'
          t.boardColor = t.player.board
        }

        var cfg = {
          draggable: false,
          position: pos,
          pieceTheme:pieces
        }

        setTimeout(() => {
          t.games[data.id] = new Chess
          t.boards[data.id] = new Chessboard('board' + data.id,cfg)

          if(data.pgn){
            t.games[data.id].load_pgn(data.pgn)
          }
          resolve()
        },500)        
      })
    },
    gameMove: function(data){
      var t = this
      if(!t.games[data.id]){
        t.gameStart(data).then(() => {
          t.makeMove(data)
        })        
      } else {
        t.makeMove(data)
      }
    },
    makeMove: function(data){
      var t = this
      setTimeout(() => {
        var moveObj = ({
          from: data.from,
          to: data.to,
          promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
        // see if the move is legal
        var move = t.games[data.id].move(moveObj)

        if (move === null) {
          return 'snapback'
        }

        for(var i in t.matches){
          if(t.matches[i].id === data.id){
            t.matches[i].wtime = data.wtime
            t.matches[i].btime = data.btime
          }
        }

        t.boards[data.id].position(data.fen)
        t.updateMoves(data.id,move)
      },500)
    },
    gameFlip: function(id){
      this.boards[id].flip()
      const white = document.querySelector('.board-container.b' + id + ' .white').innerHTML
      const black = document.querySelector('.board-container.b' + id + ' .black').innerHTML
      document.querySelector('.board-container.b' + id + ' .white').innerHTML = black
      document.querySelector('.board-container.b' + id + ' .black').innerHTML = white
      this.highlightLastMove(id)
    },
    getTimeDisplay: function(time){
      var min = parseInt(time / 60, 10)
      var sec = parseInt(time % 60, 10)

      min = min < 10 ? "0" + min : min
      sec = sec < 10 ? "0" + sec : sec

      return min + ":" + sec
    },
    updateMoves:function(id,move){
      var t = this
      var sound = 'move.mp3'
      var game = t.games[id] 
      var data = {}

      for(var i in t.matches){
        if(t.matches[i].id === id){
          data = t.matches[i]
        }
      }

      if(game.game_over()){
        if(game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
          document.querySelector('.board-container.b' + id + ' .match-status').innerHTML = 'La partida finalizó con un empate'
        } else {          
          const winner = game.turn() === 'w' ? data.black : data.white
          document.querySelector('.board-container.b' + id + ' .match-status').innerHTML = winner + ' ganó la partida'
        }
        
        sound = 'game-end.mp3'
        game.announced_game_over = true
      } else {

        if(move.flags === 'c'){
          sound = 'capture.mp3'        
        }

        if(move.flags === 'k'){
          sound = 'castle.mp3'
        }

        if(move.flags === 'q'){
          sound = 'castle.mp3'
        }

        if (game.in_check() === true) {
          sound = 'check.mp3'
        }

        t.removeHighlight(id)
        t.addHightlight(id,move)
        //playSound(sound)
      }
    },
    removeHighlight : function(id) {
      document.getElementById('board' + id).querySelectorAll('.square-55d63').forEach((item) => {
        item.classList.remove('highlight-move')
        item.classList.remove('in-check')
      })
    },
    addHightlight : function(id,move){
      var t = this
      var game = t.games[id]
      t.removeHighlight(id);
      if(move){
        if (game.in_check() === true) {
          document.getElementById('board' + id).querySelector('img[data-piece="' + game.turn() + 'K"]').parentNode.classList.add('in-check')
        }
        setTimeout(function(){
          document.getElementById('board' + id).querySelector('.square-' + move.from).classList.add('highlight-move');
          document.getElementById('board' + id).querySelector('.square-' + move.to).classList.add('highlight-move');   
        },200)
      }
    },
    highlightLastMove: function(id){
      var history = this.games[id].history({verbose:true})
      if(history.length){
        var move = history[history.length-1]
        document.getElementById('board' + id).querySelector('.square-' + move.from).classList.add('highlight-move')
        document.getElementById('board' + id).querySelector('.square-' + move.to).classList.add('highlight-move')
      }
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
    }
  },
  data:{
    endpoint:endpoint,
    isOnline:true,
    loading:true,
    saving:false,
    processing:false,
    player:{},
    players: [],
    matches:[],
    games:[],
    boards:[],
    documentTitle:null,
    boardColor:null,
    code:generateRandomCode(6)
  },
  render: h => h(App)
})

