<template>
  <div class="container is-widescreen">
    <section class="content column fadeIn">
      <h3 class="title">
        <span class="icon">
          <span class="fas fa-paint-brush"></span>
        </span> 
        <span>Preferencias</span>
      </h3>
      <div class="columns is-marginless">
        <div class="column">
          <div class="board-container preservefilter">
            <div id="board" :class="boardColor"></div>
          </div>
        </div>
        <div class="column">
          <form @submit.prevent="submit"> 
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field">
                  <label class="label">Nombre</label>
                  <input type="text" v-model="data.code" class="input is-rounded" maxlength="10" title="Ingresa tu nombre!" required>
                </div>
              </div>
              <div class="field-body">
                <div class="field">
                  <label class="label">País</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.flag" id="piezas" title="Elegí tu país">
                      <option v-for="(item, index) in flags" :key="index" :value="item.emoji">{{item.emoji}} {{item.name}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field">
                  <label class="label">Tema del Tablero</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.board" id="tablero" title="Elegí el tema de tablero">
                      <option value="classic">Clásico</option>
                      <option value="bases">Bases</option>
                      <option value="bit">8 Bit</option>
                      <option value="blue">Azul</option>
                      <option value="bubblegum">Chicle</option>
                      <option value="burled-wood">Madera raíz</option>
                      <option value="dark-wood">Madera</option>
                      <option value="dash">Dash</option>
                      <option value="glass">Vidrio</option>
                      <option value="graffiti">Graffiti</option>
                      <option value="green">Verde</option>
                      <option value="green-plastic">Verde plástico</option>
                      <option value="ocean">Océano</option>
                      <option value="lolz">Lolz</option>
                      <option value="marble">Mármol</option>
                      <option value="metal">Metal</option>
                      <option value="neon">Neón</option>
                      <option value="newspaper">Periódico</option>
                      <option value="orange">Naranja</option>
                      <option value="overlay">Cobertor</option>
                      <option value="parchment">Pergamino</option>
                      <option value="pink">Rosa</option>
                      <option value="purple">Púrpura</option>
                      <option value="red">Rojo</option>
                      <option value="sand">Arena</option>
                      <option value="sky">Cielo</option>
                      <option value="stone">Piedra</option>
                      <option value="tan">Bronceado</option>
                      <option value="tournament">Torneo</option>
                      <option value="translucent">Translúcido</option>
                      <option value="turquoise">Turquesa</option>
                      <option value="walnut">Nuez</option>
                    </select>
                  </div>
                </div>
                <span></span>
              </div>
              <div class="field-body">
                <div class="field">
                  <label class="label">Estilo de Piezas</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.pieces" id="piezas" title="Elegí estilo de piezas">
                      <option value="classic">Clásico</option>
                      <option value="neo">Neo</option>
                      <option value="neo_wood">Neo Madera</option>
                      <option value="wood">Madera</option>
                      <option value="bases">Bases</option>
                      <option value="alpha">Alfa</option>
                      <option value="chess24">Chess24</option>
                      <option value="leipzig">Leipzig</option>
                      <option value="fantasy">Fantasía</option>
                      <option value="book">Libro</option>
                      <option value="cases">Cases</option>
                      <option value="newspaper">Periódico</option>
                      <option value="maya">Maya</option>
                      <option value="glass">Vidrio</option>
                      <option value="gothic">Gótico</option>
                      <option value="light">Claro</option>
                      <option value="lolz">Lolz</option>
                      <option value="tigers">Tigers</option>
                      <option value="condal">Condal</option>
                      <option value="marble">Mármol</option>
                      <option value="modern">Moderno</option>
                      <option value="club">Club</option>
                      <option value="neon">Neón</option>
                      <option value="magi">Magi</option>
                      <!--option value="jade3d">3D Jade</option-->
                      <option value="staunton3d">3D Staunton</option>
                      <option value="plastic3d">3D Plástico</option>
                      <option value="wood3d">3D Madera</option>
                      <option value="chesskid3d">3D Chess Kid</option>
                      <option value="magi3d">3D Magi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <div class="field-group">
                <label class="label">General</label>
                <div class="field-body">
                  <div class="control has-checkradio" title="Desactiva notificaciones sonoras">
                    <input v-model="data.sound" class="is-checkradio has-background-color is-white" id="sound" type="checkbox" @click="previewSound">
                    <label class="label" for="sound">Sonido</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="Notificaciones hiper-visibles">
                    <input v-model="data.strongnotification" class="is-checkradio has-background-color is-white" id="strongnotification" type="checkbox" @click="previewStrongNotification">
                    <label class="label" for="strongnotification">Notificación gigante</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="Activa visión nocturna">
                    <input v-model="data.darkmode" class="is-checkradio has-background-color is-white" id="darkmode" type="checkbox" @click="previewDarkmode">
                    <label class="label" for="darkmode">Modo oscuro</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="No disponible para jugar en línea">
                    <input v-model="data.observe" class="is-checkradio has-background-color is-white" id="observe" type="checkbox">
                    <label class="label" for="observe">Modo Observador</label>
                    <!--p class="notification is-warning">
                      <small>No disponible para jugar en línea</small>
                    </p-->
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="Aceptar invitaciones de otros grupos">
                    <input v-model="data.autoaccept" class="is-checkradio has-background-color is-white" id="autoaccept" type="checkbox">
                    <label class="label" for="autoaccept">Aceptar invitaciones de otros grupos</label>
                    <!--p class="notification is-warning">
                      <small>Aceptar automáticamente todas las invitaciones para jugar</small>
                    </p-->
                  </div>
                </div>
              </div>
            </div>

            <div class="field has-text-centered">
              <div class="column">
                <button type="submit" class="button is-rounded is-success" :class="{ 'is-loading' : $root.saving }">Actualizar preferencias</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import axios from 'axios'
  import Chess from 'chess.js'
  import { mapState } from 'vuex'
  import Chessboard from '../../static/js/chessboard'
  import snackbar from '../components/Snackbar'
  import playSound from '../components/playSound'

  export default {
    name: 'preferences',
    watch: {
      'data.pieces': function (val) {
        this.pieceColor = val
        this.drawBoard()
      },
      'data.board': function (val) {
        this.boardColor = val
        this.drawBoard()
      }
    },
    computed: {
      ...mapState([
        'player'
      ])
    },
    mounted: function(){
      this.$root.loading = true
      this.data = this.player
      this.nick = this.player.code
      this.flag = this.player.flag
      this.$root.saving = false
      axios.get('/json/flags.json').then(flags => {
        this.flags = flags.data
        setTimeout(() => {
          this.$root.loading = false
          this.drawBoard()  
        },250)
      })
    },
    created () {
      window.addEventListener('resize', this.addWindowListeners)
    },
    destroyed () {
      window.removeEventListener('resize', this.addWindowListeners)
    },
    beforeDestroy: function() {
      const player = JSON.parse(localStorage.getItem('player'))
      if(player.strongnotification){
        document.querySelector('.ui-snackbar').classList.add('is-strong')
      } else {
        document.querySelector('.ui-snackbar').classList.remove('is-strong')
      }
      if(player.darkmode){
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    },
    methods: {
      addWindowListeners () {
        this.board.resize()
        document.querySelector('.square-b5').classList.add('highlight-move')
        document.querySelector('.square-f1').classList.add('highlight-move')
      },
      previewSound: function(){
        setTimeout(() => {
          if(this.data.sound){
            playSound('check.ogg')
          }
        },100)
      },
      previewStrongNotification: function(){
        var contains = document.querySelector('.ui-snackbar').classList.contains('is-strong')
        var snackbarBar = document.querySelector('.ui-snackbar')
        snackbarBar.classList.remove('ui-snackbar--is-active')
        snackbarBar.classList.add('ui-snackbar--is-inactive')
        setTimeout(() => {
          if(this.data.strongnotification){
            snackbarBar.classList.add('is-strong')
            snackbar('default','Notificación gigante',3000)
          } else {
            snackbarBar.classList.remove('is-strong')
            snackbar('default','Notificación normal',3000)
          }
        },100)
      },
      previewDarkmode: function(){
        setTimeout(() => {
          if(this.data.darkmode){
            document.documentElement.classList.add('dark-mode')
          } else {
            document.documentElement.classList.remove('dark-mode')
          }
        },100)
      },
      drawBoard:function(){
        this.boardEl = document.getElementById('board')
        this.game = new Chess()

        if(this.data.pieces){
          this.boardCfg.pieceTheme = '/static/img/chesspieces/' + this.data.pieces + '/{piece}.png'
          this.boardColor = this.data.board
          this.pieceColor = this.data.pieces
          this.$root.checkBoardStyle(this.data.pieces)
        }

        this.board = Chessboard('board', this.boardCfg)      
        this.board.resize()        
        document.querySelector('.square-b5').classList.add('highlight-move')
        document.querySelector('.square-f1').classList.add('highlight-move')
      },
      submit: function(){
        this.$root.saving = true
        this.$socket.emit('lobby_leave', {code: this.nick})
        this.data.ref = this.nick || 'desconocido'
        this.$store
          .dispatch('player', this.data)
          .then(data => {
            console.log('🙌 Datos de la aplicación actualizados')
            this.nick = data.nick
            this.$root.saving = false
            this.$socket.emit('preferences', data)
            snackbar('success', 'Preferencias guardadas')
          }).catch(err => {
            console.log(`Algo malo sucedió ` + err)
          })
      }
    },
    data () {
      return {
        boardCfg: {
          position: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R',
          pieceTheme:'/static/img/chesspieces/classic/{piece}.png',
          draggable: false
        },
        data:{},
        flags:[],
        nick:null,
        boardColor:null,
        boardEl:null,
        game:null,
        loading: false
      }
    }
  }
</script>
