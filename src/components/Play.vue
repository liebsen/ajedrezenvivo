<template>
  <div>
    <div class="status">
    </div>  
    <div class="container">
      <div class="content column">
        <div class="columns">
          <div class="column">
            <div class="board-container">
              <h6 class="has-text-left black">
                <span v-show="data.result==='0-1'">🏆</span>
                <span v-show="data.black === $root.player.code" v-html="data.white"></span> 
                <span v-show="data.white === $root.player.code" v-html="data.black"></span> 
                <span class="has-text-grey" v-html="data.blackelo"></span>
              </h6>
              <div class="board" :class="{ 'black' : playerColor === 'black' }">
                <div class="score-container">
                  <div class="score" :style="'max-height:' + vscore + '%'"></div>
                </div>            
                <div id="board"></div>
              </div>
              <h6 class="has-text-right white">
                <span v-show="data.result==='1-0'">🏆</span>
                <span v-show="data.black === $root.player.code" v-html="data.black"></span> 
                <span v-show="data.white === $root.player.code" v-html="data.white"></span> 
                <span class="has-text-grey" v-html="data.whiteelo"></span>                  
              </h6>
            </div>
          </div>
          <div class="column datospartida">
            <!--h5 class="has-text-black">♛ Datos de la partida</h5-->
            <div v-if="Object.keys(data).length">
              <div class="columns">
                <div class="column">
                  <span v-html="ecode" class=""></span> 
                  <span v-html="opening" class="has-text-black"></span>
                </div>
                <div class="column has-text-left">
                  <button @click="gameCapitulate()" class="button is-rounded is-danger" v-if="pgnIndex.length > 0" title="Abandonar partida">
                    <span class="icon has-text-white">
                      <span class="fas fa-flag"></span>
                    </span>
                  </button>
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
              <div class="columns">
                <div class="column" v-show="data.date && data.date !='?'">
                  <span class=""  v-html="data.date"></span>
                </div>
                <div class="column" v-show="data.event && data.event !='?'">
                  <span class="" v-html="data.event"></span>
                </div>
                <div class="column" v-show="data.round && data.round !='?'">
                  <span class="" v-html="data.round"></span>
                </div>
                <div class="column" v-show="data.site && data.site !='?'">
                  <span class=""  v-html="data.site"></span>
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
    name: 'play',
    mounted: function(){
      this.$root.loading = true
      window.app = this
      window.addEventListener('beforeunload', this.beforeunload)
      axios.get('/assets/json/eco_es.json')
        .then((response)=>{
          this.eco = response.data
        })

      this.$socket.emit('join',this.$route.params.game)
      this.$socket.emit('resume',this.$root.player)
      this.gameStart()
    },
    beforeDestroy: function() {
      this.$socket.emit('gone', this.$root.player)
    },
    sockets: {
      resume: function(data) {
        if(data.code != this.$root.player.code){
          snackbar("success", '👤 ' + data.code + ' se unió a la partida')
        }
      },
      gone: function(data) {
        snackbar("error", '👤 ' + data.code + ' abandonó la partida')
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
          swal("Partida declinada", 'Lamentablemente 👤 ' + data.player + ' declinó la partida')
        }
      },
      invite: function(data) {
        var t = this
        if(data.player === this.$root.player.code){
          swal.close()
          swal({
            title: "¿Aceptás la partida?",
            text: '👤 ' + data.asker + ' solicita una revancha',
            buttons: ["Declinar", "Aceptar"]
          })
          .then(accept => {
            if (accept) {
              axios.post( this.$root.endpoint + '/create', {
                white: (t.playerColor==='white'?data.asker:data.player),
                black: (t.playerColor==='white'?data.player:data.asker),
                minutes: 10,
                broadcast: true
              } ).then((response) => {
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
              t.$socket.emit('reject', data)
              console.log('Clicked on cancel')
            }
          })
        }
      },
      move: function(data){
        var t = this
        if(data.color != t.playerColor[0]) {
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
          //snackbar('success', 'Opponent moved: ' + data.to)
        }
      },
      capitulate: function(data){
        var t = this
        if(data.asker === this.$root.player.code){
          swal({
            title: '¿Deseas la revancha?',
            text: 'Has capitulado. ' + t.opponentName + ' ganó la partida',
            buttons: ["No", "Sí"]
          })
          .then(accept => {
            if (accept) {
              this.$socket.emit('invite', {
                asker:this.$root.player.code,
                player:t.opponentName
              })
            } else {
              console.log('Clicked on cancel')
            }
          })
        } else {
          t.$socket.emit('data',{
            id:this.$route.params.game,
            result:(t.playerColor==='white'?'1-0':'0-1')
          })
          swal("¡Felicitaciones!", 'Has vencido a ' + t.opponentName, "success")
        }
        
        t.announced_game_over = true
        playSound('game-end.mp3')
      }
    },
    methods: {
      beforeunload: function handler(event) {
        this.$socket.emit('gone', this.$root.player)
      },      
      uciCmd: function(cmd, which) {
        //console.log("UCI: " + cmd);
        (which || this.evaler).postMessage(cmd);
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
      gameCapitulate: function(){
        console.log("capitulate")
        this.$socket.emit('capitulate', {
          asker:this.$root.player.code,
          player:this.opponentName
        })
      },
      gameAskForDraw: function(){
        this.$socket.emit('askfordraw', {
          asker:this.$root.player.code,
          player:this.opponentName
        })
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
      gameStart: function(){
        this.$root.loading = true
        const pref = JSON.parse(localStorage.getItem('player'))||{}
        var t = this
        axios.post( t.$root.endpoint + '/game',{
          id:this.$route.params.game
        }).then((res) => {
          if(!Object.keys(res.data).length) {
            return snackbar('error','Hubo un error al crear partida.')
          }

          var game = res.data
          var pgn = game.pgn || ''
          t.gameMoves = t.gamePGN(pgn)
          t.data = game
          if(game.white === t.$root.player.code){
            t.playerColor = 'white'
            t.opponentName = game.black
          } else if(game.black === t.$root.player.code){
            t.playerColor = 'black'
            t.opponentName = game.white
          }

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

          setTimeout(() => {
            t.game = new Chess()

            var pos = 'start'

            if(game.fen){
              pos = game.fen
            }

            var cfg = {
              draggable: true,
              position: pos,
              onDragStart: t.onDragStart,
              onDrop: t.onDrop,
              onSnapEnd: t.onSnapEnd,
              pieceTheme:'/assets/img/chesspieces/wikipedia/{piece}.png'
            };

            if(pref.pieces){
              cfg.pieceTheme = '/assets/img/chesspieces/' + pref.pieces + '/{piece}.png'
            }

            if(window.innerWidth < 789){
              cfg.draggable = false 
            }

            if(game.pgn){
              t.game.load_pgn(game.pgn)
            }

            t.boardEl = document.getElementById('board')
            t.board = Chessboard('board', cfg)      
            t.board.orientation(t.playerColor)

            $(window).resize(() => {
              t.board.resize()
            })

            t.board.resize()
            t.$root.loading = false
            playSound('game-start.mp3')
            t.boardTaps()

            if(game.pgn){
              t.pgnIndex = this.gamePGNIndex(game.pgn)
              document.querySelector('.square-' + game.from).classList.add('highlight-move')
              document.querySelector('.square-' + game.to).classList.add('highlight-move')
            }

            t.gameLoaded = true

          },100)
        })
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
                move.id = t.$route.params.game
                move.fen = t.game.fen()
                move.pgn = t.game.pgn()
                move.turn = t.game.turn()
                t.$socket.emit('move', move)
              }
            })
          })
        })
      },
      onDragStart : function(source, piece, position, orientation) {
        var t = this
        if (t.game.game_over() === true ||
            (t.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (t.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
          return false;
        }
      },
      onDrop : function(source, target) {
        var t = this
        //move object
        var moveObj = ({
          from: source,
          to: target,
          promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // see if the move is legal
        var move = t.game.move(moveObj)

        // illegal move
        if (move === null) {
          return 'snapback';
        }

        t.moveFrom = null
        t.updateMoves(move)
        move.id = this.$route.params.game
        move.fen = t.game.fen()
        move.pgn = t.game.pgn()
        move.turn = t.game.turn()
        t.$socket.emit('move', move)
      },
      onSnapEnd : function() {
        this.board.position(this.game.fen());
      },
      updateMoves:function(move){
        var t = this
        var sound = 'move.mp3'

        this.uciCmd('position startpos moves' + this.get_moves(), this.evaler);
        this.uciCmd("eval", this.evaler);

        if(t.game.game_over()){
          if(t.game.turn() === t.playerColor[0]){
            swal({
              title: '¿Deseas la revancha?',
              text: t.opponentName + ' ganó la partida',
              buttons: ["No", "Sí"]
            })
            .then(accept => {
              if (accept) {
                this.$socket.emit('invite', {
                  asker:this.$root.player.code,
                  player:t.opponentName
                })
              } else {
                console.log('Clicked on cancel')
              }
            })
          } else {
            t.$socket.emit('data',{
              id:this.$route.params.game,
              result:(t.playerColor==='white'?'1-0':'0-1')
            })
            swal("¡Felicitaciones!", 'Has vencido a ' + t.opponentName, "success")
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
        
        t.pgnIndex = this.gamePGNIndex(t.game.pgn())

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
      },
      gameRestart: function() {
        var t = this
        t.game.reset()
        t.announced_game_over = false
        t.pgnIndex = []
        t.ecode = ''
        t.opening = ''
        t.status = ''
        //t.uciCmd('setoption name Contempt value 0')
        //t.setSkillLevel(0)
        //t.uciCmd('setoption name King Safety value 0')
        t.gameStart(t.time.level)
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
            $('img[data-piece="' + t.game.turn() + 'K"]').parent().addClass('in-check')
          }
          setTimeout(function(){
            t.boardEl.querySelector('.square-' + move.from).classList.add('highlight-move');
            t.boardEl.querySelector('.square-' + move.to).classList.add('highlight-move');   
          },10)
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
              white: white,
              black: black,
              i: Math.ceil(i*2),
              odd: i%2==0
            })
          }
        })
        return data
      },  
      gameFlip: function(){
        this.board.flip()
        const head = document.querySelector('.b-area > .head').innerHTML
        const foot = document.querySelector('.b-area > .foot').innerHTML
        document.querySelector('.b-area > .head').innerHTML = foot
        document.querySelector('.b-area > .foot').innerHTML = head
      },
      gameResign: function(){},
      gameAskDraw: function(){},
      gameUndo: function(){}
    },
    data () {
      return {
        data:{},
        eco:{},
        opening:null,
        score:0.10,
        vscore:49,
        orientation:null,
        announced_game_over:false,
        ecode:null,
        board:null,
        boardEl:null,
        game:null,
        gameLoaded: false,
        gameMoves:[],
        pgnIndex:[],
        moveFrom:null,
        playerColor:null,
        opponentName:null,
        data:{}
      }
    }
  }
</script>