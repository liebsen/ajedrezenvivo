<template>
  <div class="game-container" v-show="!$root.loading">
    <!--div class="playlist-container">
      <div class="pietimer">
        <div class="pie spinner"></div>
        <div class="pie filler"></div>
        <div class="mask"></div>
      </div>
    </div>
    <div class="pres-container">
      <div class="pres content">
        <div class="columns is-result is-vcentered has-text-centered">
          <div class="column is-player-white">
            <h1><span v-show="data.result==='1-0'">🏆</span></h1>
            <h3 class="has-text-black" v-html="data.white"></h3>
          </div>
          <div class="column is-player-black">
            <h1><span v-show="data.result==='0-1'">🏆</span></h1>
            <h3 class="has-text-white" v-html="data.black"></h3>
          </div>
        </div>
        <div class="columns is-vcentered has-text-centered is-player-info">
          <div class="column">
            <h6 v-show="data.date && data.date !='?'" v-html="data.date"></h6>
            <h6 v-show="data.event && data.event !='?'" v-html="data.event"></h6>
            <h6 v-show="data.site && data.site !='?'" v-html="data.site"></h6>
          </div>
        </div>
      </div>
    </div-->
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
    <div class="container is-widescreen">
      <div class="content column">
        <div class="columns" :class="boardColor">
          <div class="column">
            <div class="board-container">
              <h6 class="black has-text-left is-clickable" @click="gameFlip">
                <span v-show="data.result==='0-1'">🏆</span>
                <span v-html="data.black"></span> 
                <span class="has-text-grey" v-html="data.blackelo"></span>
              </h6>
              <div class="board" :class="{ 'black' : orientation==='black' }">
                <div class="score-container">
                  <div class="score" :style="'max-height:' + vscore + '%'"></div>
                </div>            
                <div id="board" @click="gamePause"></div>
              </div>
              <h6 class="white has-text-right is-clickable" @click="gameFlip">
                <span v-show="data.result==='1-0'">🏆</span>
                <span v-html="data.white"></span> 
                <span class="has-text-grey" v-html="data.whiteelo"></span>                  
              </h6>
            </div>
          </div>
          <div class="column">
            <!--h5 class="has-text-black">♛ Datos de la partida</h5-->
            <div v-if="Object.keys(data).length">
              <div class="columns">
                <div class="column">
                  <strong v-html="ecode" class=""></strong>&nbsp;
                  <span v-html="opening" class="has-text-black"></span>
                </div>
                <div class="column has-text-left">
                  <button @click="showPGN()" class="button is-small is-rounded is-info" v-if="pgnIndex.length">
                    <strong>PGN</strong>
                  </button>
                </div>
              </div>  
              <div class="columns is-hidden-mobile">
                <div class="chart-container">
                  <div :class="orientation">
                    <div class="chart" v-show="pgnIndex.length"></div>
                  </div>
                </div>
              </div>
              <div class="columns">
                <div class="movesTableContainer">
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
  import swal from 'sweetalert'
  import playSound from '../components/playSound'

  export default {
    name: 'game',
    /*
    watch: {
      '$route': function () {
        this.gameSeek()
      }
    },*/
    mounted: function(){

      this.$root.loading = true

      window.app = this

      if(localStorage.getItem('speed')){
        this.speed = parseInt(localStorage.getItem('speed'))
      }

      axios.get('/assets/json/eco_es.json')
        .then((response) => {
          this.eco = response.data
          this.gameStart()
        })
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

          var perc = (this.index + 1) / this.gameMoves.length * 100;
          $('.bar-progress').animate({width:perc+'%'},this.speed,'linear')

          const moved = this.game.move(move)

          this.board.position(this.game.fen())

          setTimeout(() => {
            this.moveSound(moved)
            this.addHightlight(moved)
          },250)          

          this.uciCmd('position startpos moves' + this.get_moves(), this.evaler);
          this.uciCmd("eval", this.evaler);

          if(this.index === this.gameMoves.length){
            this.gamePause()
          }

          document.querySelectorAll('.moveindex').forEach((item) => {
            item.parentNode.classList.remove('active');
          })

          document.querySelector('.moveindex.m' + this.index).parentNode.classList.add('active')

          var n = document.querySelector('.moveindex.m' + this.index).parentNode.offsetTop
          var x = document.querySelector('.moveindex.m' + this.index).parentNode.clientHeight
          var y = n + x
          var h = parseInt(document.querySelector('.movesTableContainer').style.height)
          if(y>h){
            document.querySelector('.movesTableContainer').scrollTop = n
          }

          this.index++

          if(this.game.history().length < 14){
            setTimeout(() => {
              this.eco.forEach((eco,i) => {
                if(eco.pgn === this.game.pgn()){
                  this.opening = eco.name
                  this.ecode = eco.eco
                }
              })
            },1000)
          }

          setTimeout(this.gameMove, this.speed)
        }
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
      showPGN:function(pgn){
        var pgn = this.data.pgn + ' ' + (this.data.result ? this.data.result : '')
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
      uciCmd: function(cmd, which) {
        //console.log("UCI: " + cmd);
        (which || this.evaler).postMessage(cmd);
      },    
      gameStart: function(){
        const pref = JSON.parse(localStorage.getItem('player'))||{}
        this.boardEl = document.getElementById('board')
        axios.post( this.$root.endpoint + '/game', {id:this.$route.params.game} ).then((res) => {
          if(!Object.keys(res.data).length) return location.href="/404"
          var game = res.data
          const totalms = this.$root.countMoves(game.pgn) * this.speed

          this.gameMoves = this.gamePGN(game.pgn)
          this.pgnIndex = this.gamePGNIndex(game.pgn)
          this.data = game
          this.duration = totalms / 1000
          this.$root.loading = false
          setTimeout(() => {
            this.game = new Chess()

            if(pref.pieces){
              this.boardCfg.pieceTheme = '/assets/img/chesspieces/' + pref.pieces + '/{piece}.png'
              this.boardColor = pref.board
            }

            this.board = Chessboard('board', this.boardCfg)
            this.orientation = this.board.orientation()

            $(window).resize(() => {
              this.board.resize()
              this.highlightLastMove()
            })

            playSound('game-start.mp3')
            $('.bar-progress').css({width:'0%'})

            /*document.querySelector('.pres-container .is-player-white').classList.add('slideOutTL') 
            document.querySelector('.pres-container .is-player-black').classList.add('slideOutTR') 
            document.querySelector('.pres-container .is-player-info').classList.add('slideOutB') 
            document.querySelector('.pres-container').classList.add('fadeOut')   
            setTimeout(() => {
              document.querySelector('.pres-container').style.display = 'none'
            },1500)           
            */

            const offset = 100
            setTimeout(() => {
              document.querySelector('.movesTableContainer').style.height = ($('.board').height() - offset) + 'px'

              setTimeout(() => {
                /* autoplay kickstart */
                
                this.gameSeek()
              }, 1000)
            }, 500)
          },2000)

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
              t.drawChart()
            }

            /// Ignore some output.
            if (line === "uciok" || line === "readyok" || line.substr(0, 11) === "option name") {
              return;
            }
          }
        })
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
      removeHighlight: function(){
        this.boardEl.querySelectorAll('.square-55d63').forEach((item) => {
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
              t.boardEl.querySelector('img[data-piece="' + t.game.turn() + 'K"]').parentNode.classList.add('in-check')
            },200)
          }
          t.boardEl.querySelector('.square-' + move.from).classList.add('highlight-move');
          t.boardEl.querySelector('.square-' + move.to).classList.add('highlight-move');   
        }
      },
      highlightLastMove: function(){
        var history = this.game.history({verbose:true})
        if(history.length){
          var move = history[history.length-1]
          this.addHightlight(move)
        }
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

        document.querySelectorAll('.moveindex').forEach((item) => {
          item.parentNode.classList.remove('active');
        })

        document.querySelector('.moveindex.m' + this.index).parentNode.classList.add('active');

        var perc = (this.index + 1) / this.gameMoves.length * 100;
        $('.bar-progress').animate({width:perc+'%'},100,'linear')
        const pgns = pgn.join(' ')
        this.game.reset()
        this.game.load_pgn(pgns) 
        
        const moved = this.game.move(move)
        this.board.position(this.game.fen())

        setTimeout(() => {
          this.moveSound(moved)
          this.addHightlight(moved)
        },250)

        if(!this.paused) {
          this.gamePause()
        }
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
            if(speed > 5000 || speed < 500){
              swal('El valor debe ser entre 500 / 5000')
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
          moveSpeed:250,
          pieceTheme:'/assets/img/chesspieces/wikipedia/{piece}.png'
        },
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
        data:{},
        eco:{},
        duration:0,
        score:0.10,
        vscore: 49,
        ecode:null,
        opening:null,
        board:null,
        game:null,
        orientation:null,
        gameMoves:[],
        pgnIndex:[],
        boardEl:null,
        index:0,
        paused:false,
        speed:1000
      }
    }
  }
</script>