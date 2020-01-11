<template>
  <div class="container is-widescreen">
    <section class="content column">
      <h3 class="title">
        <span class="icon">
          <span class="fas fa-sliders-h"></span>
        </span> 
        <span>Preferencias</span>
      </h3>
      <div class="columns">
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
                  <label class="label">Tema del Tablero</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.board" id="tablero">
                      <option value="classic">Clásico</option>
                      <option value="green">Verde</option>
                      <option value="light-green">Verde claro</option>
                      <option value="tournament">Campaña</option>
                      <option value="purple">Púrpura</option>
                      <option value="lilac">Lila</option>
                      <option value="wood">Madera</option>
                      <option value="dark-wood">Madera oscura</option>
                      <option value="dash">Dash</option>
                      <option value="book">Libro</option>
                      <option value="newspaper">Periódico</option>
                      <option value="ocean">Océano</option>
                      <option value="glass">Vidrio</option>
                      <option value="light">Claro</option>
                      <option value="red">Rojo</option>
                      <option value="orange">Naranja</option>
                      <option value="bubblegum">Chicle</option>
                    </select>
                  </div>
                </div>
                <span></span>
              </div>
              <div class="field-body">
                <div class="field">
                  <label class="label">Estilo de Piezas</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.pieces" id="piezas">
                      <option value="classic">Clásico</option>
                      <option value="neo">Neo</option>
                      <option value="neo_wood">Neo Madera</option>
                      <option value="wood">Madera</option>
                      <option value="bases">Bases</option>
                      <option value="uscf">USCF</option>
                      <option value="chess24">Chess24</option>
                      <option value="leipzig">Leipzig</option>
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
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Nombre</label>
                <input type="text" v-model="data.code" class="input" maxlength="10" required>
              </div>
            </div>
            <div class="field">
              <div class="field-group">
                <label class="label">General</label>
                <div class="field-body">
                  <div class="control has-checkradio">
                    <input v-model="data.sound" class="is-checkradio has-background-color is-success" id="sound" type="checkbox" @click="previewSound">
                    <label class="label" for="sound">Sonido</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio">
                    <input v-model="data.strongnotification" class="is-checkradio has-background-color is-success" id="strongnotification" type="checkbox" @click="previewStrongNotification">
                    <label class="label" for="strongnotification">Notificación gigante</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio">
                    <input v-model="data.darkmode" class="is-checkradio has-background-color is-success" id="darkmode" type="checkbox" @click="previewDarkmode">
                    <label class="label" for="darkmode">Modo oscuro</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio">
                    <input v-model="data.observe" class="is-checkradio has-background-color is-success" id="observe" type="checkbox">
                    <label class="label" for="observe">Observador</label>
                    <p class="notification is-warning">
                      <small>No disponible para jugar en línea.</small>
                    </p>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio">
                    <input v-model="data.autoaccept" class="is-checkradio has-background-color is-success" id="autoaccept" type="checkbox">
                    <label class="label" for="autoaccept">Auto-aceptar invitaciones</label>
                    <p class="notification is-warning">
                      <small>Aceptar automáticamente todas las invitaciones que reciba para jugar en línea.</small>
                    </p>
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

  import Chess from 'chess.js'
  import Chessboard from '../../assets/js/chessboard'
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
        this.bordColor = val
        this.drawBoard()
      }
    },
    mounted: function(){
      const saved = localStorage.getItem('player')
      if(saved){
        this.data = JSON.parse(saved)
        this.saved = JSON.parse(saved)
      }
      this.drawBoard()
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
      previewSound: function(){
        setTimeout(() => {
          if(this.data.sound){
            playSound('check.mp3')
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
          this.boardCfg.pieceTheme = '/assets/img/chesspieces/' + this.data.pieces + '/{piece}.png'
          this.boardColor = this.data.board
          this.pieceColor = this.data.pieces
        }

        this.board = Chessboard('board', this.boardCfg)      

        $(window).resize(() => {
          this.board.resize()
        })
      },
      submit: function(){
        this.$socket.emit('lobby_leave', this.$root.player) 
        this.$socket.emit('lobby_leave', this.data) 
        this.$root.saving = true
        this.data.ref = this.$root.player.code
        //this.$root.player = this.data
        this.$socket.emit('preferences', this.data)  
        this.saved = {}
      }
    },
    data () {
      return {
        boardCfg: {
          showErrors:true,
          position: 'start',
          draggable: false,
          pieceTheme:'/assets/img/chesspieces/classic/{piece}.png'
        },
        data:{},
        saved:{},
        nick:null,
        boardColor:null,
        boardEl:null,
        game:null,
        loading: false
      }
    }
  }
</script>
