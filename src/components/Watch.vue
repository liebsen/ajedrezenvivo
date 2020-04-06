<template>
  <div :class="boardColor">
    <div class="container is-widescreen">
      <div class="content">
        <div class="columns is-marginless-top fadeIn">
          <div class="column">
            <div class="board-container">
              <h6 class="has-text-left black is-hidden-mobile is-clickable" @click="gameFlip">
                <span v-show="data.result==='0-1'" class="icon">
                  <span class="fa fa-trophy is-size-7 has-text-warning"></span>
                </span>
                <span v-html="data.black" class="is-size-6"></span>
              </h6>
              <div class="board preservefilter" :class="{ 'black' : orientation === 'black' }">
                <div class="score-container">
                  <div class="score" :style="'max-height:' + vscore + '%'"></div>
                </div>            
                <div id="board"></div>
              </div>
              <h6 class="has-text-right white is-hidden-mobile is-clickable" @click="gameFlip">
                <span v-html="data.white" class="is-size-6"></span>
                <span v-show="data.result==='1-0'" class="icon">
                  <span class="fa fa-trophy is-size-7 has-text-warning"></span>
                </span>
              </h6>
            </div>
          </div>
          <div class="column">
            <div class="board-assistant" v-show="gameStarted">
              <div class="columns is-hidden-mobile preservefilter">
                <div class="column has-text-right">
                  <span class="button is-large" :class="{ 'has-background-white has-text-black' : timer.w > 10, 'has-background-danger has-text-white' : timer.w <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span class="clock-text" v-html="tdisplay.w"></span>
                  </span>
                </div>
                <div class="column has-text-left">
                  <span class="button is-large" :class="{ 'has-background-black has-text-white' : timer.b > 10, 'has-background-danger has-text-white' : timer.b <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span class="clock-text" v-html="tdisplay.b"></span>
                  </span>
                </div>
              </div>
              <div class="columns is-hidden-tablet is-mobile preservefilter">
                <div class="column has-text-left">
                  <span class="button is-small" :class="{ 'has-background-white has-text-black' : timer.w > 10, 'has-background-danger has-text-white' : timer.w <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span class="clock-text" v-html="tdisplay.w"></span>
                  </span>
                </div>
                <div class="column has-text-right">
                  <span class="button is-small" :class="{ 'has-background-black has-text-white' : timer.b > 10, 'has-background-danger has-text-white' : timer.b <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span class="clock-text" v-html="tdisplay.b"></span>
                  </span>
                </div>
              </div>
              <div class="columns has-text-centered">
                <div class="column has-text-left preservefilter">
                  <button @click="gameFlip()" class="button is-small is-rounded is-info" title="Girar tablero">
                    <span class="icon">
                      <span class="fa fa-retweet"></span>
                    </span>
                  </button>
                  <button @click="showPGN()" class="button is-small is-rounded is-info" v-if="pgnIndex.length" title="Mostrar PGN">
                    <strong>PGN</strong>
                  </button>
                </div>
              </div> 
              <div class="columns has-text-centered">
                <div class="column">
                  <strong v-html="ecode" class=""></strong> 
                  <span v-html="opening" class="has-text-black"></span>
                </div>
              </div>
              <div v-if="Object.keys(data).length">
                <div class="columns is-hidden-mobile">
                  <div class="chart-container preservefilter">
                    <div :class="orientation">
                      <div class="chart" v-show="pgnIndex.length"></div>
                    </div>
                  </div>
                </div>
                <div class="columns is-hidden-mobile">
                  <div class="movesTableContainer preservefilter">
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
  import { mapState } from 'vuex'
  import Chess from 'chess.js'
  import Chessboard from '../../static/js/chessboard'
  import snackbar from '../components/Snackbar'
  import swal from 'sweetalert'
  import playSound from '../components/playSound'

  export default {
    name: 'watch',
    mounted: function(){
      window.app = this
      this.gameStart()
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
        t.tdisplay.w = t.$root.getTimeDisplay(t.timer.w)
        t.tdisplay.b = t.$root.getTimeDisplay(t.timer.b)  
      }
    },
    methods: {
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
              t.tdisplay[turn] = t.$root.getTimeDisplay(t.timer[turn]) 
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
      calcPoints : function(){
        this.chart.points = [];
        if(this.chart.values.length > 1){
          var points = "0," + this.chart.height + " ";
          for(var x=0; x < this.chart.values.length; x++){
            var perc  = this.chart.values[x] / this.chart.maxValue;
            var steps = 100 / ( this.chart.values.length - 1 );
            var point = (steps * (x )).toFixed(2) + "," + (this.chart.height - (this.chart.height * perc)).toFixed(2) + " ";
            points += point;
          }
          points += "100," + this.chart.height
          this.chart.points = points                  
        }
      },
      drawChart: function(){
        var score = parseInt(this.vscore)

        if(this.orientation === 'white'){
          score = 100 - score;
        }

        if(score < 0) {
          score = 0
        }

        if(score > 100) {
          score = 100
        }

        if(!isNaN(score)){
          this.chart.values.push(score)
          this.updateChart()
        }        
      },
      updateChart: function(){

        this.calcPoints()

        var element = document.getElementsByClassName("chart")[0]
        element.innerHTML = "";

        var width = document.querySelector(".movesTableContainer").clientWidth + 'px'
        var chart = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        chart.setAttribute("width", "100%")
        chart.setAttribute("height", "100%")
        chart.setAttribute("preserveAspectRatio", "none")
        chart.setAttribute("viewBox", "0 0 " + this.chart.width + " " + this.chart.height)

        var polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        polygon.setAttribute("points", this.chart.points);

        if(this.chart.values.length > 1){
          element.style.width = width
          element.appendChild(chart);
          chart.appendChild(polygon);
        }
      },
      updateMoves:function(move){
        var t = this
        var sound = 'move.mp3'
        var pgn = t.game.pgn()
        t.uciCmd('position startpos moves' + this.get_moves(), this.evaler);
        t.uciCmd("eval", this.evaler);

        if(t.game.game_over()){
          if(t.game.in_draw() || t.game.in_stalemate() || t.game.in_threefold_repetition()) {
            if(t.game.in_stalemate()){
              swal("Tablas", 'Esta partida finalizó en tablas por rey ahogado', "info")
            } else if(t.game.in_threefold_repetition()){
              swal("Tablas", 'Esta partida finalizó en tablas por triple repetición', "info")
            } else {
              swal("Tablas", 'Esta partida finalizó en tablas', "info")
            }
          } else {          
            const winner = t.game.turn() === 'w' ? t.data.black : t.data.white
            swal("¡Victoria!", winner + ' ganó esta partida', "success")
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
            sound = 'check.ogg'
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

          t.findEco(t.game.pgn())
        }
      },
      findEco: function(pgn){
        let t = this
        axios.post('/eco', {pgn:pgn} ).then((res) => {
          if(res.data.eco){
            t.opening = res.data.name
            t.ecode = res.data.eco
          }
        })
      },
      removeHighlight : function() {
        document.getElementById('board').querySelectorAll('.square-55d63').forEach((item) => {
          item.classList.remove('highlight-move')
          item.classList.remove('in-check')
        })
      },
      addHightlight : function(move){
        var t = this
        t.removeHighlight();
        if(move){
          if (t.game.in_check() === true) {
            document.getElementById('board').querySelector('img[data-piece="' + t.game.turn() + 'K"]').parentNode.classList.add('in-check')
          }
          setTimeout(function(){
            document.getElementById('board').querySelector('.square-' + move.from).classList.add('highlight-move');
            document.getElementById('board').querySelector('.square-' + move.to).classList.add('highlight-move');   
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
      showPGN:function(pgn){
        var pgn = this.game.pgn() + ' ' + (this.data.result ? this.data.result : '')
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <div class="control">
        <div class="field">
          <textarea class="textarea" readonly>${pgn}</textarea>
        </div>
      </div>
    </div>
  </div>
</div>`)
        swal({
          title: 'Copiar PGN',
          content: {
            element: 'div',
            attributes: {
              innerHTML: `${template}`,
            }
          }
        })
      }, 
      gameStart: function(){
        this.$root.loading = true
        const pref = JSON.parse(localStorage.getItem('player'))||{}
        axios.post('/game', {id:this.$route.params.game} ).then((res) => {
          if(!Object.keys(res.data).length) return location.href="/404"
          var game = res.data

          this.evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('/static/js/stockfish.js')

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
              t.vscore = 50 - (t.score / 48 * 100)
              t.drawChart()
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

          this.tdisplay.w = this.$root.getTimeDisplay(this.timer.w)

          if(game.btime){
            this.timer.b = parseInt(game.btime)
          } else {
            this.timer.b = parseInt(game.minutes * 60)
          }

          this.tdisplay.b = this.$root.getTimeDisplay(this.timer.b)
          this.startClock()

          this.$root.loading = false

          setTimeout(() => {
            this.boardEl = document.getElementById('board')
            this.$root.fullscreenBoard()
            this.game = new Chess()
            var pos = 'start'

            if(this.data.fen){
              pos = this.data.fen
            }

            var cfg = {
              draggable: false,
              position: pos,
              pieceTheme:'/static/img/chesspieces/wikipedia/{piece}.png'
            }

            if(pref.pieces){
              cfg.pieceTheme = '/static/img/chesspieces/' + pref.pieces + '/{piece}.png'
              this.boardColor = pref.board
              this.$root.checkBoardStyle(pref.pieces)
            }

            this.board = Chessboard('board', cfg)
            this.orientation = this.board.orientation()

            if(this.data.pgn){
              this.game.load_pgn(this.data.pgn)
            }

            $(window).resize(() => {
              this.board.resize()
              this.highlightLastMove()
              this.$root.fullscreenBoard()
            })

            playSound('start.ogg')
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
        this.highlightLastMove()
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
        chart:{
          width: 100,
          height: 50,
          maxValue: 100,
          vSteps: 3,
          points:[],
          values:[],
          measurements:[]
        },
        boardColor:'classic',
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