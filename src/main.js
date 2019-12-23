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
  created: function() {

    const saved = localStorage.getItem('player')
    var player = { 
      code: generateRandomCode(6), 
      available: true,
      sound: true,
      pieces: 'classic',
      minutes: 10
    }

    if(saved){
      player = JSON.parse(saved)
    } else {
      localStorage.setItem('player',JSON.stringify(player))
    }

    this.player = player

    this.$socket.emit('preferences',{
      nick:this.$root.player.code,
      oldnick:this.$root.code
    })

    this.documentTitle = document.title 
    this.loading = false
  },
  sockets: {
    nick: function (data) {
      if(this.$root.code === data.oldnick){
        if(data.exists){
          snackbar('error','El nick ' + data.nick + ' ya está en uso, por favor elegí otro')
          this.$router.push('/preferences')
        } else {
          this.$socket.emit('lobby_join', this.$root.player)
        }
      }
    },
    play: function(data) {
      if(data.asker === this.$root.player.code){
        swal.close()
        this.$router.push(['/play',data.id].join('/'))
      }
    },
    reject: function(data) {
      if(data.asker === this.$root.player.code){
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
      this.$root.players = data
    },
    invite: function(data) {
      var t = this
      if(data.player === this.$root.player.code){
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
            axios.post( this.$root.endpoint + '/create', {
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
  data:{
    endpoint:endpoint,
  	loading:true,
    player:{},
    players: [],
    documentTitle:null,
    code:generateRandomCode(6)
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
  render: h => h(App)
})