<template>
  <div class="container is-widescreen">
    <section class="content column">
      <h3 class="title">
        <span class="icon">
          <span class="fas fa-cog"></span>
        </span> 
        <span>Preferencias</span>
      </h3>
      <div class="columns">
        <div class="column">
          <label class="label">Nick</label>
          <input type="text" v-model="data.code" class="input" required>
        </div>
        <div class="column">
          <label class="label">Disponible</label>
          <div class="field">
            <input v-model="data.available" class="is-checkradio has-background-color is-success" id="available" type="checkbox">
            <label for="available"></label>
          </div>
        </div>
        <div class="column">
          <label class="label">Temas</label>
          <div class="field">
            <div class="select">
              <select v-model="data.pieces">
                <option value="classic">Classic</option>
                <option value="neo">Neo</option>
                <option value="wood">Wood</option>
                <option value="newspaper">Newspaper</option>
                <option value="maya">Maya</option>
                <option value="bases">Bases</option>
                <option value="condal">Condal</option>
                <option value="modern">Modern</option>
                <option value="club">Club</option>
                <option value="neon">Neon</option>
              </select>
            </div>
          </div>
          <div class="board-container">
            <div :class="boardColor">
              <div id="board"></div>          
            </div>
          </div>
        </div>
      </div>

      <div class="columns has-text-centered">
        <div class="column">
          <input type="button" @click="submit" class="button is-rounded is-success" :class="{ 'is-loading' : loading }" value="Guardar">
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
        this.boardColor = val
        this.drawBoard()
      }
    },
    mounted: function(){
      const saved = localStorage.getItem('player')
      if(saved){
        this.data = JSON.parse(saved)
        this.nick = this.data.code
      }

      this.drawBoard()
    },
    sockets: {
      nick: function (data) {
        if(this.nick === data.oldnick){
          this.loading = false
          if(data.exists){
            snackbar('error','Las preferencias no fueron guardadas: El nick ' + data.nick + ' ya está en uso. Por favor elija otro.')
          } else {
            snackbar('success','Las preferencias han sido guardadas correctamente')
            localStorage.setItem('player', JSON.stringify(this.data))
            this.$root.player = this.data
          }
        }
      }
    },
    methods: {
      drawBoard:function(){
        this.boardEl = document.getElementById('board')
        this.game = new Chess()

        if(this.data.pieces){
          this.boardCfg.pieceTheme = '/assets/img/chesspieces/' + this.data.pieces + '/{piece}.png'
          this.boardColor = this.data.pieces
        }

        this.board = Chessboard('board', this.boardCfg)      

        $(window).resize(() => {
          this.board.resize()
        })
      },
      submit: function(){
        if(this.nick === this.data.code){
          localStorage.setItem('player', JSON.stringify(this.data))
          this.$root.player = this.data
          snackbar('success','Las preferencias han sido guardadas correctamente')
        } else {
          this.loading = true
          this.$socket.emit('preferences',{
            nick:this.data.code,
            oldnick:this.nick
          })
        }
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
        nick:null,
        boardColor:null,
        boardEl:null,
        game:null,
        loading: false
      }
    }
  }
</script>
