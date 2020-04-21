<template>
  <div class="container is-widescreen">
    <div v-show="!data.owner" class="content column fadeIn">
      <section class="hero fadeIn">
        <div class="hero-body">
          <div class="container is-flex-column is-vertical">
            <h1 class="title">
              <span class="icon is-margin-right">
                <span class="fa fa-robot"></span>
              </span> 
              <span>Este grupo no existe</span>
            </h1>
            <p>Si creés que debería estar <a @click="$root.createGroup">crealo</a></p>
          </div>
        </div>
      </section>
    </div>
    <div v-show="data.owner" class="content column fadeIn">
      <div class="group" v-show="$root.matches.length" :class="{ 'no-players': players.length < 2 }">
        <h6>
          <span class="icon">
            <span class="fa fa-chess"></span>
          </span>
          <span>Jugando ahora</span>
        </h6>
        <div class="columns is-multiline">
          <div v-for="match in $root.matches" class="column is-3">
            <div :class="'board-container b' + match.id">
              <div :class="$root.boardColor">
                <h6 class="has-text-left black is-clickable" @click="$root.gameFlip(match.id)">
                  <span class="button is-small" :class="{ 'has-background-grey has-text-white' : match.btime > 10, 'has-background-info has-text-white' : match.btime <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span v-html="$root.getTimeDisplay(match.btime)"></span>
                  </span>
                  <span class="button is-small is-text">
                    <span v-html="match.black"></span>
                    <span v-show="match.result==='0-1'" class="icon">
                      <span class="fa fa-trophy is-size-7 has-text-warning"></span>
                    </span>
                  </span>
                </h6>
                <router-link :to="'/watch/' + match.id">
                  <div class="board preservefilter">
                    <div :id="'board' + match.id"></div>
                  </div> 
                </router-link>
                <h6 class="has-text-right white is-clickable" @click="$root.gameFlip">
                  <span class="button is-small is-text">
                    <span v-show="match.result==='1-0'" class="icon">
                      <span class="fa fa-trophy is-size-7 has-text-warning"></span>
                    </span>
                    <span v-html="match.white"></span>
                  </span>
                  <span class="button is-small" :class="{ 'has-background-white has-text-black' : match.wtime > 10, 'has-background-info has-text-white' : match.wtime <= 10}">
                    <span class="icon">
                      <span class="fa fa-clock"></span>
                    </span>
                    <span v-html="$root.getTimeDisplay(match.wtime)"></span>
                  </span>
                </h6>
              </div>
              <div class="match-status has-text-info"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div v-if="players && data && data.owner" class="column is-lobby-list is-3">
          <div v-show="data.owner.code === player.code">
            <h3 class="is-clickable">
              <span @click="setGroupRules" class="icon">
                <span class="fas fa-cog"></span>
              </span>
              <span @click="setGroupName" >{{data.code}}</span>
            </h3>            
          </div>
          <div v-show="data.owner.code !== player.code">
            <h3>{{data.code}}</h3>
          </div>
          <div v-show="players.length > 1">
            <div v-for="plyer in players" class="field">
              <router-link v-if="plyer.code != player.code" :to="`/results?q=${plyer.code}&strict=1`" :title="'Invitar a ' + plyer.code">
                <span class="button is-text is-rounded is-grey">
                  <span class="icon">
                    <span v-html="plyer.flag"></span>
                  </span>
                  <span v-html="plyer.code"></span>
                </span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="column has-text-centered box is-padded">
            <div class="columns">
              <div class="column chatbox has-text-left group_chat"></div>
            </div>
            <form v-show="players.length > 1" @submit.prevent="sendChat">
              <div class="field is-fullwidth has-addons has-addons-fullwidth is-marginless">
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
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import { mapState } from 'vuex'
  import snackbar from '@/components/Snackbar'
  import swal from 'sweetalert'
  import playSound from '@/components/playSound'
  export default {
    name: 'group',
    data () {
      return {
        chat:'',
        data: {},
        group: {},
        players: []
      }
    },
    computed: {
      ...mapState([
        'player'
      ])
    },
    mounted () {
      setTimeout(() => {
        this.welcomeMsg()
      }, 3000)
      this.loadGroup()
    },
    beforeDestroy () {
      console.log('beforeDestroy')
      this.$socket.emit('group_leave', this.group)
    },
    sockets: {
      group_chat: function(data){
        const chatbox = document.querySelector(".group_chat")
        if(chatbox && this.chatlast != data.line){
          const owned = this.player.code === data.sender
          const sender = owned || data.sender === 'chatbot' ? '' : data.sender
          let cls = owned ? 'is-pulled-right has-text-right has-background-info has-text-white ' : 'is-pulled-left has-text-left '
          cls+= data.sender === 'chatbot' ? 'has-text-grey' : 'has-text-white has-background-info'
          const ts = moment().format('hh:mm a')
          chatbox.innerHTML+= `<div class="box ${cls}"><strong class="has-text-white">${sender}</strong> ${data.line} <span class="is-size-7">${ts}</span></div>`
          chatbox.scrollTop = chatbox.scrollHeight
          this.chatlast = data.line
        }
      },
      players: function (data) {
        if(this.$route.name === 'play') return
        if(data.length > 1){
          const message = 'Hay ' + (data.length - 1) +  ' jugador' + (data.length > 2 ? 'es' : '') + ' esperando invitación '
          if(this.$route.name === 'lobby'){
            snackbar('default', message)
          }
          this.$socket.emit('chat', { 
            id: this.$route.params.group,
            sender: 'chatbot',
            line: message
          })
        } else {
          this.$socket.emit('group_chat', { 
            group: this.$route.params.group,
            sender: 'chatbot',
            line: `No hay jugadores en este momento`
          })
        }
        console.log(data.length)
        this.players = data
      },
      player: function (data) {
        if(data.id === this.player.id){
          if(data.exists){
            snackbar('error',`El nombre ${data.code} ya está en uso, por favor elige otro`)
            this.$router.push('/preferences')
          } else {
            snackbar('success',`Ahora eres ${data.code}`)
            this.$socket.emit('group_chat', { 
              group: this.$route.params.group,
              sender: 'chatbot',
              line: `${data.ref} ahora es ${data.code}`
            })
          }        
        } else {
          snackbar('default',`${data.code} actualizó sus preferencias`)
          this.$socket.emit('group_chat', { 
            group: this.$route.params.group,
            sender: 'chatbot',
            line: `${data.code} actualizó sus preferencias`
          })
        }
        this.$root.saving = false
      },
      play: function(data) {
        if(data.asker === this.player.code){
          this.$store.dispatch('games', data)
          swal.close()
          this.$router.push(`/play/${this.$route.params.group}/${data.id}`)
        }
      },
      reject: function(data) {
        if(data.asker.code === this.player.code){
          swal.close()
          swal("Partida declinada", data.player.code + ' declinó tu invitación')
          playSound('defeat.mp3')
        }
      },
      invite: function(data) {
        let group = this.$route.params.group
        if(data.player.code === this.player.code){
          if(this.player.autoaccept){
            axios.post( this.endpoint + '/game/create', {
              event: `Match a ${data.games}`,
              white: data.white.code,
              black: data.black.code,
              whiteflag: data.white.flag,
              blackflag: data.black.flag,
              group: group,
              minutes: data.minutes,
              games: data.games,
              compensation: data.compensation
            }).then((response) => {
              if(response.data.status === 'success'){
                this.$socket.emit('play', {
                  asker: data.asker.code,
                  player: data.player.code,
                  id: response.data.id
                })
                this.$router.push(['/play',response.data.id].join('/'))
              } else {
                snackbar('danger','El juego no pudo ser creado.')
              }        
            })
          } else {
            playSound('victory.mp3')
            const template = (`
    <div class="content">
    <h4>
      <span class="icon">
        <span class="fas fa-user"></span>
      </span> 
      <span>${data.asker.code} te invita a un match de ${data.games}</span>
    </h4>
    <h4>
      <span class="icon">
        <span class="fas fa-stopwatch"></span>
      </span>
      <span> ${data.minutes}' + ${data.compensation}</span>
    </h4>
    </div>`);
            swal({
              title: "¿Aceptás esta partida?",
              content: {
                element: 'div',
                attributes: {
                  innerHTML: `${template}`,
                }
              },
              buttons: ["Declinar", "Aceptar"],
              closeOnClickOutside: false
            })
            .then(accept => {
              if (accept) {
                let group = this.$route.params.group
                axios.post(this.endpoint + '/game/create', {
                  white: data.white.code,
                  whiteflag: data.white.flag,
                  black: data.black.code,
                  blackflag: data.black.flag,
                  group: group,
                  minutes: data.minutes,
                  compensation: data.compensation,
                }).then(res => {
                  if(res.data.status === 'success'){
                    this.$socket.emit('play', {
                      asker: data.asker.code,
                      player: data.player.code,
                      id: res.data.id
                    })
                    this.$store.dispatch('games', res.data)
                    this.$router.push(`/play/${group}/${res.data.id}`)
                  } else {
                    snackbar('danger','El juego no pudo ser creado.')
                  }        
                })
              } else {
                this.$socket.emit('reject', data)
                console.log('Clicked on cancel')
              }
            })
          }
        }
      },
      matches_live: function(data){
        this.matches = data
        var gamesContainer = document.querySelector('.live-games')
        if(gamesContainer){
          for(var i in data){
            if(!this.games[data[i].id]){
              this.gameStart(data[i])
            }
          }
        }
      },
      match_live: function(data){
        var gamesContainer = document.querySelector('.live-games')
        if(gamesContainer){
          var exists = false 
          for(var i in this.matches){
            if(this.matches[i].id === data.id){
              exists = true
            }
          }

          if(exists === false){
            this.matches.push(data)
          }

          setTimeout(() => {
            this.gameMove(data)  
          },500)        
        }
      }
    },
    methods: {
      setGroupName () {
        swal("Ingresá un nombre para tu grupo", {
          content: {
            element: 'input',
            attributes: {
              className: 'input is-rounded',
              placeholder: "Nombre del grupo",
              value: this.data.code
            }
          }
        })
        .then(code => {
          if(code){
            if(code.length > 15){
              swal('El valor debe tener entre 1 / 15 caracteres')
            } else {
              this.$socket.emit('group', {id: this.$route.params.group, code: code})
              this.data.code = code
            }          
          }
        })
        .catch(() => {
        })
      },
      setGroupRules () {
        const template = (`
  <div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-retweet"></span>
        </span>
        <span>Rondas</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons rounds" title="Nro. partidas de este match">
          <button class="button is-toggle is-rounded has-background-success" title="Match a 1 partida">1</button>
          <button class="button is-toggle" title="Match a 3 partidas">3</button>
          <button class="button is-toggle" title="Match a 5 partidas al match">5</button>
          <button class="button is-toggle" title="Match a 10 partidas">10</button>
          <button class="button is-toggle is-rounded" title="Match a 16 partidas">16</button>
        </div>
      </div>
    </div>
  </div>
  <div class="columns is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-clock"></span>
        </span>
        <span>Minutos</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons gameclock" title="Establece la duración de las partidas en minutos">
          <button class="button is-toggle is-rounded has-background-success" title="Partidas de 3 minutos">3'</button>
          <button class="button is-toggle" title="Partidas de 5 minutos">5'</button>
          <button class="button is-toggle" title="Partidas de 10 minutos">10'</button>
          <button class="button is-toggle is-rounded" title="Partidas de 30 minutos">30'</button>
        </div>
      </div>
    </div>
  </div>
  <div class="columns is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-stopwatch"></span>
        </span>
        <span>Compensación en segundos</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons gamecompensation" title="Agregar compensación por movimiento">
          <button class="button is-toggle is-rounded" title="Partidas sin compensación por movimiento">+0</button>
          <button class="button is-toggle" title="Partidas con 1 segundo de compensación por cada movimiento">+1</button>
          <button class="button is-toggle has-background-success" title="Partidas con 2 segundos de compensación por cada movimiento">+2</button>
          <button class="button is-toggle is-rounded" title="Partidas con 3 segundos de compensación por cada movimiento">+3</button>
        </div>
      </div>
    </div>
  </div>

  </div>`);
        swal({
          title: 'Editar Grupo',
          buttons: ["Cancelar", "Actualizar"],
          closeOnClickOutside: false,
          content: {
            element: 'div',
            attributes: {
              innerHTML: `${template}`,
            }
          }
        }).then(accept => {
          if (accept) {
            var gameclock = document.querySelector('.gameclock > .has-background-success')
            var roundsCont = document.querySelector('.rounds > .has-background-success')
            var gamecompensation = document.querySelector('.gamecompensation > .has-background-success')
            var minutes = parseInt(gameclock.textContent)
            var rounds = parseInt(roundsCont.textContent)
            var compensation = parseInt(gamecompensation.textContent)

            swal({
              title: "Actualizando grupo",
              text: 'Tu grupo se está actualizando...',
              buttons: false
            })

            setTimeout(() => {
              let group = {
                id: this.data._id,
                minutes: minutes,
                rounds: rounds,
                compensation: compensation
              }

              axios.post('/group/update', group).then(res => {
                this.isLoading = false
                swal.close()
                if (res.data.status === 'success') {
                  this.data = res.data.data
                  snackbar('success', `Grupo actualizado`)
                } else {
                  snackbar('error', `Algo pasó y no se pudo crear el grupo`)
                }
              })
            }, 1000)
          }
        })

        setTimeout(() => {

          console.log('1')
          document.querySelectorAll('.rounds .button').forEach(e => {
            let value = parseInt(e.innerHTML)
            e.classList.remove('has-background-success')
            if (this.data.rounds === value) {
              e.classList.add('has-background-success')
            }
          })

          console.log('2')
          document.querySelectorAll('.gameclock .button').forEach(e => {
            let value = parseInt(e.innerHTML)
            e.classList.remove('has-background-success')
            if (this.data.minutes === value) {
              e.classList.add('has-background-success')
            }
          })

          console.log('3')
          document.querySelectorAll('.gamecompensation .button').forEach(e => {
            let value = parseInt(e.innerHTML)
            e.classList.remove('has-background-success')
            if (this.data.compensation === value) {
              e.classList.add('has-background-success')
            }
          })

        },50)
      },
      loadGroup (){
        this.$root.loading = true
        var t = this
        axios.post('/group',{
          id:this.$route.params.group
        }).then((res) => {
          this.$root.loading = false
          this.data = res.data
          this.group = {
            group: res.data,
            player: this.player
          }
          this.$socket.emit('group_join', this.group)
        })
      },
      gameStart (data){
        return new Promise(function(resolve,reject){

          var pos = 'start'
          var pieces = '/static/img/chesspieces/classic/{piece}.png'

          if(data.fen){
            pos = data.fen
          }

          if(this.player.pieces){
            pieces = '/static/img/chesspieces/' + t.player.pieces + '/{piece}.png'
            this.boardColor = this.player.board
          }

          var cfg = {
            draggable: false,
            position: pos,
            pieceTheme:pieces
          }

          setTimeout(() => {
            this.games[data.id] = new Chess
            this.boards[data.id] = new Chessboard('board' + data.id,cfg)

            if(data.pgn){
              this.games[data.id].load_pgn(data.pgn)
            }
            resolve()
          },500)        
        })
      },
      colorize: function(str) {
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
        return '#' + Array(6 - color.length + 1).join('0') + color;
      },
      gameMove: function(data){
        if(!this.games[data.id]){
          this.gameStart(data).then(() => {
            this.makeMove(data)
          })        
        } else {
          this.makeMove(data)
        }
      },
      makeMove: function(data){
        setTimeout(() => {
          var moveObj = ({
            from: data.from,
            to: data.to,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
          });
          // see if the move is legal
          var move = this.games[data.id].move(moveObj)

          if (move === null) {
            return 'snapback'
          }

          for(var i in this.matches){
            if(this.matches[i].id === data.id){
              this.matches[i].wtime = data.wtime
              this.matches[i].btime = data.btime
            }
          }

          this.boards[data.id].position(data.fen)
          this.updateMoves(data.id,move)
        },500)
      },
      gameFlip: function(id){
        this.boards[id].flip()
        const white = document.querySelector('.board-container.b' + id + ' .white').innerHTML
        const black = document.querySelector('.board-container.b' + id + ' .black').innerHTML
        document.querySelector('.board-container.b' + id + ' .white').innerHTML = black
        document.querySelector('.board-container.b' + id + ' .black').innerHTML = white
        this.highlightLastMove(id)
      },
      updateMoves:function(id,move){
        var sound = 'move.mp3'
        var game = this.games[id] 
        var data = {}

        for(var i in this.matches){
          if(this.matches[i].id === id){
            data = this.matches[i]
          }
        }

        if(game.game_over()){
          if(game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
            var message = 'Esta partida finalizó en tablas'
            if(game.in_stalemate()){
              message = 'Esta partida finalizó en tablas por rey ahogado'
            } else if(game.in_threefold_repetition()){
              message = 'Esta partida finalizó en tablas por triple repetición'
            }
            document.querySelector('.board-container.b' + id + ' .match-status').innerHTML = message
          } else {          
            const winner = game.turn() === 'w' ? data.black : data.white
            document.querySelector('.board-container.b' + id + ' .match-status').innerHTML = winner + ' ganó esta partida'
          }
          
          sound = 'game-end.mp3'
          game.announced_game_over = true
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

          if (game.in_check() === true) {
            sound = 'check.ogg'
          }

          this.removeHighlight(id)
          this.addHightlight(id,move)
          //playSound(sound)
        }
      },
      removeHighlight : function(id) {
        document.getElementById('board' + id).querySelectorAll('.square-55d63').forEach((item) => {
          item.classList.remove('highlight-move')
          item.classList.remove('in-check')
        })
      },
      addHightlight : function(id,move){
        var game = this.games[id]
        this.removeHighlight(id);
        if(move){
          if (game.in_check() === true) {
            document.getElementById('board' + id).querySelector('img[data-piece="' + game.turn() + 'K"]').parentNode.classList.add('in-check')
          }
          setTimeout(function(){
            document.getElementById('board' + id).querySelector('.square-' + move.from).classList.add('highlight-move');
            document.getElementById('board' + id).querySelector('.square-' + move.to).classList.add('highlight-move');   
          },200)
        }
      },
      highlightLastMove: function(id){
        var history = this.games[id].history({verbose:true})
        if(history.length){
          var move = history[history.length-1]
          document.getElementById('board' + id).querySelector('.square-' + move.from).classList.add('highlight-move')
          document.getElementById('board' + id).querySelector('.square-' + move.to).classList.add('highlight-move')
        }
      },
      welcomeMsg () {
        let message = `🤝 Saludos ${this.player.code} que nos visita desde ${this.player.country} ${this.player.flag}` + (this.player.observe ? ` Estas en modo observador.` : ` Antes de jugar podés `) +  `<a href="/preferences" class="has-text-success">establecer preferencias</a>`
        this.$socket.emit('group_chat', { 
          group: this.$route.params.group,
          sender: 'chatbot',
          line: message
        })
      },
      sendChat: function() {
        if(this.chat.trim()==='') this.chat = '🤝'
        this.$socket.emit('chat', { 
          id: this.$route.params.group,
          sender: this.player.code,
          line: this.chat
        })
        this.chat = ''
      },
      clickObserve: function(data) { 
        if(data === this.player.code){
          snackbar('error','No podés jugar contra vos mismo')   
        } else {
          snackbar('default', data + ' Está en modo Observador y no acepta invitaciones') 
        }        
      },
      play: function(player) {
        if (player.code === this.player.code) {
          return snackbar('error','No podés jugar contra vos mismo') 
        }
        const template = (`
<div class="content">
  <div class="columns columns-bottom is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-clock"></span>
        </span>
        <span>Rondas</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons rounds" title="Nro. partidas de este match">
          <button class="button is-toggle is-rounded has-background-success" title="Match a 1 partida">1</button>
          <button class="button is-toggle" title="Match a 3 partidas">3</button>
          <button class="button is-toggle" title="Match a 5 partidas al match">5</button>
          <button class="button is-toggle" title="Match a 10 partidas">10</button>
          <button class="button is-toggle is-rounded" title="Match a 16 partidas">16</button>
        </div>
      </div>

      <span class="playercolor"><span class="has-background-success is-random-pieces"></span></span>

      <!--div class="control" title="Selecciona el color de tus piezas">
        <div class="buttons levels has-addons playercolor preservefilter">
          <button class="button is-toggle is-large is-rounded has-background-success is-white-pieces" title="Jugar con blancas">
          </button>
          <button class="button is-toggle is-large is-random-pieces" title="Que vaya a sorteo">
          </button>
          <button class="button is-toggle is-large is-rounded is-black-pieces" title="Jugar con negras">
          </button>
        </div>
      </div-->
    </div>
  </div>
  <div class="columns is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-clock"></span>
        </span>
        <span>Minutos</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons gameclock" title="Establece la duración de la partida en minutos">
          <button class="button is-toggle is-rounded has-background-success" title="Agregar 3 minutos a la partida">3'</button>
          <button class="button is-toggle" title="Agregar 5 minutos a la partida">5'</button>
          <button class="button is-toggle" title="Agregar 10 minutos a la partida">10'</button>
          <button class="button is-toggle is-rounded" title="Agregar 30 minutos a la partida">30'</button>
        </div>
      </div>
    </div>
  </div>
  <div class="columns is-flex has-text-centered">
    <div class="column">
      <h4>
        <span class="icon">
          <span class="fas fa-stopwatch"></span>
        </span>
        <span>Compensación en segundos</span>
      </h4>
      <div class="control has-text-centered column">
        <div class="buttons levels has-addons gamecompensation" title="Agregar compensación por movimiento">
          <button class="button is-toggle is-rounded" title="Jugar sin compensación por movimiento">+0</button>
          <button class="button is-toggle" title="Agregar 1 segundo de compensación por cada movimiento">+1</button>
          <button class="button is-toggle has-background-success" title="Agregar 2 segundos de compensación por cada movimiento">+2</button>
          <button class="button is-toggle is-rounded" title="Agregar 3 segundos de compensación por cada movimiento">+3</button>
        </div>
      </div>
    </div>
  </div>

</div>`);
        swal({
          title: 'Invitar a ' + player.code,
          buttons: ["Cancelar", "Invitar"],
          closeOnClickOutside: false,
          content: {
            element: 'div',
            attributes: {
              innerHTML: `${template}`,
            }
          }
        }).then(accept => {
          if (accept) {
            var playercolor = document.querySelector('.playercolor > .has-background-success')
            var gameclock = document.querySelector('.gameclock > .has-background-success')
            var roundsCont = document.querySelector('.rounds > .has-background-success')
            var gamecompensation = document.querySelector('.gamecompensation > .has-background-success')
            var white = this.player
            var black = player
            var minutes = parseInt(gameclock.textContent)
            var rounds = parseInt(roundsCont.textContent)
            var compensation = parseInt(gamecompensation.textContent)

            if(playercolor.classList.contains('is-black-pieces')){
              white = player
              black = this.player
            } 

            if(playercolor.classList.contains('is-random-pieces')){
              const coin = Math.floor(Math.random() * 1)
              if(coin){
                white = player
                black = this.player
              } else {
                white = this.player
                black = player
              }
            }

            swal({
              title: "Esperando confirmación...",
              text: player.code + ' debe responder la solicitud',
              buttons: false
            })

            let game = {
              asker: this.player,
              player: player,
              white: white,
              black: black,
              minutes: minutes,
              rounds: rounds,
              round: 1,
              compensation: compensation
            }

            this.$socket.emit('invite', game)
          }
        })

        setTimeout(() => {
          const saved = JSON.parse(localStorage.getItem('player'))
          let pieces = ['.is-white-pieces','.is-black-pieces','.is-random-pieces']
          pieces.forEach(tag => {
            let e = document.querySelector(tag)
            let li = window.getComputedStyle(e);
            e.style.backgroundImage = li.getPropertyValue('background-image').split('classic').join(saved.pieces)
          })
        },10)
      }
    }
  }
</script>