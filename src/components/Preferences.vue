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
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <div class="select">
                  <select v-model="data.board" id="tablero">
                    <option value="classic">[Tablero]</option>
                    <option value="green">Verde</option>
                    <option value="light-green">Verde claro</option>
                    <option value="tournament">Campaña</option>
                    <option value="purple">Púrpura</option>
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
            </div>
            <div class="field-body">
              <div class="field">
                <div class="select">
                  <select v-model="data.pieces" id="piezas">
                    <option value="classic">[Piezas]</option>
                    <option value="neo">Neo</option>
                    <option value="neo_wood">Neo Wood</option>
                    <option value="wood">Wood</option>
                    <option value="bases">Bases</option>
                    <option value="book">Book</option>
                    <option value="cases">Cases</option>
                    <option value="newspaper">Newspaper</option>
                    <option value="maya">Maya</option>
                    <option value="glass">Glass</option>
                    <option value="gothic">Gothic</option>
                    <option value="light">Light</option>
                    <option value="lolz">Lolz</option>
                    <option value="tigers">Tigers</option>
                    <option value="condal">Condal</option>
                    <option value="marble">Marble</option>
                    <option value="modern">Modern</option>
                    <option value="club">Club</option>
                    <option value="neon">Neon</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="board-container">
            <div id="board" :class="boardColor"></div>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <div class="control">
              <label class="label">Nombre</label>
              <input type="text" v-model="data.code" class="input" required>
            </div>
          </div>
          <div class="field">
            <div class="field-group">
              <label class="label">General</label>
              <div class="control">
                <input v-model="data.available" class="is-checkradio has-background-color is-success" id="available" type="checkbox">
                <label class="label" for="available">Disponible</label>
              </div>
              <div class="control">
                <input v-model="data.sound" class="is-checkradio has-background-color is-success" id="sound" type="checkbox">
                <label class="label" for="sound">Sonido</label>
              </div>
              <div class="control">
                <input v-model="data.autoaccept" class="is-checkradio has-background-color is-success" id="autoaccept" type="checkbox">
                <label class="label" for="autoaccept">Auto-aceptar invitaciones</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns has-text-centered">
        <div class="column">
          <input type="button" @click="submit" class="button is-rounded is-success" :class="{ 'is-loading' : $root.saving }" value="Actualizar preferencias">
        </div>
      </div>
    </section>
  </div>
</template>

<script>

  import Chess from 'chess.js'
  import Chessboard from '../../assets/js/chessboard'
  import snackbar from '../components/Snackbar'

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
    methods: {
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
        this.$socket.emit('lobby_leave', this.saved) 
        this.$socket.emit('lobby_leave', this.data) 
        this.$root.saving = true
        this.$root.player = this.data
        this.$socket.emit('preferences',this.data)
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
