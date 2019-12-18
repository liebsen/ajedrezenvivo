<template>
  <div class="game-container" v-show="!$root.loading">
    <div class="status">
      <span class="has-text-weight-semibold">
        <a href="#" @click="setClock">
          &nbsp;🕗 <!-- <span v-html="speed / 1000"></span>s--> <span v-html="$root.msToTime(duration)"></span>
        </a>
      </span>
      <div class="bar">
        <div class="bar-progress"></div>
      </div>
    </div>  
    <div class="container">
      <div class="content column">
        <div class="columns">
          <div class="column">
            <div class="board-container">
              <div :class="boardColor">
                <div class="board">
                  <div id="board" @click="gamePause"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="column datospartida">
            <!--h5 class="has-text-black">♛ Datos de la partida</h5-->
            <div v-if="Object.keys(data).length">
              <div class="columns">
                <div class="column">
                  <span v-html="data.eco" class=""></span>&nbsp;
                  <span v-html="data.name" class="has-text-black"></span>
                </div>
              </div>  
              <div class="columns gamepgn">
                <div class="movesTableContainer">
                  <div class="movesTable">
                    <div class="moveRow" v-for="(move,index) in pgnIndex">
                      <div class="moveNumCell" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                        <span v-html="(index+1)"></span>
                      </div>

                      <div class="moveCell moveSAN movew" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                        <a class="moveindex" :href="'#'+(move.i-2)">
                          <span v-html="move.white"></span>
                        </a>
                      </div>

                      <div class="moveCell moveSAN moveb" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                        <a class="moveindex" :href="'#'+(move.i-1)">
                          <span v-html="move.black"></span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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
  import Chess from 'chess.js'
  import Chessboard from '../../assets/js/chessboard'
  import snackbar from '../components/Snackbar'
  import swal from 'sweetalert'

  export default {
    name: 'playeco',
    watch: {
      '$route': function () {
        this.gameSeek()
      }
    },
    mounted: function(){
      if(localStorage.getItem('speed')){
        this.speed = parseInt(localStorage.getItem('speed'))
      }

      this.gameStart()
    },
    methods: {
      gameMove:function(){
        if(!this.paused){
          var move = this.gameMoves[this.index];
          this.selectedIndex = parseInt(location.hash.replace('#',''))

          // exit if the game is over
          if (!move || this.game.game_over() === true ||
            this.game.in_draw() === true ||
            this.gameMoves.length === 0) return;

          document.querySelectorAll(this.squareClass).forEach((item) => {
            item.classList.remove('highlight-move');
          })

          document.querySelectorAll('.moveindex').forEach((item) => {
            item.parentNode.classList.remove('active');
          })

          var perc = (this.index + 1) / this.gameMoves.length * 100;
          $('.bar-progress').animate({width:perc+'%'},this.speed,'linear')
          document.querySelector('.moveindex[href="#' + this.index + '"]').parentNode.classList.add('active')

          var n = document.querySelector('.moveindex[href="#' + this.index + '"]').parentNode.offsetTop
          var x = document.querySelector('.moveindex[href="#' + this.index + '"]').parentNode.clientHeight
          var y = n + x
          var h = parseInt(document.querySelector('.movesTableContainer').style.height)
          if(y>h){
            document.querySelector('.movesTableContainer').scrollTop = n
          }

          this.index++
          const moved = this.game.move(move)
          this.board.position(this.game.fen());  

          if(moved){
            document.querySelector('.square-' + moved.from).classList.add('highlight-move')
            document.querySelector('.square-' + moved.to).classList.add('highlight-move')
          }

          if(this.index === this.gameMoves.length){
            this.gamePause()
          }

          setTimeout(this.gameMove, this.speed)
        }
      },
      gamePGN:function(pgn){
        var data = []
        pgn.split('.').forEach(function(turn){
          turn.split(' ').forEach(function(move){
            if(move.length){
              if(isNaN(move) && move.length > 1){
                data.push(move)
              }
            }
          })
        })
        return data
      },
      gamePGNIndex:function(pgn){
        var data = []
        , index = 0
        , selectedIndex = parseInt(location.hash.replace('#',''))
        , symbols = [
          {K:'♔',Q:'♕',B:'♗',N:'♘',R:'♖',p:'♙'},
          {K:'♚',Q:'♛',B:'♝',N:'♞',R:'♜',p:'♟'}
        ]
        pgn.split('.').forEach(function(turn,i){
          const white = turn.split(' ')[1]||''
          const black = turn.split(' ')[2]||''
          if(isNaN(white)){
            data.push({
              white:white,
              black:black,
              i:Math.ceil(i*2),
              odd:i%2==0
            })
          }
        })
        return data
      },  
      gameStart: function(){
        this.$root.loading = true
        axios.get( '/assets/json/eco_es.json').then((res) => {
          if(!Object.keys(res.data).length) return location.href="/404"
          var game = null
          const pref = JSON.parse(localStorage.getItem('player'))||{}

          res.data.forEach((item) => {
            if(this.$route.params.name===item.eco){
              game = item    
            }
          })
          
          const totalms = this.$root.countMoves(game.pgn) * this.speed
          this.gameMoves = this.gamePGN(game.pgn)
          this.pgnIndex = this.gamePGNIndex(game.pgn)
          this.data = game
          this.duration = totalms / 1000
          this.$root.loading = false

          setTimeout(() => {
            this.boardEl = document.getElementById('board')
            this.game = new Chess()

            if(pref.pieces){
              this.boardCfg.pieceTheme = '/assets/img/chesspieces/' + pref.pieces + '/{piece}.png'
              this.boardColor = pref.pieces
            }

            this.board = Chessboard('board', this.boardCfg)      

            $(window).resize(() => {
              this.board.resize()
            })

            this.board.resize()

            const offset = 100
            setTimeout(() => {
              document.querySelector('.movesTableContainer').style.height = ($('.board').height() - offset) + 'px'

              setTimeout(() => {
                /* autoplay kickstart */
                this.gameSeek()
              }, 500)
            }, 500)
          },2000)
        })
      },
      gameFlip: function(){
        this.board.flip()
        const head = document.querySelector('.board > .head').innerHTML
        const foot = document.querySelector('.board > .foot').innerHTML
        document.querySelector('.board > .head').innerHTML = foot
        document.querySelector('.board > .foot').innerHTML = head
      },
      gameSeek:function(){
        window.setTimeout(() => {
          this.selectedIndex = parseInt(location.hash.replace('#',''))
          if(!isNaN(this.selectedIndex)) {
            this.gamePos(this.selectedIndex)
          }
          this.gameMove()
          if(!isNaN(this.selectedIndex) && !this.paused) {
            this.gamePause()
          }
        }, 10)
      },
      gamePos:function(pos){
        if(pos > this.gameMoves.length){
          return
        }

        this.index = pos

        const moves = this.gameMoves.slice(0,this.index)
        var move = this.gameMoves[this.index];
        // ---------------
        var pgn = []
        moves.forEach((move,i) => {
          if(i%2){
            pgn.push(move)
          } else {
            pgn.push([Math.ceil(i/2)+1,move].join('. '))     
          }   
        })

        document.querySelectorAll('.square').forEach((item) => {
          item.classList.remove('highlight-move')
        })

        document.querySelectorAll('.moveindex').forEach((item) => {
          item.parentNode.classList.remove('active');
        })

        document.querySelector('.moveindex[href="#' + this.index + '"]').parentNode.classList.add('active');

        var perc = (this.index + 1) / this.gameMoves.length * 100;
        $('.bar-progress').animate({width:perc+'%'},100,'linear')
        const pgns = pgn.join(' ')
        this.game.reset()

        this.game.load_pgn(pgns) 
        this.board.position(this.game.fen())
      },
      gamePause:function(){
        this.paused = !this.paused
        document.querySelector('.bar-progress').classList.remove('paused')
        if(this.paused){
          document.querySelector('.bar-progress').classList.add('paused')
        } else {
          setTimeout(this.gameMove, 500)
        }
      },
      gameSpeed:function(s){
        this.speed+= s
        if(this.speed >= 1000 && this.speed <= 10000){
          localStorage.setItem('speed',speed)
        } else {
          this.speed-=s
        }
      },
      onMoveEnd: function() {
        document.querySelectorAll('.square-' + this.squareToHighlight).forEach((square) => {
          square.classList.add('highlight-move');
        })
      },
      setClock : function(){
        this.gamePause()
        swal("Ingresa el intervalo en milisegundos entre 1000/60000", {
          content: {
            element: 'input',
            attributes: {
              placeholder: "Valor en milisegundos",
              value: this.speed
            }
          },
          closeOnClickOutside:false
        })
        .then((speed) => {
          if(speed){
            speed = parseInt(speed)
            if(speed > 60000 || speed < 1000){
              swal('El valor debe ser entre 1000 / 60000')
            } else {
              this.speed = speed
              localStorage.setItem('speed',speed)
              const totalms = this.$root.countMoves(this.data.pgn) * this.speed
              this.duration = totalms / 1000
            }          
          }
          this.gamePause()              
        })
        .catch(() => {
          this.gamePause()
        })
      }
    },
    data () {
      return {
        boardCfg: {
          showErrors:true,
          position: 'start',
          draggable: false,
          onMoveEnd: this.onMoveEnd,
          moveSpeed:250,
          pieceTheme:'/assets/img/chesspieces/wikipedia/{piece}.png'
        },
        boardColor:'',
        data:{},
        eco:{},
        duration:0,
        ecode:'&nbsp;',
        opening:'&nbsp;',
        board:null,
        game:null,
        gameMoves:[],
        pgnIndex:[],
        room: location.pathname.replace('/',''),
        selectedIndex: parseInt(location.hash.replace('#','')),
        boardEl:document.getElementById('board'),
        index:0,
        paused:false,
        speed:3000,
        squareToHighlight:null,
        squareClass:'.square-55d63'
      }
    }
  }
</script>