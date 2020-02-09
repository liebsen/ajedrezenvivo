<template>
  <div :class="boardColor">
    <div class="status" v-show="!gameStarted">
      <span class="button is-rounded is-info is-small"><strong>Esperando jugadores...</strong></span>
    </div>  
    <div class="game-container" v-show="!$root.loading">
      <div class="container is-widescreen">
        <div class="content column fadeIn">
          <div class="columns">
            <div class="column">
              <div class="board-container">
                <h6 class="has-text-left black">
                  <span v-show="data.black === $root.player.code">
                    <span class="is-size-6">
                      <span v-html="data.white"></span>
                    </span>
                    <span v-show="data.result==='1-0'" class="icon">
                      <span class="fa fa-trophy has-text-warning"></span>
                    </span>
                  </span> 
                  <span v-show="data.white === $root.player.code">
                    <span class="is-size-6">
                      <span v-html="data.black"></span>
                    </span>
                    <span v-show="data.result==='0-1'" class="icon">
                      <span class="fa fa-trophy has-text-warning"></span>
                    </span>
                  </span> 
                </h6>
                <div class="board preservefilter" :class="{ 'black' : playerColor === 'black' }">
                  <div class="score-container">
                    <div class="score" :style="'max-height:' + vscore + '%'"></div>
                  </div>            
                  <div id="board"></div>
                </div>
                <h6 class="has-text-right white">
                  <span v-show="data.black === $root.player.code">
                    <span v-show="data.result==='0-1'" class="icon">
                      <span class="fa fa-trophy has-text-warning"></span>
                    </span>
                    <span class="is-size-6">
                      <span v-html="data.black"></span>
                    </span>
                  </span> 
                  <span v-show="data.white === $root.player.code">
                    <span v-show="data.result==='1-0'" class="icon">
                      <span class="fa fa-trophy has-text-warning"></span>
                    </span>
                    <span class="is-size-6">
                      <span v-html="data.white"></span>
                    </span>
                  </span> 
                </h6>
              </div>
            </div>
            <div class="column">
              <div class="board-assistant">
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
                <div class="columns is-marginless">
                  <div class="column has-text-left preservefilter">
                    <button @click="gameCapitulate()" class="button is-small is-rounded is-danger" v-show="pgnIndex.length && !announced_game_over" title="Abandonar partida">
                      <span class="icon has-text-white">
                        <span class="fas fa-flag"></span>
                      </span>
                    </button>
                    <button @click="gameAskForDraw()" class="button is-small is-rounded is-success" v-show="pgnIndex.length && !announced_game_over" title="Solicitar tablas">
                      <span class="icon has-text-white">
                        <span class="fas fa-handshake"></span>
                      </span>
                    </button>
                    <button @click="showLiveURL()" class="button is-small is-rounded is-info" v-show="pgnIndex.length && !announced_game_over" title="Mostrar URL de transmisión">
                      <span class="icon has-text-white">
                        <span class="fas fa-user-astronaut"></span>
                      </span>
                    </button>
                    <button @click="showPGN()" class="button is-small is-rounded is-info" v-if="pgnIndex.length && announced_game_over" title="Mostrar PGN">
                      <strong>PGN</strong>
                    </button>
                  </div>
                </div> 
                <div class="columns is-marginless">
                  <div class="column">
                    <strong v-html="ecode" class=""></strong> 
                    <span v-html="opening" class="has-text-black"></span>
                  </div>
                </div>
                <div class="tabs is-centered is-boxed">
                  <ul>
                    <li :class="{ 'is-active' : tab === 'pgn' }">
                      <a @click="tab = 'pgn'">
                        <span class="icon is-small"><i class="fas fa-clipboard-list" aria-hidden="true"></i></span>
                        <strong>Movimientos</strong>
                      </a>
                    </li>
                    <li :class="{ 'is-active' : tab === 'chat' }">
                      <a @click="tab = 'chat'">
                        <span class="icon is-small"><i class="fas fa-comments" aria-hidden="true"></i></span>
                        <strong>Chat</strong>
                      </a>
                    </li>
                  </ul>
                </div>
                <div v-show="tab === 'pgn'">
                  <div class="columns is-hidden-mobile">
                    <div class="chart-container preservefilter">
                      <div :class="playerColor">
                        <div class="chart-indicator"></div>
                        <div class="chart" v-show="pgnIndex.length"></div>
                      </div>
                    </div>
                  </div>
                  <div class="columns">
                    <div class="movesTableContainer preservefilter">
                      <div class="movesTable">
                        <div class="moveRow" v-for="(move,index) in pgnIndex">
                          <div class="moveNumCell" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                            <span v-html="(index+1)"></span>
                          </div>
                          <div class="moveCell moveSAN movew" :class="{ 'moveRowOdd': move.odd, 'moveRowEven': !move.odd }">
                            <a :class="'moveindex m' + (move.i-2)" @click="gamePos(move.i-2)">
                              <span v-html="move.white"></span>
                            </a>                          </div>
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
                <div v-show="tab === 'chat'">
                  <div class="has-text-centered">
                    <div class="columns">
                      <div class="column chatbox"></div>
                    </div>
                    <form @submit.prevent="sendChat">
                      <div class="field has-addons has-text-centered is-flex-centered">
                        <div class="control">
                          <input class="input is-rounded" v-model="chat" type="text" placeholder="Ingresa tu mensaje" />
                        </div>
                        <div class="control">
                          <button type="submit" class="button is-info is-rounded">
                            <span class="icon">
                              <span class="fas fa-arrow-up"></span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </form>
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
  import Chessboard from '../../static/js/chessboard'
  import snackbar from '../components/Snackbar'
  import playSound from '../components/playSound'
  import swal from 'sweetalert'

  export default {
    name: 'play',
    mounted: function(){
      var t = this
      t.$root.loading = true
      window.app = this
      window.addEventListener('beforeunload', t.beforeunload)
      document.getElementById('board').addEventListener("wheel", event => {
        this.gamePos(Math.sign(event.deltaY)<0?this.index+1:this.index-1)
      })
      axios.get('/static/json/eco_es.json')
        .then((response)=>{
          this.eco = response.data
        })

      t.gameLoad()
      t.$socket.emit('join',t.$route.params.game)
    },
    destroyed () {
      this.$socket.emit('leave',this.data._id)
      clearInterval(this.clock)
    },
    beforeDestroy: function() {
      this.$socket.emit('gone', {
        player: this.$root.player.code,
        id:this.data._id
      })
      this.$socket.emit('leave',this.data._id)
      this.$socket.emit('match_end', {
        id:this.data._id
      })
    },
    sockets: {
      start: function(data){
        var t = this
        setTimeout(() => {
          if(!t.gameStarted && !t.data.result){
            var secs = t.data.minutes * 60
            t.gameStarted = true
            t.boardTaps()
            t.startClock()
            this.$socket.emit('match_start', {
              id:t.data._id,
              white: t.data.white,
              black: t.data.black,
              wtime: secs,
              btime: secs
            })
          }
        },100)
      },
      resume: function(data) {
        var t = this
        var exists = false
        if(data.code != t.$root.player.code && !t.announced_game_over){
          snackbar("success", '👤 ' + data.code + ' se unió a la partida')
        }
        for(var i in t.usersJoined){
          if(t.usersJoined[i] === data.code){
            exists = true
          }
        }
        if(exists === false){
          t.usersJoined.push(data.code)
        }
        setTimeout(() => {
          if(t.usersJoined.length === 2 && !t.data.result && t.$root.player.code === t.data.white){
            t.$socket.emit('start', {
              player: t.$root.player,
              id:t.$route.params.game
            })
          }
        },1500)
      },
      gone: function(data) {
        if(data.player != this.$root.player.code){
          snackbar("error", '👤 ' + data.player + ' abandonó la partida')
        }
        for(var i in this.usersJoined){
          if(this.usersJoined[i] === data.player){
            this.usersJoined.splice(i,1)
          }
        }
      },
      reject_rematch: function(data) {
        if(data.asker === this.$root.player.code){
          swal.close()
          swal("Partida declinada", '👤 ' + data.player + ' declinó la revancha')
        }
      },
      invite_rematch: function(data) {
        var t = this
        if(data.player === this.$root.player.code){
          swal.close()
          swal({
            title: "¿Aceptás esta partida?",
            text: '👤 ' + data.asker + ' solicita una revancha',
            buttons: ["Declinar", "Aceptar"]
          })
          .then(accept => {
            if (accept) {
              axios.post( this.$root.endpoint + '/create', {
                white: (t.playerColor==='white'?data.asker:data.player),
                black: (t.playerColor==='white'?data.player:data.asker),
                minutes: t.data.minutes,
                compensation: t.data.compensation,
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
              t.$socket.emit('reject_rematch', data)
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
        }
        t.timer.w = parseInt(data.wtime)
        t.timer.b = parseInt(data.btime)
        t.tdisplay.w = t.$root.getTimeDisplay(t.timer.w)
        t.tdisplay.b = t.$root.getTimeDisplay(t.timer.b)
      },
      acceptdraw: function(data){
        swal.close()
        swal("Tablas", 'Esta partida finalizó con un empate', "info")
        this.announced_game_over = true
      },
      rejectdraw: function(data){
        swal.close()
        if(data.asker === this.$root.player.code){
          swal("Tablas rechazado", 'El oponente desea continuar jugando', "info")
        }
      },
      capitulate: function(data){
        var t = this
        var result = null
        if(data.asker === t.$root.player.code){
          result = (t.playerColor==='black'?'1-0':'0-1')
          swal({
            title: '¿Querés solicitar revancha?',
            text: 'Has abandonado. ' + t.opponentName + ' ganó esta partida',
            buttons: ["No", "Sí"]
          })
          .then(accept => {
            if (accept) {
              t.$socket.emit('invite_rematch', {
                asker:t.$root.player.code,
                player:t.opponentName
              })
            } else {
              console.log('Clicked on cancel')
            }
          })
        } else {
          result = (t.playerColor==='white'?'1-0':'0-1')
          t.$socket.emit('data',{
            id:t.data._id,
            wtime: t.timer.w,
            wtime: t.timer.b,
            result:result
          })
          swal("¡Victoria!", 'Has vencido a ' + t.opponentName, "success")
        }
        if(result){
          t.data.result = result
        }
        t.announced_game_over = true
        playSound('game-end.mp3')
      },
      askfordraw: function(data){
        var t = this
        var result = null
        if(data.player === t.$root.player.code){
          swal({
            title: '¿Aceptas tablas?',
            text: 'Tu oponente ' + t.opponentName + ' solicita tablas',
            buttons: ["No", "Sí"]
          })
          .then(accept => {
            if (accept) {
              result = '1/2-1/2'

              t.$socket.emit('data',{
                id:this.$route.params.game,
                wtime: t.timer.w,
                wtime: t.timer.b,
                result:result
              })

              t.$socket.emit('acceptdraw', data)
              t.data.result = result
              t.announced_game_over = true
              playSound('game-end.mp3')
            } else {
              t.$socket.emit('rejectdraw', data)
              console.log('Clicked on cancel')
            }
          })
        } else {
          swal("Esperando respuesta...", 'Has solicitado tablas a ' + t.opponentName, "info")
        }
      },
      chat: function(data){
        const chatbox = document.querySelector(".chatbox")
        const owned = this.$root.player.code === data.sender
        const cls = owned ? 'is-pulled-right has-text-right' : 'is-pulled-left has-text-left has-background-info has-text-white'
        chatbox.innerHTML+= `<div class="box ${cls}">${data.line}</div>`
        chatbox.scrollTop = chatbox.scrollHeight
        if(!owned){
          snackbar('success', '<strong class="has-text-light">👤 ' + data.sender + '</strong> ' + data.line)
        }
        if(data.sender!=this.$root.player.code){
          playSound('pop.mp3')
        }
      }
    },
    methods: {
      sendChat: function(){
        if(this.chat.trim()==='') this.chat = '👋'
        this.$socket.emit('chat', { 
          id:this.$route.params.game,
          sender: this.$root.player.code,
          line: this.chat
        })
        this.chat = ''
      },
      beforeunload: function handler(event) {
        this.$socket.emit('gone', {
          player: this.$root.player.code,
          id:this.data._id
        })
        this.$socket.emit('leave',this.$route.params.game)
      },      
      uciCmd: function(cmd, which) {
        //console.log("UCI: " + cmd);
        (which || this.evaler).postMessage(cmd);
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
      gameCapitulate: function(){
        swal({
          title: 'Abandonar partida',
          text: '¿Querés abandonar esta partida?',
          buttons: ["No", "Sí"]
        })
        .then(accept => {
          if (accept) {
            this.$socket.emit('capitulate', {
              asker:this.$root.player.code,
              player:this.opponentName,
              id:this.$route.params.game
            })
          } else {
            console.log('Clicked on cancel')
          }
        })
      },
      gameAskForDraw: function(){
        swal({
          title: '¿Querés solicitar tablas?',
          text: '',
          buttons: ["No", "Sí"]
        })
        .then(accept => {
          if (accept) {
            this.$socket.emit('askfordraw', {
              asker:this.$root.player.code,
              player:this.opponentName,
              id:this.$route.params.game
            })
          } else {
            console.log('Clicked on cancel')
          }
        })
      },
      gameStart: function(){
        var t = this
        var pos = 'start'
        const pref = JSON.parse(localStorage.getItem('player'))||{}

        setTimeout(() => {
          t.game = new Chess()

          if(t.data.fen){
            pos = t.data.fen
          }

          var cfg = {
            draggable: true,
            position: pos,
            pieceTheme:'/static/img/chesspieces/wikipedia/{piece}.png'
          }

          if(!t.data.result){
            cfg.onDragStart = t.onDragStart
            cfg.onDrop = t.onDrop
            cfg.onSnapEnd = t.onSnapEnd
          }

          if(pref.pieces){
            cfg.pieceTheme = '/static/img/chesspieces/' + pref.pieces + '/{piece}.png'
            t.boardColor = pref.board
          }

          if(window.innerWidth < 789){
            cfg.draggable = false 
          }

          if(t.data.pgn){
            t.game.load_pgn(t.data.pgn)
          }

          t.boardEl = document.getElementById('board')
          t.$root.fullscreenBoard()
          t.board = Chessboard('board', cfg)      
          t.board.orientation(t.playerColor)

          $(window).resize(() => {
            t.board.resize()
            t.highlightLastMove()
            t.$root.fullscreenBoard()
            t.boardTaps()
          })

          if(t.data.result){
            playSound('game-end.mp3')
            t.announced_game_over = true
            snackbar('success',"Esta partida ha finalizado")
          } else {
            playSound('game-start.mp3')
          }
          
          if(t.data.pgn){
            t.$socket.emit('start', {
              player: t.$root.player,
              id:t.$route.params.game
            })

            t.pgnIndex = this.gamePGNIndex(t.data.pgn)
            t.highlightLastMove()
          }      
        },500)  
      },
      gamePos:function(pos){
        if(pos > this.gameMoves.length - 1||pos < 0||!this.announced_game_over){
          return
        }

        this.index = pos
        const moves = this.gameMoves.slice(0,this.index)
        var move = this.gameMoves[this.index];
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
          this.moveSound(moved)
          this.addHightlight(moved)
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
      gameLoad: function(){
        this.$root.loading = true
        var t = this
        axios.post( t.$root.endpoint + '/game',{
          id:this.$route.params.game
        }).then((res) => {

          t.$root.loading = false

          if(!Object.keys(res.data).length) {
            return location.href = "/404"
          }

          var game = res.data
          var pgn = game.pgn || ''

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

          t.tdisplay.w = t.$root.getTimeDisplay(t.timer.w)

          if(game.btime){
            t.timer.b = parseInt(game.btime)
          } else {
            t.timer.b = parseInt(game.minutes * 60)
          }

          t.tdisplay.b = t.$root.getTimeDisplay(t.timer.b)
          t.gameStart()
          t.$socket.emit('resume',this.$root.player)

          t.evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker('/static/js/stockfish.js')

          t.evaler.onmessage = function(event) {
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
            }

            /// Ignore some output.
            if (line === "uciok" || line === "readyok" || line.substr(0, 11) === "option name") {
              return;
            }
          }
        })
      },
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
              if(turn === t.playerColor[0]){
                result = (t.playerColor==='black'?'1-0':'0-1')
                swal({
                  title: '¿Querés solicitar revancha?',
                  text: t.opponentName + ' ganó esta partida. Fuiste derrotado por tiempo.',
                  buttons: ["No", "Sí"]
                })
                .then(accept => {
                  if (accept) {
                    this.$socket.emit('invite_rematch', {
                      asker:t.$root.player.code,
                      player:t.opponentName
                    })
                  } else {
                    console.log('Clicked on cancel')
                  }
                })
              } else {
                result = (t.playerColor==='white'?'1-0':'0-1')
                t.$socket.emit('data',{
                  id:t.data._id,
                  wtime: t.timer.w,
                  wtime: t.timer.b,
                  result:result
                })
                swal("¡Victoria!", 'Has vencido por tiempo a ' + t.opponentName, "success")
              }
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

              t.board.position(t.game.fen())
              t.updateMoves(move)
              t.emitMove(move)             
            }
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
        if(!t.gameStarted || t.announced_game_over) return 'snapback'
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
        t.emitMove(move)
      },
      emitMove: function(move){
        var t = this
        move.id = t.$route.params.game
        move.vscore = t.vscore
        move.fen = t.game.fen()
        move.pgn = t.game.pgn()
        move.turn = t.game.turn()
        move.wtime = parseInt(t.timer.w)
        move.btime = parseInt(t.timer.b)
        move.compensation = t.data.compensation
        t.$socket.emit('move', move)
      },
      onSnapEnd: function() {
        setTimeout(() => {
          this.board.position(this.game.fen())
        },100)
      },
      updateMoves:function(move){

        var t = this
        setTimeout(() => {
          this.uciCmd('position startpos moves' + this.moveList(), this.evaler);
          this.uciCmd("eval", this.evaler);

          if(t.game.game_over()){
            if(t.game.in_draw() || t.game.in_stalemate() || t.game.in_threefold_repetition()) {
              t.$socket.emit('data',{
                id:this.$route.params.game,
                wtime: t.timer.w,
                wtime: t.timer.b,
                result:"1/2-1/2"
              })
              swal("Tablas", 'Esta partida finalizó en tablas', "info")
            } else {          
              if(t.game.turn() === t.playerColor[0]){
                swal({
                  title: '¿Querés la revancha?',
                  text: t.opponentName + ' ganó esta partida',
                  buttons: ["No", "Sí"]
                })
                .then(accept => {
                  if (accept) {
                    this.$socket.emit('invite_rematch', {
                      asker:this.$root.player.code,
                      player:t.opponentName
                    })
                  } else {
                    console.log('Clicked on cancel')
                  }
                })
              } else {
                t.$socket.emit('data',{
                  id:t.data._id,
                  wtime: t.timer.w,
                  wtime: t.timer.b,
                  result:(t.playerColor==='white'?'1-0':'0-1')
                })
                swal("¡Victoria!", 'Has vencido a ' + t.opponentName, "success")
              }
            }
            
            t.announced_game_over = true
          } 

          t.pgnIndex = this.gamePGNIndex(t.game.pgn())
          t.index++
          t.gameMoves = t.gameMoves.slice(0,t.index)

          setTimeout(() => {
            const index = t.index
            t.gameMoves.push({
              san: move.san,
              vscore: t.vscore
            })
            t.addHightlight(move)
            t.moveSound(move)
            t.updateMoveList()
            setTimeout(() => {
              t.drawChart(index)
            },1000)
          },250)
        },100)

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
      updateMoveList: function(){
        const movesTable = document.querySelector(".movesTableContainer")
        movesTable.scrollTop = movesTable.scrollHeight
        document.querySelectorAll('.moveindex').forEach((item) => {
          item.parentNode.classList.remove('active')
        })
        document.querySelector('.moveindex.m' + this.index).parentNode.classList.add('active')
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
        var score = this.vscore

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
        element.innerHTML = "";

        var width = document.querySelector(".movesTableContainer").clientWidth + 'px'
        var chart = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        chart.setAttribute("width", "100%")
        chart.setAttribute("height", "100%")
        chart.setAttribute("preserveAspectRatio", "none")
        chart.setAttribute("viewBox", "0 0 " + this.chart.width + " " + this.chart.height)

        var polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        console.log(this.chart.points)
        polygon.setAttribute("points", this.chart.points);

        if(this.chart.values.length > 1){
          element.style.width = width
          element.appendChild(chart);
          chart.appendChild(polygon);
        }
      },
      moveSound: function(move){
        var sound = 'move.mp3'

        if(this.game.game_over()){
          sound = 'game-end.mp3'
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
            sound = 'check.mp3'
          }
        }

        playSound(sound)
      },
      removeHighlight : function() {
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
      showLiveURL: function(){
        var url = `${ window.location.protocol }//${ window.location.host }/watch/${this.$route.params.game}`
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <div class="control">
        <div class="field">
          <textarea class="textarea" readonly>${url}</textarea>
        </div>
      </div>
    </div>
  </div>
</div>`)
        swal({
          title: 'URL partida en vivo',
          content: {
            element: 'div',
            attributes: {
              innerHTML: `${template}`,
            }
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
        chart:{
          width: 100,
          height: 50,
          maxValue: 100,
          values:[51],
          points:[]
        },
        data:{},
        eco:{},
        tab:'pgn',
        chat:'',
        index:-1,
        gameMoves:[],
        clock:null,
        timer:{w:null,b:null},
        tdisplay:{w:null,b:null},
        opening:null,
        score:0.10,
        vscore:49,
        orientation:null,
        announced_game_over:false,
        ecode:null,
        board:null,
        boardEl:null,
        boardColor:'classic',
        game:null,
        gameStarted:false,
        usersJoined:[],
        pgnIndex:[],
        moveFrom:null,
        playerColor:null,
        opponentName:null,
        data:{}
      }
    }
  }
</script>