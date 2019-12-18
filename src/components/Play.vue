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
                <span v-show="data.black === $root.player.code">
                  <span class="button has-background-white has-text-black is-rounded is-small" v-html="tdisplay.w"></span>
                  <span v-html="data.white" class="has-timer"></span>
                  <span v-show="data.result==='1-0'">🏆</span>
                </span> 
                <span v-show="data.white === $root.player.code">
                  <span class="button has-background-grey has-text-white is-rounded is-small" v-html="tdisplay.b"></span>
                  <span v-html="data.black" class="has-timer"></span>
                  <span v-show="data.result==='0-1'">🏆</span>
                </span> 
              </h6>
              <div class="board" :class="{ 'black' : playerColor === 'black' }">
                <div class="score-container">
                  <div class="score" :style="'max-height:' + vscore + '%'"></div>
                </div>            
                <div id="board"></div>
              </div>
              <h6 class="has-text-right white">
                <span v-show="data.black === $root.player.code">
                  <span v-show="data.result==='0-1'">🏆</span>
                  <span v-html="data.black" class="has-timer"></span>
                  <span class="button has-background-grey has-text-white is-rounded is-small" v-html="tdisplay.b"></span>
                </span> 
                <span v-show="data.white === $root.player.code">
                  <span v-show="data.result==='1-0'">🏆</span>
                  <span v-html="data.white" class="has-timer"></span>
                  <span class="button has-background-white has-text-black is-rounded is-small" v-html="tdisplay.w"></span>
                </span> 
              </h6>
            </div>
          </div>
          <div class="column datospartida">
            <div class="columns">
              <div class="column">
                <span v-html="ecode" class=""></span> 
                <span v-html="opening" class="has-text-black"></span>
              </div>
              <div class="column has-text-left" v-show="data.game && !data.game.result">
                <button @click="gameCapitulate()" class="button is-rounded is-danger" v-if="pgnIndex.length > 0" title="Abandonar partida">
                  <span class="icon has-text-white">
                    <span class="fas fa-flag"></span>
                  </span>
                </button>
              </div>
            </div> 
            <div class="tabs is-centered is-boxed">
              <ul>
                <li :class="{ 'is-active' : tab === 'chat' }">
                  <a @click="tab = 'chat'">
                    <span class="icon is-small"><i class="fas fa-comments" aria-hidden="true"></i></span>
                    <span>Chat</span>
                  </a>
                </li>
                <li :class="{ 'is-active' : tab === 'pgn' }">
                  <a @click="tab = 'pgn'">
                    <span class="icon is-small"><i class="fas fa-chess-board" aria-hidden="true"></i></span>
                    <span>Movimientos</span>
                  </a>
                </li>
              </ul>
            </div>
            <div v-show="tab === 'chat'">
              <div class="">
                <div class="columns">
                  <div class="column chatbox"></div>
                </div>
                <form @submit.prevent="sendChat">
                  <div class="field has-addons">
                    <div className="control is-expanded">
                      <input class="input" v-model="chat" type="text" placeholder="Ingresa tu mensaje" />
                    </div>
                    <div class="control">
                      <button type="submit" class="button is-info">Enviar</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div v-if="Object.keys(data).length" v-show="tab === 'pgn'">
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
      this.gameStart()
    },
    beforeDestroy: function() {
      this.$socket.emit('gone', this.$root.player)
    },
    sockets: {
      resume: function(data) {
        var t = this
        if(data.code != t.$root.player.code){
          snackbar("success", '👤 ' + data.code + ' se unió a la partida')
        }
        t.usersJoined.push(data.code)
        console.log("joined " + data.code)
        console.log("joined(2) " + t.usersJoined.length)
        setTimeout(() => {
          console.log("match started")
          if(t.usersJoined.length === 2 && !t.data.result){
            t.switchClock()
            t.gameStarted = true
          }
        },1000)
      },
      gone: function(data) {
        if(data.code != this.$root.player.code){
          snackbar("error", '👤 ' + data.code + ' abandonó la partida')
        }
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
        var result = null
        if(data.asker === this.$root.player.code){
          result = (t.playerColor==='black'?'1-0':'0-1')
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
          result = (t.playerColor==='white'?'1-0':'0-1')
          t.$socket.emit('data',{
            id:this.$route.params.game,
            result:result
          })
          swal("¡Victoria!", 'Has vencido a ' + t.opponentName, "success")
        }
        if(result){
          t.data.result = result
        }
        clearInterval(t.clock)
        t.announced_game_over = true
        playSound('game-end.mp3')
      },
      chat: function(data){
        const chatbox = document.querySelector(".chatbox")
        const cls = this.$root.player.code === data.sender ? 'is-pulled-right' : 'is-pulled-left has-background-info has-text-white'
        chatbox.innerHTML+= `<div class="box ${cls}">${data.line}</div>`
        chatbox.scrollTop = chatbox.scrollHeight
        if(data.sender!=this.$root.player.code){
          playSound('chat.mp3')
        }
      }
    },
    methods: {
      sendChat: function(){
        this.$socket.emit('chat', { 
          id:this.$route.params.game,
          sender: this.$root.player.code,
          line: this.chat
        })
        this.chat = ''
      },
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

          if(game.wtime){
            t.timer.w = parseInt(game.wtime)
          } else {
            t.timer.w = parseInt(game.minutes * 60)
          }

          t.tdisplay.w = t.getTimeDisplay(t.timer.w)

          if(game.btime){
            t.timer.b = parseInt(game.btime)
          } else {
            t.timer.b = parseInt(game.minutes * 60)
          }

          t.tdisplay.b = t.getTimeDisplay(t.timer.b)

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
              pieceTheme:'/assets/img/chesspieces/wikipedia/{piece}.png'
            }

            if(game.result){
              snackbar('success', 'Esta partida ha concluido')
            } else {
              cfg.onDragStart = t.onDragStart
              cfg.onDrop = t.onDrop
              cfg.onSnapEnd = t.onSnapEnd
            }

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

            if(game.result){
              playSound('game-end.mp3')
            } else {
              playSound('game-start.mp3')
              t.boardTaps()
              this.$socket.emit('resume',this.$root.player)
              if(game.wtime && game.btime){
                t.switchClock()
                t.gameStarted = true
              }
            }

            if(game.pgn){
              t.pgnIndex = this.gamePGNIndex(game.pgn)
              document.querySelector('.square-' + game.from).classList.add('highlight-move')
              document.querySelector('.square-' + game.to).classList.add('highlight-move')
            }
          },100)
        })
      },
      getTimeDisplay: function(time){
        var min = parseInt(time / 60, 10)
        var sec = parseInt(time % 60, 10)

        min = min < 10 ? "0" + min : min
        sec = sec < 10 ? "0" + sec : sec

        return min + ":" + sec
      },
      switchClock: function(){
        var t = this
        if(t.clock) {
          clearInterval(t.clock)
        }
        t.clock = setInterval(() => {
          var turn = t.game.turn()
          var result = null
          t.tdisplay[turn] = t.getTimeDisplay(t.timer[turn]) 
          if (--t.timer[turn] < 0) {
            t.timer[turn] = 0
            if(turn === t.playerColor[0]){
              result = (t.playerColor==='black'?'1-0':'0-1')
              swal({
                title: '¿Deseas la revancha?',
                text: 'Has sido derrotado por tiempo. ' + t.opponentName + ' ganó la partida',
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
              result = (t.playerColor==='white'?'1-0':'0-1')
              t.$socket.emit('data',{
                id:this.$route.params.game,
                result:result
              })
              swal("¡Victoria!", 'Has vencido por tiempo a ' + t.opponentName, "success")
            }
            t.$socket.emit('data',{
              wtime: t.timer.w,
              btime: t.timer.b,
              id:this.$route.params.game
            })
            if(result){
              t.data.result = result
            }
            clearInterval(t.clock)
          }
        },1000)
      },
      boardTaps:function(){
        var t = this
        var events = ['click', 'touchstart']
        document.querySelectorAll('.square-55d63').forEach(item => {
          events.forEach(event => {
            item.addEventListener(event, element => {
              if(!t.gameStarted) return
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

        if(!t.gameStarted) return
        //move object
        var moveObj = ({
          from: source,
          to: target,
          promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        // see if the move is legal
        var move = t.game.move(moveObj)

        // illegal move
        if (move === null) {
          return 'snapback'
        }

        t.moveFrom = null
        t.updateMoves(move)
        move.id = this.$route.params.game
        move.fen = t.game.fen()
        move.pgn = t.game.pgn()
        move.turn = t.game.turn()
        t.$socket.emit('move', move)
      },
      onSnapEnd: function() {
        this.board.position(this.game.fen())
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
            swal("¡Victoria!", 'Has vencido a ' + t.opponentName, "success")
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

          t.switchClock()
          t.$socket.emit('data',{
            wtime: t.timer.w,
            btime: t.timer.b,
            id:this.$route.params.game
          })
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
      }
    },
    data () {
      return {
        data:{},
        eco:{},
        tab:'chat',
        chat:null,
        timer:{w:null,b:null},
        tdisplay:{w:null,b:null},
        clock:null,
        opening:null,
        score:0.10,
        vscore:49,
        orientation:null,
        announced_game_over:false,
        ecode:null,
        board:null,
        boardEl:null,
        game:null,
        gameStarted:false,
        usersJoined:[],
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