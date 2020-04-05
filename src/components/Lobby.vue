<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn">
      <div class="live-games" v-show="$root.matches.length">
        <h6>
          <span class="icon">
            <span class="fa fa-chess"></span>
          </span>
          <span>Jugando ahora</span>
        </h6>
        <div class="columns is-multiline">
          <div v-for="match in $root.matches" class="column is-3">
            <div :class="'board-container b' + match.id">
              <div :class="$root.boardColor">
                <h6 class="has-text-left black is-clickable" @click="$root.gameFlip(match.id)">
                  <span class="button is-small" :class="{ 'has-background-grey has-text-white' : match.btime > 10, 'has-background-info has-text-white' : match.btime <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span v-html="$root.getTimeDisplay(match.btime)"></span>
                  </span>
                  <span class="button is-small is-text">
                    <span v-html="match.black"></span>
                    <span v-show="match.result==='0-1'" class="icon">
                      <span class="fa fa-trophy is-size-7 has-text-warning"></span>
                    </span>
                  </span>
                </h6>
                <router-link :to="'/watch/' + match.id">
                  <div class="board preservefilter">
                    <div :id="'board' + match.id"></div>
                  </div> 
                </router-link>
                <h6 class="has-text-right white is-clickable" @click="$root.gameFlip">
                  <span class="button is-small is-text">
                    <span v-show="match.result==='1-0'" class="icon">
                      <span class="fa fa-trophy is-size-7 has-text-warning"></span>
                    </span>
                    <span v-html="match.white"></span>
                  </span>
                  <span class="button is-small" :class="{ 'has-background-white has-text-black' : match.wtime > 10, 'has-background-info has-text-white' : match.wtime <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span v-html="$root.getTimeDisplay(match.wtime)"></span>
                  </span>
                </h6>
              </div>
              <div class="match-status has-text-info"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-lobby-list is-3" :class="{ 'no-players': players.length < 2 }">
          <div v-if="players.length > 1">
            <div v-for="player in players" class="field">
              <a v-if="!player.observe && player.code != player.code" @click="play(player)" :title="'Invitar a ' + player.code">
                <span class="button is-text is-rounded is-info">
                  <span class="icon">
                    <span v-html="player.flag"></span>
                  </span>
                  <span v-html="player.code"></span>
                </span>
              </a>
            </div>
            <div v-for="player in players" class="field">
              <a v-if="player.observe && player.code != player.code" @click="clickObserve(player.code)" title="Modo observador">
                <span class="button is-text is-rounded is-grey">
                  <span class="icon">
                    <span v-html="player.flag"></span>
                  </span>
                  <span v-html="player.code"></span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="column has-text-centered box">
            <div class="columns">
              <div class="column chatbox has-text-left lobby_chat"></div>
            </div>
            <form v-show="players.length > 1" @submit.prevent="sendChat">
              <div class="field is-fullwidth has-addons has-addons-fullwidth">
                <div class="control">
                  <input class="input is-rounded" v-model="chat" type="text" placeholder="Ingresa tu mensaje" />
                </div>
                <div class="control">
                  <button type="submit" class="button is-info is-rounded">
                    <span class="icon">
                      <span class="fas fa-arrow-up"></span>
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>        
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import axios from 'axios'
  import snackbar from '../components/Snackbar'
  import swal from 'sweetalert'
  import playSound from '../components/playSound'
  export default {
    name: 'lobby',
    data () {
      return {
        chat:''
      }
    },
    computed: {
      ...mapState([
        'player'
      ])
    },
    mounted () {
      setTimeout(() => {
        this.welcomeMsg()
      }, 3000)
    },
    methods: {
      welcomeMsg () {
        let message = `🤝 Saludos ${this.player.code} que nos visita desde ${this.player.country} ${this.player.flag}` + (this.player.observe ? ` Estas en modo observador.` : ` Antes de jugar podés `) +  `<a href="/preferences" class="has-text-success">establecer preferencias</a>`
        this.$socket.emit('lobby_chat', { 
          sender: 'chatbot',
          line: message
        })
      },
      sendChat: function() {
        if(this.chat.trim()==='') this.chat = '🤝'
        this.$socket.emit('lobby_chat', { 
          sender: this.player.code,
          line: this.chat
        })
        this.chat = ''
      },
      clickObserve: function(data) { 
        if(data === this.player.code){
          snackbar('error','No podés jugar contra vos mismo')   
        } else {
          snackbar('default', data + ' Está en modo Observador y no acepta invitaciones') 
        }        
      },
      play: function(player) {
        if (player.code === this.player.code) {
          return snackbar('error','No podés jugar contra vos mismo') 
        }

        var t = this
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <div class="control">
        <div class="buttons levels has-addons playercolor preservefilter">
          <button class="button is-toggle is-large is-rounded has-background-warning is-white-pieces">
          </button>
          <button class="button is-toggle is-large is-random-pieces">
          </button>
          <button class="button is-toggle is-large is-rounded is-black-pieces">
          </button>
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
        <div class="buttons levels has-addons gameclock">
          <button class="button is-toggle is-rounded has-background-warning">3'</button>
          <button class="button is-toggle">5'</button>
          <button class="button is-toggle">10'</button>
          <button class="button is-toggle is-rounded">30'</button>
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
        <div class="buttons levels has-addons gamecompensation">
          <button class="button is-toggle is-rounded">+0</button>
          <button class="button is-toggle">+1</button>
          <button class="button is-toggle has-background-warning">+2</button>
          <button class="button is-toggle is-rounded">+3</button>
        </div>
      </div>
    </div>
  </div>

</div>`);
        swal({
          title: 'Invitar a ' + player.code,
          buttons: ["Cancelar", "Invitar"],
          closeOnClickOutside: false,
          content: {
            element: 'div',
            attributes: {
              innerHTML: `${template}`,
            }
          }
        }).then(accept => {
          if (accept) {

            var playercolor = document.querySelector('.playercolor > .has-background-warning')
            var gameclock = document.querySelector('.gameclock > .has-background-warning')
            var gamecompensation = document.querySelector('.gamecompensation > .has-background-warning')
            var white = t.player
            var black = player
            var minutes = parseInt(gameclock.textContent)
            var compensation = parseInt(gamecompensation.textContent)

            if(playercolor.classList.contains('is-black-pieces')){
              white = player
              black = t.player
            } 

            if(playercolor.classList.contains('is-random-pieces')){
              const coin = Math.floor(Math.random() * 1)
              if(coin){
                white = player
                black = t.player
              } else {
                white = t.player
                black = player
              }
            }

            swal({
              title: "Esperando confirmación...",
              text: player.code + ' debe responder la solicitud',
              buttons: false
            })

            t.$socket.emit('invite', {
              asker: t.player,
              player: player,
              white: white,
              black: black,
              minutes: minutes,
              compensation: compensation
            })
          }
        })

        setTimeout(() => {
          const saved = JSON.parse(localStorage.getItem('player'))
          let pieces = ['.is-white-pieces','.is-black-pieces','.is-random-pieces']
          pieces.forEach(tag => {
            let e = document.querySelector(tag)
            let li = window.getComputedStyle(e);
            e.style.backgroundImage = li.getPropertyValue('background-image').split('classic').join(saved.pieces)
          })
        },10)
      }
    }
  }
</script>