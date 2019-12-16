<template>
  <div class="container">
    <div class="content column">
      <h3>
        <span class="icon">
          <span class="fas fa-traffic-light"></span> 
        </span>
        <span>Lobby</span>
      </h3>
      <div v-if="players.length < 2">
        <h5 class="has-text-centered">Invitá a tus amigos a jugar en línea</h5>
        <div class="notification has-background-white has-text-centered">
         <h3></h3>
          <div class="columns is-mobile is-vcentered has-text-centered">
            <div class="column">
              <a :href="'mailto:?Body=Estoy como ' + $root.player.code + '\nhttps://ajedrezenvivo.herokuapp.com/lobby&Subject=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code" target="_blank">
                <span class="icon is-size-4">
                  <span class="fas fa-envelope"></span>
                </span>
              </a>
            </div>

            <div class="column">
              <a :href="'http://www.facebook.com/sharer.php?u=https://ajedrezenvivo.herokuapp.com/lobby&quote=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                <span class="icon is-size-4">
                  <span class="fab fa-facebook"></span>
                </span>
              </a>
            </div>
            <div class="column">
              <a :href="'https://twitter.com/share?url=https://ajedrezenvivo.herokuapp.com/lobby&amp;text=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' #chess'" target="_blank">
                <span class="icon is-size-4">
                  <span class="fab fa-twitter"></span>
                </span>
              </a>
            </div>
            <div class="column is-hidden-tablet">
              <a :href="'whatsapp://send?text=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                <span class="icon is-size-4">
                  <span class="fab fa-whatsapp"></span>
                </span>
              </a>
            </div>
            <div class="column is-hidden-mobile">
              <a :href="'https://web.whatsapp.com/send?text=¿Querés jugar ajedrez conmigo? Estoy como ' + $root.player.code + ' https://ajedrezenvivo.herokuapp.com/lobby'" target="_blank">
                <span class="icon is-size-4">
                  <span class="fab fa-whatsapp"></span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-for="player in players" else>
        <div v-if="player != $root.player.code">
          <a href="#" class="button is-text is-rounded" @click="play(player)">
            <span class="icon">
              <span class="fas fa-play"></span>
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
      this.$socket.emit('leave', this.$root.player)
      document.title = this.documentTitle
    },
    sockets: {
      nick: function (data) {
        if(this.$root.code === data.oldnick){
          if(data.exists){
            snackbar('error','El nick ' + data.nick + ' ya está en uso. Por favor elegí otro.')
            this.$router.push('/preferences')
          } else {
            this.$socket.emit('lobby', this.$root.player)
          }
        }
      },
      players: function (data) {
        if(data.length > 1){
          snackbar('success','Jugadores en línea: ' + (data.length - 1))
          document.title = '(' + (data.length - 1) + ') ' + this.documentTitle
          var sound = 'game-start.mp3'
          if(this.players.length > data.length) {
            sound = 'game-end.mp3'
          }
          playSound(sound)
        } else {
          snackbar('error','No hay jugadores en línea en este momento')       
          document.title = '(0) ' + this.documentTitle   
          playSound('check.mp3')
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
          swal("Partida declinada", 'Lamentablemente ' + data.player + ' declinó la partida.')
        }
      },
      invite: function(data) {
        var t = this
        if(data.player === this.$root.player.code){
          swal({
            title: "¿Aceptás la partida?",
            text: '👤 ' + data.asker + ' te está invitando',
            buttons: ["Declinar", "Aceptar"]
          })
          .then(accept => {
            console.log("1")
            if (accept) {
              console.log("2")
              axios.post( this.$root.endpoint + '/create', {
                white: data.asker,
                black: data.player,
                minutes: 10,
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
              console.log("3")
              t.$socket.emit('reject', data)
              console.log('Clicked on cancel')
            }
          })
        }
      }
    },
    methods: {
      play: function(player){
        swal({
          title: "Esperando confirmación",
          text: 'Por favor espere a que ' + player + ' responda la solicitud.',
          buttons: false
        })
        this.$socket.emit('invite', {
          asker:this.$root.player.code,
          player:player          
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