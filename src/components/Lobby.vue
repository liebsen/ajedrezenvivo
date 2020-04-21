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
      <div class="columns" v-if="players">
        <div class="column is-lobby-list is-3" :class="{ 'no-players': players.length < 2 }">
          <div v-if="players.length > 1">
            <div v-for="plyer in players" class="field">
              <a v-if="!plyer.observe && plyer.code != player.code" @click="play(plyer)" :title="'Invitar a ' + plyer.code">
                <span class="button is-text is-rounded is-grey">
                  <span class="icon">
                    <span v-html="plyer.flag"></span>
                  </span>
                  <span v-html="plyer.code"></span>
                </span>
              </a>
            </div>
            <div v-for="plyer in players" class="field">
              <a v-if="plyer.observe && plyer.code != player.code" @click="clickObserve(plyer.code)" title="Modo observador">
                <span class="button is-text is-rounded is-grey">
                  <span class="icon">
                    <span v-html="plyer.flag"></span>
                  </span>
                  <span v-html="plyer.code"></span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="column has-text-centered box is-padded">
            <div class="columns">
              <div class="column chatbox has-text-left lobby_chat"></div>
            </div>
            <form v-show="players.length > 1" @submit.prevent="sendChat">
              <div class="field is-fullwidth has-addons has-addons-fullwidth is-marginless">
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
  import axios from 'axios'
  import { mapState } from 'vuex'
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
        'player',
        'players'
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
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-clock"></span>
        </span>
        <span>Rondas</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons rounds" title="Nro. partidas de este match">
          <button class="button is-toggle is-rounded has-background-success" title="Match a 1 partida">1</button>
          <button class="button is-toggle" title="Match a 3 partidas">3</button>
          <button class="button is-toggle" title="Match a 5 partidas al match">5</button>
          <button class="button is-toggle" title="Match a 10 partidas">10</button>
          <button class="button is-toggle is-rounded" title="Match a 16 partidas">16</button>
        </div>
      </div>

      <span class="playercolor"><span class="has-background-success is-random-pieces"></span></span>

      <!--div class="control" title="Selecciona el color de tus piezas">
        <div class="buttons levels has-addons playercolor preservefilter">
          <button class="button is-toggle is-large is-rounded has-background-success is-white-pieces" title="Jugar con blancas">
          </button>
          <button class="button is-toggle is-large is-random-pieces" title="Que vaya a sorteo">
          </button>
          <button class="button is-toggle is-large is-rounded is-black-pieces" title="Jugar con negras">
          </button>
        </div>
      </div-->
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
        <div class="buttons levels has-addons gameclock" title="Establece la duración de la partida en minutos">
          <button class="button is-toggle is-rounded has-background-success" title="Agregar 3 minutos a la partida">3'</button>
          <button class="button is-toggle" title="Agregar 5 minutos a la partida">5'</button>
          <button class="button is-toggle" title="Agregar 10 minutos a la partida">10'</button>
          <button class="button is-toggle is-rounded" title="Agregar 30 minutos a la partida">30'</button>
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
          <button class="button is-toggle is-rounded" title="Jugar sin compensación por movimiento">+0</button>
          <button class="button is-toggle" title="Agregar 1 segundo de compensación por cada movimiento">+1</button>
          <button class="button is-toggle has-background-success" title="Agregar 2 segundos de compensación por cada movimiento">+2</button>
          <button class="button is-toggle is-rounded" title="Agregar 3 segundos de compensación por cada movimiento">+3</button>
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
            var playercolor = document.querySelector('.playercolor > .has-background-success')
            var gameclock = document.querySelector('.gameclock > .has-background-success')
            var roundsCont = document.querySelector('.rounds > .has-background-success')
            var gamecompensation = document.querySelector('.gamecompensation > .has-background-success')
            var white = this.player
            var black = player
            var minutes = parseInt(gameclock.textContent)
            var rounds = parseInt(roundsCont.textContent)
            var compensation = parseInt(gamecompensation.textContent)

            if(playercolor.classList.contains('is-black-pieces')){
              white = player
              black = this.player
            } 

            if(playercolor.classList.contains('is-random-pieces')){
              const coin = Math.floor(Math.random() * 1)
              if(coin){
                white = player
                black = this.player
              } else {
                white = this.player
                black = player
              }
            }

            swal({
              title: "Esperando confirmación...",
              text: player.code + ' debe responder la solicitud',
              buttons: false
            })

            let game = {
              asker: this.player,
              player: player,
              white: white,
              black: black,
              minutes: minutes,
              rounds: rounds,
              round: 1,
              compensation: compensation
            }

            this.$socket.emit('invite', game)
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