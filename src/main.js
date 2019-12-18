import Vue from 'vue'
import store from 'store'
import App from './App.vue'
import router from './router'
import VueSocketIO from 'vue-socket.io'
import axios from 'axios'
import snackbar from './components/Snackbar';

const endpoint='https://ajedrezenvivoapi.herokuapp.com'

require('../assets/css/main.scss')
require('../assets/css/chessboard.css')

Vue.use(new VueSocketIO({
  debug: true,
  connection: endpoint
}))

const generateRandomCode = (() => {
  const USABLE_CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789".split("");

  return length => {
    return new Array(length).fill(null).map(() => {
      return USABLE_CHARACTERS[Math.floor(Math.random() * USABLE_CHARACTERS.length)];
    }).join("");
  }
})();

new Vue({
  el: '#app',
  router,
  created: function() {

    window.addEventListener('beforeunload', this.beforeunload)
    const saved = localStorage.getItem('player')
    var player = { 
      code: generateRandomCode(6), 
      available: true,
      pieces: 'classic',
      minutes: 10
    }

    if(saved){
      player = JSON.parse(saved)
    } else {
      localStorage.setItem('player',JSON.stringify(player))
    }

    this.player = player
    if(player.available)
    //this.$socket.emit('join', this.player)
    this.loading = false
  },
  data:{
    port:0,
    endpoint:endpoint,
  	loading:true,
  	processing:false,
    player:{},
    code: generateRandomCode(6),
  	message:'',
  	typeMessage:''
  },
  methods: {
    beforeunload: function handler(event) {
      this.$socket.emit('leave', this.player)
    },
  	createGame:({type,target}) => {
      axios.post( endpoint + '/create', {} ).then((res) => {
        if(res.data.status==='success'){
          snackbar('success','Juego creado exitosamente. Por favor espere...',3000)
          setTimeout(() => {
            router.push(['/play',res.data.room,res.data.secret_room].join('/'))
          },3000)
        } else {
          snackbar('danger','El juego no pudo ser creado.')
        }        
      })
  	},
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