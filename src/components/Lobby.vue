<template>
  <div class="container is-widescreen">
    <div class="content column">
      <h3>
        <span class="icon">
          <span class="fas fa-traffic-light"></span> 
        </span>
        <span>Salón</span>
      </h3>
      <div>
        <div class="columns">
          <div class="column lobby-list">
            <div v-show="$root.players.length">
              <h6>
                <span class="icon">
                  <span class="fa fa-users"></span>
                </span>
                <span>Jugadores disponibles</span>
              </h6>
              <div>
                <div v-for="player in $root.players" class="field">
                  <a href="#" v-if="player.code != $root.player.code" class="button is-text is-rounded is-info is-outlined" @click="play(player.code)" :title="'Invitar a ' + player.code">
                    <span class="icon">
                      <span class="fas fa-user"></span>
                    </span>
                    <span v-html="player.code"></span>
                  </a>
                  <a href="#" v-else class="button is-text is-rounded is-light">
                    <span class="icon">
                      <span class="fas fa-user"></span>
                    </span>
                    <span v-html="player.code"></span>
                  </a>
                </div>
              </div>
            </div>
            <div v-show="matches.length">
              <h6>
                <span class="icon">
                  <span class="fa fa-chess-board"></span>
                </span>
                <span>Partidas</span>
              </h6>
              <div>
                <div v-for="match in matches" class="field">
                  <router-link :to="'/watch/' + match.id" class="button is-text is-rounded is-info is-outlined" :title="'Ver partida entre ' + match.white + ' y ' + match.black">
                    <span class="icon">
                      <span class="fa fa-user"></span>
                    </span>
                    <span v-html="match.white"></span>
                    <span class="icon">
                      <span class="fa fa-arrows-alt-h"></span>
                    </span>
                    <span class="icon">
                      <span class="fa fa-user"></span>
                    </span>
                    <span v-html="match.black"></span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <h6>
              <span class="icon">
                <span class="fa fa-comments"></span>
              </span>
              <span>Chat</span>
            </h6>
            <div class="column has-text-left has-background-light">
              <div class="columns">
                <div class="column chatbox"></div>
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
        <div class="columns">
          <div class="column is-social-box has-text-centered">
            <div class="columns is-mobile is-vcentered has-text-centered fadeIn">
              <div class="column is-hidden-tablet">
                <a :href="'whatsapp://send?text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                  <span class="icon has-text-whatsapp is-size-2">
                    <span class="fab fa-whatsapp"></span>
                  </span>
                </a>
              </div>
              <div class="column is-hidden-mobile">
                <a :href="'https://web.whatsapp.com/send?text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                  <span class="icon has-text-whatsapp is-size-2">
                    <span class="fab fa-whatsapp"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'http://www.facebook.com/sharer.php?u=https://ajedrezenvivo.herokuapp.com/lobby&quote=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                  <span class="icon has-text-facebook is-size-2">
                    <span class="fab fa-facebook"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'https://twitter.com/share?url=https://ajedrezenvivo.herokuapp.com/lobby&amp;text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                  <span class="icon has-text-twitter is-size-2">
                    <span class="fab fa-twitter"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'http://www.linkedin.com/shareArticle?mini=true&url=https://ajedrezenvivo.herokuapp.com/lobby&text=¿Querés jugar ajedrez online? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                  <span class="icon has-text-twitter is-size-2">
                    <span class="fab fa-linkedin"></span>
                  </span>
                </a>
              </div>
              <div class="column">
                <a :href="'mailto:?Body=Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby&Subject=¿Querés jugar ajedrez online?'" target="_blank">
                  <span class="icon has-text-primary is-size-2">
                    <span class="fas fa-envelope-square"></span>
                  </span>
                </a>
              </div>
            </div>
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
        line: `Bienvenid@ ${this.$root.player.code}, gracias por visitar AjedrezEV. <a href="/preferences" class="has-text-success">Establece tus preferencias</a>`
      })      
    },
    sockets: {
      match_live: function(data){
        this.matches = data
      },
      lobby_chat: function(data){
        const chatbox = document.querySelector(".chatbox")
        const owned = this.$root.player.code === data.sender
        const cls = owned ? 'is-pulled-right has-text-right has-background-info has-text-white' : 'is-pulled-left has-text-left'
        const sender = data.sender === this.$root.player.code ? '' : data.sender
        chatbox.innerHTML+= `<div class="box ${cls}"><strong class="has-text-info">${sender}</strong> ${data.line}</div>`
        chatbox.scrollTop = chatbox.scrollHeight
        if(data.sender != this.$root.player.code){
          playSound('chat.mp3')
        }
      }
    },
    methods: {
      sendChat: function(){
        this.$socket.emit('lobby_chat', { 
          sender: this.$root.player.code,
          line: this.chat
        })
        this.chat = ''
      },
      play: function(player){
        var t = this
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <div class="control">
        <div class="buttons levels has-addons playercolor">
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
        chat:null,
        matches:[],
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