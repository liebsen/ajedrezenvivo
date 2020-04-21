<template>
  <div class="container is-widescreen">
    <div class="content" v-show="time.level < 0">
      <div class="columns-centered fadeIn">
        <div class="columns columns-bottom is-flex has-text-centered">
          <div class="column">
            <h3>Jugar contra Stockfish</h3>
            <div class="control">
              <div class="buttons levels has-addons preservefilter">
                <button class="button is-rounded is-large is-white-pieces" @click="setPlayerColor('white')" :class="{'has-background-success' : selectedColor==='white'}"></button>
                <button class="button is-large is-random-pieces" @click="setPlayerColor('random')" :class="{'has-background-success' : selectedColor==='random'}"></button>
                <button class="button is-large is-rounded is-black-pieces" @click="setPlayerColor('black')" :class="{'has-background-success' : selectedColor==='black'}"></button>
              </div>
            </div>
          </div>
        </div>
        <div class="columns is-flex has-text-centered">
          <div class="column">
            <h4>Nivel</h4>
            <div class="control has-text-centered column">
              <div class="buttons levels has-addons">
                <button class="button is-rounded" @click="gameStart(0)">
                  <span>Niño</span>
                </button>
                <button class="button" @click="gameStart(4)">
                  <span>Novato</span>
                </button>
                <button class="button" @click="gameStart(8)">
                  <span>Principiante</span>
                </button>
                <button class="button" @click="gameStart(12)">
                  <span>Intermedio</span>
                </button>
                <button class="button" @click="gameStart(16)">
                  <span>Avanzado</span>
                </button>
                <button class="button is-rounded" @click="gameStart(20)">
                  <span>GM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content" v-show="time.level > -1">
      <div class="columns is-marginless-top fadeIn" :class="boardColor">
        <div class="column">
          <div class="board-container">
            <h6 class="has-text-left black is-hidden-mobile">
              <span v-show="data.result==='0-1'">🏆</span>
              <span>Stockfish</span> 
              <span>
                <span>nivel</span> 
                <span v-html="time.level / 2"></span>
              </span>
              <span class="button is-small thinking" :class="{'is-loading' : thinking}"></span>
            </h6>
            <div class="board preservefilter" :class="{ 'black' : playerColor==='black' }">
              <div class="score-container">
                <div class="score" :style="'max-height:' + vscore + '%'"></div>
              </div>            
              <div id="board"></div>
            </div>
            <h6 class="has-text-right white is-hidden-mobile">
              <span v-show="data.result==='1-0'">🏆</span>
              <span class="icon">
                <span v-html="player.flag"/>
              </span>
              <span v-html="player.code"></span> 
            </h6>
          </div>
        </div>
        <div class="column">
          <div class="board-assistant">
            <div class="columns has-text-centered" v-show="pgnIndex.length">
              <div class="column preservefilter">
                <button @click="askForRematch()" class="button is-small is-rounded is-danger" v-if="!announced_game_over" title="Abandonar partida">
                  <span class="icon has-text-white">
                    <span class="fas fa-flag"></span>
                  </span>
                </button>
                <button @click="showHint()" class="button is-small is-rounded is-warning" v-if="pgnIndex.length && !announced_game_over" title="Mostrar pista">
                  <span class="icon has-text-white">
                    <span class="fas fa-question-circle"></span>
                  </span>
                </button>
                <button @click="askForRematch()" class="button is-small is-rounded is-success" v-if="announced_game_over" title="Jugar de nuevo">
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
                <strong v-html="ecode"></strong> 
                <span v-html="opening" class="has-text-black"></span> 
              </div>
            </div>
            <div class="columns is-hidden-mobile">
              <div class="chart-container preservefilter">
                <div :class="playerColor">
                  <div class="chart-indicator"></div>
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
                      <a :class="'moveindex m' + (move.i-2)" @click="gamePos(move.i-2)">
                        <span v-html="move.white"></span>
                      </a>
                    </div>

                    <div class="moveCell moveSAN moveb" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                      <a :class="'moveindex m' + (move.i-1)" @click="gamePos(move.i-1)">
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
</template>

<script>
  import axios from 'axios'
  import { mapState } from 'vuex'
  import Chess from 'chess.js'
  import Chessboard from '../../static/js/chessboard'
  import snackbar from '../components/Snackbar'
  import playSound from '../components/playSound'
  import swal from 'sweetalert'

  export default {
    name: 'stockfish',
    mounted: function(){
      window.app = this
      // const saved = JSON.parse(localStorage.getItem('player'))

      document.getElementById('board').addEventListener("wheel", event => {
        this.gamePos(Math.sign(event.deltaY)<0?this.index+1:this.index-1)
      })

      if (!Worker || (location && location.protocol === "file:")) {
        var script_tag  = document.createElement("script");
        script_tag.type ="text/javascript";
        script_tag.src  = "/static/js/stockfish.js";
        script_tag.onload = init;
        document.getElementsByTagName("head")[0].appendChild(script_tag);
      }

      let pieces = ['.is-white-pieces','.is-black-pieces','.is-random-pieces']
      pieces.forEach(tag => {
        let e = document.querySelector(tag)
        let li = window.getComputedStyle(e);
        e.style.backgroundImage = li.getPropertyValue('background-image').split('classic').join(this.player.pieces)
      })
    },
    computed: {
      ...mapState([
        'player'
      ])
    },
    methods: {
      gameRestart: function(){
        var t = this
            t.game.reset()
            t.announced_game_over = false
            t.pgnIndex = []
            t.time.level = -1
            t.ecode = ''
            t.opening = ''
            t.index = -1
            t.score = 0.10
            t.vscore = 49
            t.stockfishMoved = false
            t.chart.values = [51]
            document.querySelector('.chart').textContent = ''
      },
      askForRematch: function() {
        var t = this
        swal({
          title: 'Reiniciar partida',
          text: '¿Querés reiniciar esta partida?',
          buttons: ["No", "Sí"]
        })
        .then(accept => {
          if (accept) {
            t.gameRestart()
          } else {
            console.log('Clicked on cancel')
          }
        })
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
      gamePos:function(pos){
        if(pos > Object.keys(this.gameMoves).length - 1||pos < 0){ //||!this.announced_game_over
          return
        }

        this.index = pos
        const moves = this.gameMoves.slice(0,this.index)
        var move = this.gameMoves[this.index].san;
        this.vscore = this.gameMoves[this.index].vscore

        // ---------------
        var pgn = []
        moves.forEach((move,i) => {
          if(i%2){
            pgn.push(move.san)
          } else {
            pgn.push([Math.ceil(i/2)+1,move.san].join('. '))     
          }   
        })


        const pgns = pgn.join(' ')
        this.game.reset()
        this.game.load_pgn(pgns) 
        
        const moved = this.game.move(move)
        this.board.position(this.game.fen())
        this.updateMoveList()
        this.drawChartPosition()

        setTimeout(() => {
          if(moved){
            this.moveSound(moved)
            this.addHightlight(moved)
          }
        },250)
      },
      drawChartPosition: function(draw){
        if(draw===undefined) draw = true
        if(!draw){
          document.querySelector('.chart-indicator').style.backgroundColor = 'transparent' 
        } else {
          document.querySelector('.chart-indicator').style.left = ((this.index + 1) / this.gameMoves.length * 100) + '%'
          document.querySelector('.chart-indicator').style.backgroundColor = 'rgb(0,0,0,0.15)'
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
      uciCmd: function(cmd, which) {
        //console.log("UCI: " + cmd);
        (which || this.engine).postMessage(cmd);
      },    
      gameStart: function(level){

        var t = this
        const pref = JSON.parse(localStorage.getItem('player'))||{}
        
        t.engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('/static/js/stockfish.js');
        t.engineStatus = {};

        t.engine.onmessage = function(event) {
          var line;
          var t = window.app
          
          if (event && typeof event === "object") {
            line = event.data;
          } else {
            line = event;
          }
          //console.log(line)
          if(line == 'uciok') {
            t.engineStatus.engineLoaded = true;
          } else if(line == 'readyok') {
            t.engineStatus.engineReady = true;
          } else {
            var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);

            /// Did the AI move?

            if(match) {
              if(t.hintMode || t.isEngineRunning) {
                const move = t.game.move({from: match[1], to: match[2], promotion: match[3]});
                if(!t.hintMode){
                  t.board.position(t.game.fen())
                  t.updateMoves(move)
                } else {
                  document.querySelector('.square-' + move.from).classList.add('highlight-move')
                  document.querySelector('.square-' + move.to).classList.add('highlight-move')
                  t.game.undo()
                  t.hintMode = false
                }
                t.isEngineRunning = false
              }
              /// Is it sending feedback?
            } else if(match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
              t.engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2];
            }
            
            /// Is it sending feed back with a score?
            if(match = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {
              var score = parseFloat(match[2]) * (t.game.turn() == 'w' ? 1 : -1);
              /// Is it measuring in centipawns?
              if(match[1] == 'cp') {
                t.engineStatus.score = (score / 100.0).toFixed(2);
              /// Did it find a mate?

              } else if(match[1] == 'mate') {
                //const abs = Math.abs(score) - 1
                //t.engineStatus.score = abs > 0 ? 'Mate en ' + abs : "Mate"
              }

              /// Is the score bounded?
              if(match = line.match(/\b(upper|lower)bound\b/)) {
                t.engineStatus.score = ((match[1] == 'upper') == (t.game.turn() == 'w') ? '<= ' : '>= ') + t.engineStatus.score
              }
              if(!t.hintMode){
                t.displayStatus()
              }
            }
          }

          if(t.engineStatus.engineLoaded && t.playerColor==='black' && !t.hintMode && !t.stockfishMoved){
            setTimeout(() => {
              t.stockfishMoved = true
              t.prepareMove()
            },t.ucitime * 3)
          } 
        }
        
        t.uciCmd('uci')
        t.setSkillLevel(level)

        setTimeout(() => {
          t.boardEl = document.getElementById('board')
          t.$root.fullscreenBoard()
          t.game = new Chess()

          if(window.innerWidth < 789){
            t.boardCfg.draggable = false 
          }

          if(pref.pieces){
            t.boardCfg.pieceTheme = '/static/img/chesspieces/' + pref.pieces + '/{piece}.png'
            t.boardColor = pref.board
            t.$root.checkBoardStyle(pref.pieces)
          }

          t.board = Chessboard('board', t.boardCfg)
          t.board.orientation(t.playerColor)  

          if(t.playerColor==='white'){
            t.data.white = t.player.code
            t.data.whiteflag = t.player.flag
            t.data.black = 'Stockfish'
          } else {
            t.data.white = 'Stockfish'
            t.data.blackflag = t.player.flag
            t.data.black = t.player.code
          }

          // resize event handling

          $(window).resize(() => {
            t.$root.fullscreenBoard()
            t.board.resize()
            t.highlightLastMove()
            t.boardTaps()
          })

          t.$root.loading = false
          playSound('start.ogg')
          t.boardTaps()
        },100)
      },   
      boardTaps:function(){
        var t = this
        const events = ['click', 'mousedown']
        events.forEach((event) => {
          document.querySelector('.chessboard-63f37').addEventListener(event, e => {
            e.preventDefault()
            const turn = t.game.turn() === t.playerColor[0]
            const piece = e.target.getAttribute('data-piece')

            if(!turn) return
            if(e.target.classList.contains('row-5277c')||e.target.classList.contains('board-b72b1')) return

            const src = e.target.getAttribute('src')
            const target = src ? e.target.parentNode : e.target
            const square = target.id.substring(0,2)

            if(!t.moveFrom){
              if(piece && piece[0] != t.playerColor[0]) return 
              target.classList.add('highlight-move')  
              if(!src){ // blank square
                t.removeHighlight()
                return
              } 
              
              t.moveFrom = square
            } else {
              if(square === t.moveFrom) return
              var moveObj = ({
                from: t.moveFrom,
                to: square,
                promotion: 'q' // NOTE: always promote to a queen for example simplicity
              });

              t.moveFrom = null
              var move = t.game.move(moveObj)

              // illegal move
              if (move === null) {
                t.removeHighlight()
                t.moveFrom = square
                if(src){
                  target.classList.add('highlight-move')
                }
                return 'snapback'
              }

              t.board.position(t.game.fen(),false)
              t.updateMoves(move)

              setTimeout(() => {
                this.prepareMove()
              },this.ucitime)                
            }
          })
        })
      },      
      moveList: function()
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
      prepareMove : function() {
        var t = this
        if(!t.game.game_over()) {
          t.thinking = true
          t.isEngineRunning = true
          t.uciCmd('position startpos moves' + t.moveList())
          t.uciCmd("go " + (t.time.depth ? "depth " + t.time.depth : ""))          
        }
      },  
      showHint: function(){
        this.hintMode = true
        this.isEngineRunning = false
        this.uciCmd('position startpos moves' + this.moveList());
        this.uciCmd("go " + (this.time.depth ? "depth " + this.time.depth : ""));
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
      drawChart: function(index){
        let score = this.vscore
        if(this.playerColor === 'white'){
          score = 100 - score;
        }

        if(score < 0) {
          score = 0
        }

        if(score > 100) {
          score = 100
        }

        if(!isNaN(score)){
          this.drawChartPosition(false)
          this.chart.values = this.chart.values.slice(0,index)
          this.chart.values[index] = score
          this.updateChart()
        }
      },
      updateChart: function(){
        this.calcPoints()

        var element = document.getElementsByClassName("chart")[0]
        element.innerHTML = ""

        var width = document.querySelector(".movesTableContainer").clientWidth + 'px'
        var chart = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        chart.setAttribute("width", "100%")
        chart.setAttribute("height", "100%")
        chart.setAttribute("preserveAspectRatio", "none")
        chart.setAttribute("viewBox", "0 0 " + this.chart.width + " " + this.chart.height)

        var polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon')
        polygon.setAttribute("points", this.chart.points)
        element.style.width = width

        if(this.chart.values.length > 1){
          element.appendChild(chart);
          chart.appendChild(polygon);
        }
      },
      moveSound: function(move){
        var sound = 'move.mp3'
        let t = this
        if(t.game.game_over()){

          if(t.game.in_draw() || t.game.in_stalemate() || t.game.in_threefold_repetition()){
            sound = 'game-end.mp3'
          } else if(t.game.turn() === t.playerColor[0]){
            sound = 'defeat.mp3'
          } else {
            sound = 'victory.mp3'
          }

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

          if (this.game.in_check() === true) {
            sound = 'check.ogg'
          }
        }

        playSound(sound)
      },
      removeHighlight: function(){
        document.getElementById('board').querySelectorAll('.square-55d63').forEach((item) => {
          item.classList.remove('highlight-move')
          item.classList.remove('in-check')
        })
      },
      addHightlight : function(move){
        var t = this
        t.removeHighlight()
        if(move){
          if (t.game.in_check() === true) {
            setTimeout(() => {
              document.getElementById('board').querySelector('img[data-piece="' + t.game.turn() + 'K"]').parentNode.classList.add('in-check')
            },200)
          }
          document.getElementById('board').querySelector('.square-' + move.from).classList.add('highlight-move');
          document.getElementById('board').querySelector('.square-' + move.to).classList.add('highlight-move');   
        }
      },
      highlightLastMove: function(){
        var history = this.game.history({verbose:true})
        if(history.length){
          var move = history[history.length-1]
          this.addHightlight(move)
        }
      },
      updateMoves:function(move){
        var t = this
        if(t.game.game_over()){
          if(t.game.in_draw() || t.game.in_stalemate() || t.game.in_threefold_repetition()){
            swal({
              title: "Esta partida finalizó en tablas",
              text: '¿Querés la revancha?',
              buttons: ["No", "Sí"]
            }).then(accept => {
              if (accept) {
                t.gameRestart()
              } else {
                console.log('Clicked on cancel')
              }
            })
          } else {
            setTimeout(() => {
              if(t.game.turn() === t.playerColor[0]){
                swal({
                  title: "Stockfish ganó esta partida",
                  text: '¿Querés la revancha?',
                  buttons: ["No", "Sí"]
                })
                .then(accept => {
                  if (accept) {
                    t.gameRestart()
                  } else {
                    console.log('Clicked on cancel')
                  }
                })
              } else {
                swal('¡Felicitaciones! Venciste a Stockfish', {
                  buttons: {
                    cancel: 'Cancelar',
                    catch: {
                      text: 'Jugar de nuevo',
                      value: 'catch',
                    },
                    defeat: 'Guardar partida',
                  },
                }).then((value) => {
                  switch (value) {
                 
                    case "defeat":
                      let opponent = 'Stockfish nivel ' + (this.time.level / 2)
                      let white = this.playerColor==='white' ? this.player.code : opponent
                      let black = this.playerColor==='black' ? this.player.code : opponent
                      let whiteflag = this.playerColor==='white' ? this.player.flag : ''
                      let blackflag = this.playerColor==='black' ? this.player.flag : ''
                      let result = this.playerColor==='white'?'1-0':'0-1'
                      let game = {
                        event: 'Jugá contra Stockfish',
                        white: white,
                        black: black,
                        whiteflag: whiteflag,
                        blackflag: blackflag,
                        result: result,
                        score: this.chart.values,
                        eco: this.ecode,
                        opening: this.opening,
                        orientation: this.board.orientation(),
                        pgn: this.game.pgn()
                      }

                      axios.post('/game/save', game).then((res) => {
                        if (res.data.status === 'success') {
                          this.$store.dispatch('games', res.data)
                          swal("Guardado", 'La partida se guardó correctamente')
                        } else {
                          snackbar('danger','La partida no pudo ser guardada')
                        }        
                      })
                      break;
                 
                    case "catch":
                      this.gameRestart()
                      break;
                 
                    default:
                      swal.close()
                  }
                })
              }
            },1000)
          }
          t.announced_game_over = true
        }

        t.pgnIndex = this.gamePGNIndex(t.game.pgn())
        t.index++
        t.gameMoves = t.gameMoves.slice(0,t.index)

        setTimeout(() => {
          const index = t.index
          t.gameMoves[t.index] = {
            san: move.san,
            vscore: t.vscore
          }
          t.addHightlight(move)
          t.moveSound(move)
          t.updateMoveList()
          setTimeout(() => {
            t.drawChart(index)
          },250)
        },250)

        t.thinking = false
        t.findEco(t.game.pgn())
      },
      findEco: function(pgn){
        let t = this
        axios.post('/eco/pgn', {pgn:pgn} ).then((res) => {
          if(res.data.eco){
            t.opening = res.data.name
            t.ecode = res.data.eco
          }
        })
      },
      updateMoveList: function(){
        const movesTable = document.querySelector(".movesTableContainer")
        const current = document.querySelector('.moveindex.m' + this.index)
        if(current.parentNode.offsetTop + current.parentNode.clientHeight > movesTable.clientHeight){
          movesTable.scrollTop = current.parentNode.offsetTop
        } else {
          movesTable.scrollTop = 0
        }
        document.querySelectorAll('.moveindex').forEach((item) => {
          item.parentNode.classList.remove('active')
        })
        document.querySelector('.moveindex.m' + this.index).parentNode.classList.add('active')
      },
      gamePGNIndex:function(pgn){
        var data = []
        , index = 0
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
      setPlayerColor:function(color){
        this.selectedColor = color
        if(color==='random'){
          const allow = ['white','black']
          if(!allow[color]){
            color = allow[Math.floor(Math.random() * allow.length)]
          }
        }
        this.playerColor = color
      },
      setSkillLevel: function(skill) {
        var t = this
        var max_err,
          err_prob,
          difficulty_slider;
        
        if (skill < 0) {
          return 
        }
        if (skill > 20) {
          skill = 20;
        }
        
        t.time.level = skill;
        
        /// Change thinking depth allowance.
        if (skill < 5) {
          t.time.depth = "1";
        } else if (skill < 10) {
          t.time.depth = "5";
        } else if (skill < 15) {
          t.time.depth = "10";
        } else {
          /// Let the engine decide.
          t.time.depth = "";
        }
        
        t.uciCmd('setoption name Skill Level value ' + skill);
        ///NOTE: Stockfish level 20 does not make errors (intentially), so these numbers have no effect on level 20.
        /// Level 0 starts at 10
        max_err = Math.round((skill * -0.5) + 300);
        //max_err = Math.round((skill * -0.25) + 5);

        /// Level 0 starts at 1
        err_prob = Math.round((skill * 6.35) + 5);

        t.uciCmd('setoption name Skill Level Maximum Error value ' + max_err);
        t.uciCmd('setoption name Skill Level Probability value ' + err_prob);
      },
      displayStatus: function() {
        var t = this
        var status = 'Motor: ';
        if(!t.engineStatus.engineLoaded) {
          status += 'Cargando...';
        } else if(!t.engineStatus.engineReady) {
          status += 'Cargado';
        } else {
          status += 'Listo';
        }

        if(t.engineStatus.search) {
          status += '<br>' + t.engineStatus.search;
          if(t.engineStatus.score && t.displayScore) {
            status += (t.engineStatus.score.substr(0, 4) === "Mate" ? " " : ' Score: ') + t.engineStatus.score;
          }
        }

        t.score = t.engineStatus.score.split(' ').reverse()[0]
        t.vscore = 50 - (t.score / 48 * 100)
      },
      onDragStart : function(source, piece, position, orientation) {
        var re = this.playerColor == 'white' ? /^b/ : /^w/
        if (this.game.game_over() ||
          piece.search(re) !== -1) {
          return false;
        }
      },
      onDrop : function(source, target) {
        var move = this.game.move({
          from: source,
          to: target,
          promotion: 'q'
        })

        if (move === null) return 'snapback'

        this.isEngineRunning = false
        this.uciCmd('position startpos moves' + this.moveList())
        this.uciCmd("go " + (this.time.depth ? "depth " + this.time.depth : ""))
        this.moveFrom = null
        this.updateMoves(move)

        setTimeout(() => {
          this.prepareMove()
        },this.ucitime)
      },
      onSnapEnd: function() {
        setTimeout(() => {
          this.board.position(this.game.fen(),false)
        },100)
      }
    },
    data () {
      return {
        boardCfg: {
          position: 'start',
          draggable: true,
          onDragStart: this.onDragStart,
          onDrop: this.onDrop,
          onSnapEnd: this.onSnapEnd,
          pieceTheme:'/static/img/chesspieces/classic/{piece}.png'
        },
        chart:{
          width: 100,
          height: 50,
          maxValue: 100,
          values:[51],
          points:[]          
        },
        time: {
          level: -1
        },
        index:-1,
        gameMoves:[],
        displayScore: true,
        score:0.10,
        vscore: 49,
        moveFrom:null,
        hintMode: false,
        thinking: false,
        isEngineRunning: false,
        engineStatus:{},
        announced_game_over:false,
        playerColor:'white',
        selectedColor:'white',
        data:{
          white:null,
          black:null
        },
        eco:{},
        ecode:null,
        opening:null,
        board:null,
        boardColor:'',
        game:null,
        pgnIndex:[],
        stockfishMoved:false,
        ucitime: 1000
      }
    }
  }
</script>