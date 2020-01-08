<template>
  <div class="container is-widescreen">
    <div class="content column">
      <!--h3>
        <span class="icon">
          <span class="fas fa-traffic-light"></span> 
        </span>
        <span>Salón</span>
      </h3-->
      <div class="live-games" v-show="$root.matches.length">
        <h6>
          <span class="icon">
            <span class="fa fa-chess-board"></span>
          </span>
          <span>Jugando ahora</span>
        </h6>
        <div class="columns is-multiline">
          <div v-for="match in $root.matches" class="column is-3">
            <div :class="'board-container b' + match.id">
              <div :class="$root.boardColor">
                <h6 class="has-text-left black is-clickable" @click="$root.gameFlip(match.id)">
                  <span v-show="match.result==='0-1'">🏆</span>
                  <span v-html="match.black" class="has-timer"></span>
                  <span class="button is-rounded is-small" v-html="$root.getTimeDisplay(match.btime)" :class="{ 'has-background-grey has-text-white' : match.btime > 10, 'has-background-danger has-text-white' : match.btime <= 10}"></span>
                </h6>
                <router-link :to="'/watch/' + match.id">
                  <div class="board preservefilter">
                    <div class="score-container">
                      <div class="score" :style="'max-height:' + match.vscore + '%'"></div>
                    </div>            
                    <div :id="'board' + match.id"></div>
                  </div> 
                </router-link>
                <h6 class="has-text-right white is-clickable" @click="$root.gameFlip">
                  <span class="button is-rounded is-small" v-html="$root.getTimeDisplay(match.wtime)" :class="{ 'has-background-white has-text-black' : match.wtime > 10, 'has-background-danger has-text-white' : match.wtime <= 10}"></span>
                  <span v-html="match.white" class="has-timer"></span>
                  <span v-show="match.result==='1-0'">🏆</span>
                </h6>
              </div>
              <div class="match-status has-text-info"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column lobby-list is-3">
          <div v-show="$root.players.length">
            <div>
              <div v-for="player in $root.players" class="field">
                <a v-show="!player.observe" @click="play(player.code)" :title="'Invitar a ' + player.code">
                  <span class="button is-text is-rounded is-danger" :class="{ 'is-outlined' : player.code != $root.player.code }">
                    <span class="icon">
                      <span class="fas fa-user"></span>
                    </span>
                    <span v-html="player.code"></span>
                  </span>
                </a>
              </div>
              <div v-for="player in $root.players" v-show="player.observe" class="field">
                <a @click="clickObserve(player.code)" title="Modo observador">
                  <span class="button is-text is-rounded is-grey is-outlined" :class="{ 'is-outlined' : player.code != $root.player.code }">
                    <span class="icon">
                      <span class="fas fa-user-astronaut"></span>
                    </span>
                    <span v-html="player.code"></span>
                  </span>
                </a>
              </div>
            </div>
            <hr>
            <h6>
              <span class="icon">
                <span class="fa fa-share"></span>
              </span>
              <span>Invita a tus amigos</span>
            </h6>
            <div class="columns is-multiline is-mobile is-vcentered fadeIn">
              <div class="column is-hidden-tablet">
                <a :href="'whatsapp://send?text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                  <span class="icon has-text-whatsapp is-size-3">
                    <span class="fab fa-whatsapp"></span>
                  </span>
                </a>
              </div>
              <div class="column is-hidden-mobile">
                <a :href="'https://web.whatsapp.com/send?text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                  <span class="icon has-text-whatsapp is-size-3">
                    <span class="fab fa-whatsapp"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'http://www.facebook.com/sharer.php?u=https://ajedrezenvivo.herokuapp.com/lobby&quote=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                  <span class="icon has-text-facebook is-size-3">
                    <span class="fab fa-facebook"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'https://twitter.com/share?url=https://ajedrezenvivo.herokuapp.com/lobby&amp;text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                  <span class="icon has-text-twitter is-size-3">
                    <span class="fab fa-twitter"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'http://www.linkedin.com/shareArticle?mini=true&url=https://ajedrezenvivo.herokuapp.com/lobby&text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                  <span class="icon has-text-twitter is-size-3">
                    <span class="fab fa-linkedin"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'mailto:?Body=Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby&Subject=¿Querés jugar ajedrez online?'" target="_blank">
                  <span class="icon has-text-primary is-size-3">
                    <span class="fas fa-envelope-square"></span>
                  </span>
                </a>
              </div>
              <div class="column"></div>
              <div class="column"></div>
              <div class="column"></div>
              <div class="column"></div>
              <div class="column"></div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="column has-text-left has-background-light">
            <div class="columns">
              <div class="column chatbox lobby_chat"></div>
            </div>
            <form @submit.prevent="sendChat">
              <div class="field has-addons">
                <div class="control">
                  <input class="input is-rounded" v-model="chat" type="text" placeholder="Ingresa tu mensaje" />
                </div>
                <div class="control">
                  <button type="submit" class="button is-info is-rounded">
                    <span class="icon">
                      <span class="fas fa-paper-plane"></span>
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
  import snackbar from '../components/Snackbar'
  import swal from 'sweetalert'
  import playSound from '../components/playSound'

  export default {
    name: 'lobby',
    mounted: function(){
      this.$socket.emit('lobby_chat', { 
        sender: 'chatbot',
        line: `Hola ${this.$root.player.code}, gracias por visitar AjedrezEV.` + (this.$root.player.observe ? ` Estas en modo observador. Para cambiarlo puedes ` : ` Antes de jugar puedes `) +  `<a href="/preferences" class="has-text-success">establecer tus preferencias</a>`
      })      
    },
    methods: {
      sendChat: function() {
        this.$socket.emit('lobby_chat', { 
          sender: this.$root.player.code,
          line: this.chat
        })
        this.chat = ''
      },
      clickObserve: function(data) { 
        if(data === this.$root.player.code){
          snackbar('default','Eres tu')   
        } else {
          snackbar('default', data + ' Está en modo Observador y no acepta invitaciones') 
        }        
      },
      play: function(player) {
        if(player === this.$root.player.code)
        return snackbar('default','Eres tu')   
        if(this.$root.player.observe)
        return snackbar('default','Estás en modo Observador y no puedes invitar')   

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
          <span class="fas fa-stopwatch"></span>
        </span>
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
</div>`);
        swal({
          title: 'Invitar a ' + player,
          buttons: ["Cancelar", "Invitar"],
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
            var white = t.$root.player.code
            var black = player
            var minutes = parseInt(gameclock.textContent)

            if(playercolor.classList.contains('is-black-pieces')){
              white = player
              black = t.$root.player.code              
            } 

            if(playercolor.classList.contains('is-random-pieces')){
              const coin = Math.floor(Math.random() * 1)
              if(coin){
                white = player
                black = t.$root.player.code              
              } else {
                white = t.$root.player.code
                black = player
              }
            }

            swal({
              title: "Esperando confirmación...",
              text: '👤 ' + player + ' debe responder la solicitud',
              buttons: false
            })

            t.$socket.emit('invite', {
              asker:t.$root.player.code,
              player:player,
              white: white,
              black: black,
              minutes: minutes      
            })
          }
        })
      }
    },
    data () {
      return {
        chat:null
      }
    }
  }
</script>

<style>
  .is-social-box {
    max-width: 320px;
    margin: 0 auto;
  }

</style>