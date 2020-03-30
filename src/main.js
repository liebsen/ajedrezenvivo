import Vue from 'vue'
import store from 'store'
import VueSocketIO from 'vue-socket.io'
import axios from 'axios'
import swal from 'sweetalert'
import moment from 'moment'
import App from './App.vue'
import router from './router'
import Chess from 'chess.js'
import Chessboard from '../static/js/chessboard'
import snackbar from './components/Snackbar';
import playSound from './components/playSound'
import '../static/js/fontawesome_all.js'

require('../static/css/main.scss')
require('../static/css/chessboard.scss')

Vue.use(new VueSocketIO({
  debug: process.env.NODE_ENV!=='production',
  connection: process.env.ENDPOINT
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
        if(!this.player.observe) {
          this.$socket.emit('lobby_join', this.player)
        }   
        this.$socket.emit('match_end', from.params.game)
      }
      if(to.name === 'play'){
        this.$socket.emit('lobby_leave', this.player) 
      }
    },
    onLine(status) {
      if(status){
        snackbar('success','Se restauró la conexión a internet.')
      } else {
        snackbar('error','No hay conexión a internet. Por favor revise la configuración de la red.')
      }
    }
  },
  created () {
    const stored = JSON.parse(localStorage.getItem('player'))||{}
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

    if(Object.keys(stored).length && stored.flag){
      if(!stored.observe){
        stored.observe = preferences.observe
      }

      preferences = stored
      this.player = preferences
      this.$socket.emit('preferences', preferences)
    } else {
      axios.post('https://ipapi.co/json').then(json => {
        axios.get('/static/json/flags.json').then(flags => {
          let flag = {
            emoji: null
          }

          if (flags.data[json.data.country_code]) {
            flag = flags.data[json.data.country_code]
          }

          preferences.flag = flag
          this.player = preferences
          this.$socket.emit('preferences', preferences)
          localStorage.setItem('player',JSON.stringify(preferences))
        })
      })
    }

    if(preferences.darkmode){
      document.documentElement.classList.add('dark-mode')
    }
    
    this.documentTitle = document.title 

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

    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    this.$socket.emit('lobby_join', this.player)
    this.loading = false
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  sockets: {
    lobby_chat: function(data){
      const chatbox = document.querySelector(".lobby_chat")
      if(chatbox){
        const owned = this.$root.player.code === data.sender
        const sender = owned || data.sender === 'chatbot' ? '' : data.sender
        let cls = owned ? 'is-pulled-right has-text-right has-background-info has-text-white ' : 'is-pulled-left has-text-left '
        cls+= data.sender === 'chatbot' ? 'has-text-grey' : 'has-text-white has-background-info'
        const ts = moment().format('hh:mm a')
        chatbox.innerHTML+= `<div class="box ${cls}"><strong class="has-text-white">${sender}</strong> ${data.line} <span class="is-size-7">${ts}</span></div>`
        chatbox.scrollTop = chatbox.scrollHeight
        if(data.sender != this.$root.player.code){
          playSound('button-pressed.ogg')
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
        const message = 'Hay ' + (available - 1) +  ' jugador' + (available > 2 ? 'es' : '') + ' esperando invitación '
        document.title = '(' + (available - 1) + ') ' + this.documentTitle
        if(this.$route.name === 'lobby'){
          snackbar('default', message)
        }
        this.$socket.emit('lobby_chat', { 
          sender: 'chatbot',
          line: message
        })
      } else {
        this.$socket.emit('lobby_chat', { 
          sender: 'chatbot',
          line: `No hay jugadores en este momento`
        })
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
          this.player = data
          // document.querySelector('.menu-primary .icon').innerHTML = '<span v-if="$root.player.observe" class="fas fa-user' + (this.player.observe ? '-astronaut' : '-circle') +'"></span>'
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
      if(data.asker.code === this.player.code){
        swal.close()
        swal("Partida declinada", data.player.code + ' declinó tu invitación')
        playSound('defeat.mp3')
      }
    },
    invite: function(data) {
      var t = this
      if(data.player.code === this.player.code){
        if(this.player.autoaccept){
          axios.post( this.endpoint + '/create', {
            white: data.white.code,
            black: data.black.code,
            whiteflag: data.white.flag,
            blackflag: data.black.flag,
            minutes: data.minutes,
            compensation: data.compensation
          }).then((response) => {
            if(response.data.status === 'success'){
              t.$socket.emit('play', {
                asker: data.asker.code,
                player: data.player.code,
                id: response.data.id
              })
              t.$router.push(['/play',response.data.id].join('/'))
            } else {
              snackbar('danger','El juego no pudo ser creado.')
            }        
          })
        } else {
          playSound('victory.mp3')
          const template = (`
  <div class="content">
  <h4>
    <span class="icon">
      <span class="fas fa-user"></span>
    </span> 
    <span>${data.asker.code}</span>
  </h4>
  <h4>
    <span class="icon">
      <span class="fas fa-stopwatch"></span>
    </span>
    <span> ${data.minutes}' + ${data.compensation}</span>
  </h4>
  </div>`);
          swal({
            title: "¿Aceptás esta partida?",
            content: {
              element: 'div',
              attributes: {
                innerHTML: `${template}`,
              }
            },
            buttons: ["Declinar", "Aceptar"],
            closeOnClickOutside: false
          })
          .then(accept => {
            if (accept) {
              axios.post( this.endpoint + '/create', {
                white: data.white.code,
                whiteflag: data.white.flag,
                black: data.black.code,
                blackflag: data.black.flag,
                minutes: data.minutes,
                compensation: data.compensation,
              }).then((response) => {
                if(response.data.status === 'success'){
                  t.$socket.emit('play', {
                    asker: data.asker.code,
                    player: data.player.code,
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
          offset+= 64
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
    },
    gameStart: function(data){
      var t = this
      return new Promise(function(resolve,reject){

        var pos = 'start'
        var pieces = '/static/img/chesspieces/classic/{piece}.png'

        if(data.fen){
          pos = data.fen
        }

        if(t.player.pieces){
          pieces = '/static/img/chesspieces/' + t.player.pieces + '/{piece}.png'
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
    colorize: function(str) {
      for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
      color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
      return '#' + Array(6 - color.length + 1).join('0') + color;
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
          var message = 'Esta partida finalizó en tablas'
          if(game.in_stalemate()){
            message = 'Esta partida finalizó en tablas por rey ahogado'
          } else if(game.in_threefold_repetition()){
            message = 'Esta partida finalizó en tablas por triple repetición'
          }
          document.querySelector('.board-container.b' + id + ' .match-status').innerHTML = message
        } else {          
          const winner = game.turn() === 'w' ? data.black : data.white
          document.querySelector('.board-container.b' + id + ' .match-status').innerHTML = winner + ' ganó esta partida'
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
          sound = 'check.ogg'
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
    endpoint: process.env.ENDPOINT,
    onLine: navigator.onLine,
    loading: true,
    saving: false,
    processing: false,
    player: {},
    players: [],
    matches: [],
    games: [],
    boards: [],
    documentTitle: null,
    boardColor: null,
    code: generateRandomCode(6)
  },
  render: h => h(App)
})

