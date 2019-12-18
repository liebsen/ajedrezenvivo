<template>
  <div class="container">
    <div class="content column">
      <h3>
        <span class="icon">
          <span class="fas fa-traffic-light"></span> 
        </span>
        <span>Lobby</span>
      </h3>
      <div v-show="players.length < 2" class="has-text-centered">
        <h1>&nbsp;</h1>
        <h5>Invitá a tus amigos a jugar online&nbsp;</h5>
        <div class="column is-social-box has-text-centered">
          <div class="columns is-mobile is-vcentered has-text-centered">
            <div class="column is-hidden-tablet">
              <a :href="'whatsapp://send?text=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                <span class="icon has-text-whatsapp is-size-2">
                  <span class="fab fa-whatsapp-square"></span>
                </span>
              </a>
            </div>
            <div class="column is-hidden-mobile">
              <a :href="'https://web.whatsapp.com/send?text=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                <span class="icon has-text-whatsapp is-size-2">
                  <span class="fab fa-whatsapp-square"></span>
                </span>
              </a>
            </div>
            <div class="column">
              <a :href="'http://www.facebook.com/sharer.php?u=https://ajedrezenvivo.herokuapp.com/lobby&quote=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                <span class="icon has-text-facebook is-size-2">
                  <span class="fab fa-facebook"></span>
                </span>
              </a>
            </div>
            <div class="column">
              <a :href="'https://twitter.com/share?url=https://ajedrezenvivo.herokuapp.com/lobby&amp;text=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                <span class="icon has-text-twitter is-size-2">
                  <span class="fab fa-twitter-square"></span>
                </span>
              </a>
            </div>
            <div class="column">
              <a :href="'mailto:?Body=Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby&Subject=¿Querés jugar ajedrez conmigo?'" target="_blank">
                <span class="icon has-text-primary is-size-2">
                  <span class="fas fa-envelope-square"></span>
                </span>
              </a>
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
          const template = (`<div class="content"><h4><span class="icon"><span class="fas fa-user"></span></span> ${data.asker}</h4><h3><span class="icon"><span class="fas fa-stopwatch"></span> <span> ${data.minutes}'</span></span></h3></div>`);
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
                white: data.asker,
                black: data.player,
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
        const template = (`<div class="content"><h3><span class="icon"><span class="fas fa-stopwatch"></span></span></h3><div class="content dialog-invite"><div><input type="radio" class="is-checkradio has-background-color is-success" name="clock" id="min30" value="30" checked><label for="min30">30 min</label></div><div><input type="radio" class="is-checkradio has-background-color is-success" name="clock" id="min10" value="10"><label for="min10">10 min</label></div><div><input type="radio" class="is-checkradio has-background-color is-success" name="clock" id="min5" value="5"><label for="min5">5 min</label></div></div></div>`);
        swal({
          title: 'Opciones de partida',
          buttons: ["Cancelar", "Invitar"],
          content: {
            element: 'div',
            attributes: {
              innerHTML: `${template}`,
            }
          }
        }).then(accept => {
          if (accept) {
            var options = document.getElementsByName("clock")
            var minutes = null
            if (options) {
              for (var i = 0; i < options.length; i++) {
                if (options[i].checked){
                  minutes = options[i].value;
                }
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