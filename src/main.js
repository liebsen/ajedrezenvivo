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
  //debug: true,
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

    window.addEventListener('beforeunload', this.beforeunload)
    window.addEventListener('focus', this.onfocus)
    //window.addEventListener('blur', this.onblur)

    this.player = player
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
    onfocus: function handler(event) {
      if(this.$route.name==='lobby'){
        this.$socket.emit('lobby_join', this.$root.player)
      }
    },
    onblur: function handler(event) {
      this.$socket.emit('lobby_leave', this.$root.player)
    },
    beforeunload: function handler(event) {
      this.$socket.emit('lobby_leave', this.$root.player)
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