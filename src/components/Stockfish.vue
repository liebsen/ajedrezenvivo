<template>
  <div class="container is-widescreen">
    <div class="content" v-if="time.level < 0">
      <div class="columns-centered">
        <div class="columns columns-bottom is-flex has-text-centered">
          <div class="column">
            <h3>Jugar contra Stockfish</h3>
            <div class="control">
              <div class="buttons levels has-addons">
                <button class="button is-rounded is-large is-white-pieces" @click="setPlayerColor('white')" :class="{'has-background-warning' : selectedColor==='white'}"></button>
                <button class="button is-large is-random-pieces" @click="setPlayerColor('random')" :class="{'has-background-warning' : selectedColor==='random'}"></button>
                <button class="button is-large is-rounded is-black-pieces" @click="setPlayerColor('black')" :class="{'has-background-warning' : selectedColor==='black'}"></button>
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
                  <span>0</span>
                </button>
                <button class="button" @click="gameStart(2)">
                  <span>1</span>
                </button>
                <button class="button" @click="gameStart(4)">
                  <span>2</span>
                </button>
                <button class="button" @click="gameStart(6)">
                  <span>3</span>
                </button>
                <button class="button" @click="gameStart(8)">
                  <span>4</span>
                </button>
                <button class="button" @click="gameStart(10)">
                  <span>5</span>
                </button>
                <button class="button" @click="gameStart(12)">
                  <span>6</span>
                </button>
                <button class="button" @click="gameStart(14)">
                  <span>7</span>
                </button>
                <button class="button" @click="gameStart(16)">
                  <span>8</span>
                </button>
                <button class="button" @click="gameStart(18)">
                  <span>9</span>
                </button>
                <button class="button is-rounded" @click="gameStart(20)">
                  <span>10</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content column" v-else>
      <div class="columns">
        <div class="column">
          <div class="board-container">
            <div :class="boardColor">
              <h6 class="has-text-left black">
                <span v-show="data.result==='0-1'">🏆</span>
                <span>Stockfish</span> 
                <span>
                  <span>nivel</span> 
                  <span v-html="time.level / 2"></span>
                </span>
                <span class="button is-small thinking"></span>
              </h6>
              <div class="board" :class="{ 'black' : playerColor==='black' }">
                <div class="score-container">
                  <div class="score" :style="'max-height:' + vscore + '%'"></div>
                </div>            
                <div id="board"></div>
              </div>
              <h6 class="has-text-right white">
                <span v-show="data.result==='1-0'">🏆</span>
                <span v-html="$root.player.code"></span> 
              </h6>
            </div>
          </div>
        </div>
        <div class="column datospartida">
          <div class="columns acciones">
            <div class="column">
              <span v-html="ecode" class=""></span> 
              <span v-html="opening" class="has-text-black"></span> 
            </div>
            <div class="column has-text-left">
              <button @click="gameRestart()" class="button is-rounded is-danger" v-if="pgnIndex.length > 0 && !announced_game_over" title="Abandonar partida">
                <span class="icon has-text-white">
                  <span class="fas fa-flag"></span>
                </span>
              </button>
              <button @click="showHint()" class="button is-rounded is-success" v-if="pgnIndex.length > 0 && !announced_game_over" title="Mostrar pista">
                <span class="icon has-text-white">
                  <span class="fas fa-question-circle"></span>
                </span>
              </button>
              <button @click="gameRestart()" class="button is-rounded is-success" v-if="announced_game_over">
                <span>REMATCH</span>
              </button>
            </div>
          </div>  
          <div class="columns gamepgn is-hidden-mobile">
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
</template>


<script>
  import axios from 'axios'
  import Chess from 'chess.js'
  import Chessboard from '../../assets/js/chessboard'
  import snackbar from '../components/Snackbar'
  import playSound from '../components/playSound'
  import swal from 'sweetalert'

  export default {
    name: 'stockfish',
    mounted: function(){
      //this.$root.loading = true
      window.app = this


      if (!Worker || (location && location.protocol === "file:")) {
        var script_tag  = document.createElement("script");
        script_tag.type ="text/javascript";
        script_tag.src  = "/assets/js/stockfish.js";
        script_tag.onload = init;
        document.getElementsByTagName("head")[0].appendChild(script_tag);
      }

      axios.get('/assets/json/eco_es.json')
        .then((response)=>{
        this.eco = response.data
      })
    },
    methods: {
      gameRestart: function() {
        var t = this
        t.game.reset()
        t.announced_game_over = false
        t.pgnIndex = []
        t.ecode = ''
        t.opening = ''
        t.score = 0.10
        t.vscore = 49
        t.stockfishMoved = false
        t.gameStart(t.time.level)
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
        
        t.engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('/assets/js/stockfish.js');
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
                  document.querySelector('.thinking').classList.remove('is-loading')
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
              var score = parseInt(match[2]) * (t.game.turn() == 'w' ? 1 : -1);
              /// Is it measuring in centipawns?
              if(match[1] == 'cp') {
                t.engineStatus.score = (score / 100.0).toFixed(2);
              /// Did it find a mate?

              } else if(match[1] == 'mate') {
                const abs = Math.abs(score) - 1
                t.engineStatus.score = abs > 0 ? 'Mate en ' + abs : "Mate"
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
            },t.ucitime)
          } 
        }
        
        t.uciCmd('uci')
        t.setSkillLevel(level)

        setTimeout(() => {
          t.boardEl = document.getElementById('board')
          t.game = new Chess()

          if(window.innerWidth < 789){
            t.boardCfg.draggable = false 
          }
          if(pref.pieces){
            t.boardCfg.pieceTheme = '/assets/img/chesspieces/' + pref.pieces + '/{piece}.png'
            t.boardColor = pref.pieces
          }

          t.board = Chessboard('board', t.boardCfg)
          t.board.orientation(t.playerColor)  

          if(t.playerColor==='white'){
            t.data.white = t.$root.player.code
            t.data.black = 'Stockfish'
          } else {
            t.data.white = 'Stockfish'
            t.data.black = t.$root.player.code
          }

          // resize event handling
          $(window).resize(() => {
            t.board.resize()
            t.boardTaps()
          })

          t.$root.loading = false
          playSound('game-start.mp3')
          t.boardTaps()
        },100)
      },   
      boardTaps:function(){
        var t = this
        var events = ['click', 'touchstart']
        document.querySelectorAll('.square-55d63').forEach(item => {
          events.forEach(event => {
            item.addEventListener(event, element => {
              const src = element.target.getAttribute('src')
              const piece = element.target.getAttribute('data-piece')
              const target = src ? element.target.parentNode : element.target
              const square = target.id.substring(0,2)
              if(!t.moveFrom){
                if(piece && piece[0]!=t.playerColor[0]) return
                if(!src){ // blank square
                  t.removeHighlight()
                  return
                } 
                target.classList.add('highlight-move')
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

                t.board.position(t.game.fen())
                t.updateMoves(move)

                setTimeout(() => {
                  this.prepareMove()
                },this.ucitime)                
              }
            })
          })
        })
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
      prepareMove : function() {
        var t = this
        document.querySelector('.thinking').classList.add('is-loading')
        if(!t.game.game_over()) {
          t.isEngineRunning = true
          t.uciCmd('position startpos moves' + t.get_moves())
          t.uciCmd("go " + (t.time.depth ? "depth " + t.time.depth : ""))          
        }
      },  
      showHint: function(){
        this.hintMode = true
        this.isEngineRunning = false
        this.uciCmd('position startpos moves' + this.get_moves());
        this.uciCmd("go " + (this.time.depth ? "depth " + this.time.depth : ""));
      },
      removeHighlight: function(){
        document.querySelectorAll('.square-55d63').forEach((item) => {
          item.classList.remove('highlight-move')
          item.classList.remove('in-check')
        })
      },
      updateMoves:function(move){
        var t = this
        var sound = 'move.mp3'

        if(t.game.game_over()){
          if(t.game.turn() === t.playerColor[0]){
            swal({
              title: "Stockfish ganó la partida",
              text: '¿Deseas jugar otra vez?',
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
            swal({
              title: "¡Ganaste!",
              text: 'Venciste a Stockfish. ¡Felicitaciones! ¿Deseas jugar otra vez?',
              icon: "success",
              buttons: ["No", "Sí"]
            })
            .then(accept => {
              if (accept) {
                t.gameRestart()
              } else {
                console.log('Clicked on cancel')
              }
            })
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
        }

        t.removeHighlight()
        playSound(sound)

        document.querySelector('.square-' + move.from).classList.add('highlight-move')
        document.querySelector('.square-' + move.to).classList.add('highlight-move')

        if (t.game.in_check() === true) {
          document.querySelector('img[data-piece="' + t.game.turn() + 'K"]').parentNode.classList.add('in-check')
        }

        const game_pgn = t.game.pgn()
        t.pgnIndex = this.gamePGNIndex(game_pgn)

        setTimeout(() => {
          const movesTable = document.querySelector(".movesTableContainer")
          movesTable.scrollTop = movesTable.scrollHeight
        },1)

        if(t.game.history().length < 14){
          setTimeout(() => {
            t.eco.forEach((eco,i) => {
              if(eco.pgn === t.game.pgn()){
                this.opening = eco.name
                this.ecode = eco.eco
              }
            })
          },1000)
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
          skill = 0;
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

        t.score = t.engineStatus.score
        t.vscore = 50 - (t.engineStatus.score / 20 * 100)
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
        this.uciCmd('position startpos moves' + this.get_moves())
        this.uciCmd("go " + (this.time.depth ? "depth " + this.time.depth : ""))
        this.moveFrom = null
        this.updateMoves(move)

        setTimeout(() => {
          this.prepareMove()
        },this.ucitime)
      },
      onSnapEnd: function() {
        this.board.position(this.game.fen(),false);
      }
    },
    data () {
      return {
        boardCfg: {
          showErrors:true,
          position: 'start',
          draggable: true,
          //onDragStart: this.onDragStart,
          onDrop: this.onDrop,
          onSnapEnd: this.onSnapEnd,
          pieceTheme:'/assets/img/chesspieces/classic/{piece}.png'
        },
        time: {
          level: -1
        },
        displayScore: true,
        score:0.10,
        vscore: 49,
        moveFrom:null,
        hintMode: false,
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