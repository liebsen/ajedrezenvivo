<template>
  <div>
    <div class="container is-widescreen">
      <div class="content column">
        <div class="columns">
          <div class="column">
            <div class="board-container">
              <div :class="boardColor">
                <h6 class="has-text-left black">
                  <span v-show="data.result==='0-1'">🏆</span>
                  <span v-html="data.black" class="has-timer"></span>
                  <span class="button is-rounded is-small" v-html="tdisplay.b" :class="{ 'has-background-grey has-text-white' : timer.b > 10, 'has-background-danger has-text-white' : timer.b <= 10}"></span>
                </h6>
                <div class="board">
                  <div class="score-container">
                    <div class="score" :style="'max-height:' + vscore + '%'"></div>
                  </div>            
                  <div id="board"></div>
                </div>
                <h6 class="has-text-right white">
                  <span class="button is-rounded is-small" v-html="tdisplay.w" :class="{ 'has-background-white has-text-black' : timer.w > 10, 'has-background-danger has-text-white' : timer.w <= 10}"></span>
                  <span v-html="data.white" class="has-timer"></span>
                  <span v-show="data.result==='1-0'">🏆</span>
                </h6>
              </div>
            </div>
          </div>
          <div class="column datospartida">
            <div v-show="gameStarted">
              <div class="columns">
                <div class="column">
                  <span v-html="ecode" class=""></span> 
                  <span v-html="opening" class="has-text-black"></span>
                </div>
              </div> 
              <div v-if="Object.keys(data).length">
                <div class="columns gamepgn">
                  <div class="movesTableContainer">
                    <div class="movesTable">
                      <div class="moveRow" v-for="(move,index) in pgnIndex">
                        <div class="moveNumCell" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                          <span v-html="(index+1)"></span>
                        </div>
                        <div class="moveCell moveSAN movew" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                          <a class="moveindex">
                            <span v-html="move.white"></span>
                          </a>
                        </div>
                        <div class="moveCell moveSAN moveb" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                          <a class="moveindex">
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
  </div>
</template>

<script>

  import axios from 'axios'
  import Chess from 'chess.js'
  import Chessboard from '../../assets/js/chessboard'
  import snackbar from '../components/Snackbar'
  import swal from 'sweetalert'
  import playSound from '../components/playSound'

  export default {
    name: 'watch',
    mounted: function(){
      window.app = this
      axios.get('/assets/json/eco_es.json')
        .then((response) => {
          this.eco = response.data
          this.gameStart()
        })

      this.$socket.emit('join',this.$route.params.game)
    },
    destroyed () {
      clearInterval(this.clock)
    },
    beforeDestroy: function() {
      this.$socket.emit('leave',this.$route.params.game)      
    },
    sockets: {
      move: function(data){
        var t = this
        var moveObj = ({
          from: data.from,
          to: data.to,
          promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });
        // see if the move is legal
        var move = t.game.move(moveObj)

        if (move === null) {
          return 'snapback';
        }

        t.board.position(t.game.fen())
        t.updateMoves(move)
        t.timer.w = parseInt(data.wtime)
        t.timer.b = parseInt(data.btime)
        t.tdisplay.w = t.getTimeDisplay(t.timer.w)
        t.tdisplay.b = t.getTimeDisplay(t.timer.b)  
      }
    },
    methods: {
      getTimeDisplay: function(time){
        var min = parseInt(time / 60, 10)
        var sec = parseInt(time % 60, 10)

        min = min < 10 ? "0" + min : min
        sec = sec < 10 ? "0" + sec : sec

        return min + ":" + sec
      },
      startClock: function(){
        var t = this
        t.clock = setInterval(() => {
          if(t.announced_game_over) {
            clearInterval(t.clock)
          } else {
            var turn = t.game.turn()
            var result = null
            if (--t.timer[turn] < 0) {
              t.timer[turn] = 0
              if(result){
                t.data.result = result
              }
              t.announced_game_over = true
            } else {
              t.tdisplay[turn] = t.getTimeDisplay(t.timer[turn]) 
            }
          }
        },1000)
      },
      get_moves: function()
      {
        var moves = '';
        var pgn = []
        var history = this.game.history({verbose: true});
        
        for(var i = 0; i < history.length; ++i) {
            var move = history[i];
            moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
        }

        return moves;
      },
      updateMoves:function(move){
        var t = this
        var sound = 'move.mp3'
        var pgn = t.game.pgn()
        t.uciCmd('position startpos moves' + this.get_moves(), this.evaler);
        t.uciCmd("eval", this.evaler);

        if(t.game.game_over()){
          if(t.game.in_draw() || t.game.in_stalemate() || t.game.in_threefold_repetition()) {
            swal("Tablas", 'La partida finalizó con un empate', "info")
          } else {          
            const winner = t.game.turn() === 'w' ? t.data.black : t.data.white
            swal("¡Victoria!", winner + ' ganó la partida', "success")
          }
          
          sound = 'game-end.mp3'
          t.announced_game_over = true
        } else {

          if(move.flags === 'c'){
            sound = 'capture.mp3'        
          }

          if(move.flags === 'k'){
            sound = 'castle.mp3'
          }

          if(move.flags === 'q'){
            sound = 'castle.mp3'
          }

          if (t.game.in_check() === true) {
            sound = 'check.mp3'
          }

          t.removeHighlight()
          t.addHightlight(move)

          if(pgn){
            t.pgnIndex = this.gamePGNIndex(pgn)
          }
          
          playSound(sound)
         
          setTimeout(() => {
            const movesTable = document.querySelector(".movesTableContainer")
            movesTable.scrollTop = movesTable.scrollHeight
          },1)

          if(t.game.history().length < 14){
            setTimeout(() => {
              t.eco.forEach((eco,i) => {
                if(eco.pgn === this.game.pgn()){
                  t.opening = eco.name
                  t.ecode = eco.eco
                }
              })
            },1000)
          }
        }
      },
      removeHighlight : function() {
        document.querySelectorAll('.square-55d63').forEach((item) => {
          item.classList.remove('highlight-move')
          item.classList.remove('in-check')
        })
      },
      addHightlight : function(move){
        var t = this
        t.removeHighlight();
        if(move){
          if (t.game.in_check() === true) {
            t.boardEl.querySelector('img[data-piece="' + t.game.turn() + 'K"]').parentNode.classList.add('in-check')
          }
          setTimeout(function(){
            t.boardEl.querySelector('.square-' + move.from).classList.add('highlight-move');
            t.boardEl.querySelector('.square-' + move.to).classList.add('highlight-move');   
          },200)
        }
      },
      highlightLastMove: function(){
        var history = this.game.history({verbose:true})
        if(history.length){
          var move = history[history.length-1]
          document.querySelector('.square-' + move.from).classList.add('highlight-move')
          document.querySelector('.square-' + move.to).classList.add('highlight-move')
        }
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
      uciCmd: function(cmd, which) {
        //console.log("UCI: " + cmd);
        (which || this.evaler).postMessage(cmd);
      },    
      gameStart: function(){
        this.$root.loading = true
        const pref = JSON.parse(localStorage.getItem('player'))||{}
        axios.post( this.$root.endpoint + '/game', {id:this.$route.params.game} ).then((res) => {
          if(!Object.keys(res.data).length) return location.href="/404"
          var game = res.data

          this.evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('/assets/js/stockfish.js')

          this.evaler.onmessage = function(event) {
            var t = window.app
            var line;
            
            if (event && typeof event === "object") {
              line = event.data;
            } else {
              line = event;
            }
            
            //console.log("evaler: " + line);

            var match = null
            if(match = line.match(/^Total evaluation: (\-?\d+\.\d+)/)) {
              t.score = parseFloat(match[1]);
              t.vscore = 50 - (t.score / 20 * 100)
            }

            /// Ignore some output.
            if (line === "uciok" || line === "readyok" || line.substr(0, 11) === "option name") {
              return;
            }
          }

          if(game.pgn){
            this.pgnIndex = this.gamePGNIndex(game.pgn)
          }
          this.data = game

          if(game.wtime){
            this.timer.w = parseInt(game.wtime)
          } else {
            this.timer.w = parseInt(game.minutes * 60)
          }

          this.tdisplay.w = this.getTimeDisplay(this.timer.w)

          if(game.btime){
            this.timer.b = parseInt(game.btime)
          } else {
            this.timer.b = parseInt(game.minutes * 60)
          }

          this.tdisplay.b = this.getTimeDisplay(this.timer.b)
          this.startClock()

          this.$root.loading = false

          setTimeout(() => {
            this.boardEl = document.getElementById('board')
            this.game = new Chess()
            var pos = 'start'

            if(this.data.fen){
              pos = this.data.fen
            }

            var cfg = {
              draggable: false,
              position: pos,
              pieceTheme:'/assets/img/chesspieces/wikipedia/{piece}.png'
            }

            if(pref.pieces){
              cfg.pieceTheme = '/assets/img/chesspieces/' + pref.pieces + '/{piece}.png'
              this.boardColor = pref.board
            }

            this.board = Chessboard('board', cfg)
            this.orientation = this.board.orientation()

            if(this.data.pgn){
              this.game.load_pgn(this.data.pgn)
            }

            $(window).resize(() => {
              this.board.resize()
              this.highlightLastMove()
            })

            playSound('game-start.mp3')
            this.highlightLastMove()
            this.gameStarted = true
          },100)
        })
      },
      gameFlip: function(){
        this.board.flip()
        this.orientation = this.board.orientation()
        const white = document.querySelector('.board-container .white').innerHTML
        const black = document.querySelector('.board-container .black').innerHTML
        document.querySelector('.board-container .white').innerHTML = black
        document.querySelector('.board-container .black').innerHTML = white
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

        document.querySelectorAll('.square-55d63').forEach((item) => {
          item.classList.remove('highlight-move')
        })

        document.querySelectorAll('.moveindex').forEach((item) => {
          item.parentNode.classList.remove('active');
        })

        document.querySelector('.moveindex.m' + this.index).parentNode.classList.add('active');

        var perc = (this.index + 1) / this.gameMoves.length * 100;
        $('.bar-progress').animate({width:perc+'%'},100,'linear')
        const pgns = pgn.join(' ')
        this.game.reset()

        this.game.load_pgn(pgns) 
        this.board.position(this.game.fen())


        const moved = this.game.move(move)

        if(moved){
          document.querySelector('.square-' + moved.from).classList.add('highlight-move')
          document.querySelector('.square-' + moved.to).classList.add('highlight-move')
        }
      }
    },
    data () {
      return {
        boardColor:'',
        clock:null,
        timer:{w:null,b:null},
        tdisplay:{w:null,b:null},
        data:{},
        eco:{},
        duration:0,
        score:0.10,
        vscore:49,
        orientation:null,
        announced_game_over:false,
        gameStarted:false,
        score:0.10,
        vscore: 49,
        ecode:null,
        opening:null,
        board:null,
        game:null,
        pgnIndex:[],
        boardEl:null
      }
    }
  }
</script>