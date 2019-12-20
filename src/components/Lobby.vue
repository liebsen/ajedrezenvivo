<template>
  <div class="container is-widescreen">
    <div class="content column">
      <h3>
        <span class="icon">
          <span class="fas fa-traffic-light"></span> 
        </span>
        <span>Salón</span>
      </h3>
      <div v-show="players.length < 2" class="columns-centered">
        <div class="columns is-flex is-vcentered">
          <div class="column is-social-box has-text-centered">
            <!--h6>Invita a tus amigos</h6-->
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
      <div v-show="players.length > 1" v-for="player in players">
        <div v-if="player != $root.player.code">
          <a href="#" class="button is-text is-rounded" @click="play(player)">
            <span class="icon">
              <span class="fas fa-user"></span>
            </span>
            <span v-html="player"></span>
          </a>
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
      this.$socket.emit('preferences',{
        nick:this.$root.player.code,
        oldnick:this.$root.code
      })

      document.querySelector('body').addEventListener('click', function (event) {
        var target = event.target
        if (target.classList.contains('button')) {
          target.parentNode.childNodes.forEach((item) => {
            if (item.classList && item.classList.contains('button')) {
              item.classList.remove('has-background-warning')
            }
          })
          target.classList.add('has-background-warning')
        }
      })

      this.documentTitle = document.title 
    },
    beforeDestroy: function() {
      this.$socket.emit('lobby_leave', this.$root.player)
      document.title = this.documentTitle
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
      players: function (data) {
        if(data.length > 1){
          snackbar('success','Hay ' + (data.length - 1) +  ' jugador' + (data.length > 2 ? 'es' : '') + ' esperando invitación ')
          document.title = '(' + (data.length - 1) + ') ' + this.documentTitle
          var sound = 'game-start.mp3'
          if(this.players.length > data.length) {
            sound = 'game-end.mp3'
          }
          playSound(sound)
        } else {
          snackbar('default','No hay jugadores en este momento')       
          document.title = this.documentTitle   
          //playSound('check.mp3')
        }        
        this.players = data
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
                minutes: data.minutes,
                broadcast: true
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
    methods: {
      play: function(player){
        var t = this
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <div class="control">
        <div class="buttons levels has-addons playercolor">
          <button class="button is-large is-rounded has-background-warning is-white-pieces">
          </button>
          <button class="button is-large is-random-pieces">
          </button>
          <button class="button is-large is-rounded is-black-pieces">
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
          <button class="button is-rounded has-background-warning">3'</button>
          <button class="button">5'</button>
          <button class="button">10'</button>
          <button class="button is-rounded">30'</button>
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
        players: [],
        documentTitle:null
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