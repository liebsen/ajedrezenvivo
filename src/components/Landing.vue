<template>
  <div class="container is-widescreen">
    <div class="area has-text-centered preservefilter">
      <div class="columns is-vcentered fadeIn">
        <div class="column is-hidden-mobile"></div>
        <div class="column is-8 has-text-centered">
          <div class="content is-hidden-mobile">
            <h1 class="has-text-white"></a>Estudia, entrena y gana</h1>
            <h6></h6>
          </div>
          <div class="content is-hidden-tablet">
            <h2 class="has-text-white"></a>Estudia, entrena y gana</h2>
            <h6></h6>
          </div>
          <div class="has-text-centered">
            <form id="search" class="has-text-centered" @submit.prevent="submit">
              <div class="field has-addons is-hidden-mobile is-flex-centered">
                <div class="control">
                  <input v-model="query" class="input is-medium is-white is-rounded" name="query" type="text" placeholder="Evento, jugador o PGN" autofocus>
                </div>
                <div class="control">
                  <button type="submit" id="searchbtn" class="button is-medium is-rounded is-white">
                    <span class="icon has-text-info">
                      <span class="fas fa-search"></span>
                    </span>
                  </button>
                </div>
              </div>
              <div class="field has-addons is-hidden-tablet is-flex-centered">
                <div class="control">
                  <input v-model="query" class="input is-rounded" name="query" type="text" placeholder="Evento, jugador o PGN" autofocus>
                </div>
                <div class="control">
                  <button type="submit" id="searchbtn" class="button is-rounded is-white">
                    <span class="icon has-text-info">
                      <span class="fas fa-search"></span>
                    </span>
                  </button>
                </div>
              </div>
            </form>     
          </div>       
          <div class="has-text-centered">
            <h4 class="has-text-white">Jugar contra</h4>
            <h6>&nbsp;</h6>
          </div>
          <div class="columns is-vcentered has-text-centered is-hidden-mobile">
            <div class="column has-text-right">
              <router-link class="button is-rounded is-medium is-success" to="/lobby">
                <span class="icon">
                  <span class="fas fa-user"></span>
                </span> 
                <span>Humano</span>
              </router-link>    
            </div>
            <div class="column has-text-left">
              <router-link class="button is-rounded is-medium is-danger" to="/stockfish">
                <span class="icon">
                  <span class="fas fa-server"></span>
                </span> 
                <span>Stockfish</span>
              </router-link>              
            </div>
          </div>
          <div class="columns is-vcentered has-text-centered is-hidden-tablet">
            <div class="column">
              <router-link class="button is-rounded is-success" to="/lobby">
                <span class="icon">
                  <span class="fas fa-user"></span>
                </span> 
                <span>Humano</span>
              </router-link>    
            </div>
            <div class="column">
              <router-link class="button is-rounded is-danger" to="/stockfish">
                <span class="icon">
                  <span class="fas fa-server"></span>
                </span> 
                <span>Stockfish</span>
              </router-link>              
            </div>
          </div>
        </div>
        <div class="column is-hidden-mobile"></div>
      </div>
      <ul class="pieces">
        <li class="black"></li>
        <li class="black"></li>
        <li class="black"></li>
        <li class="black"></li>
        <li class="black"></li>
        <li class="black"></li>
        <li class="white"></li>
        <li class="white"></li>
        <li class="white"></li>
        <li class="white"></li>
        <li class="white"></li>
        <li class="white"></li>
      </ul>
      <div class="chessboard-63f37 fakeboard">
          <div class="board-b72b1" style="width: 100%;">
              <div class="row-5277c">
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="clearfix-7da63"></div>
              </div>
              <div class="row-5277c">
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="square-55d63 black-3c85d"></div>
                  <div class="square-55d63 white-1e1d7"></div>
                  <div class="clearfix-7da63"></div>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'landing',
  mounted: function(){
    const saved = JSON.parse(localStorage.getItem('player'))
    const board = document.querySelector('.chessboard-63f37')
    board.classList = []
    board.classList.add('chessboard-63f37')
    board.classList.add('fakeboard')
    board.classList.add(saved.board)
    document.querySelectorAll('.pieces li').forEach(e => {
      let li = window.getComputedStyle(e);
      e.style.backgroundImage = li.getPropertyValue('background-image').replace('classic',saved.pieces)
    })
  },
  methods: {
    submit: function(){
      this.$router.push('/results?q=' + this.query)
    }
  },
  data () {
    return {
      query: null
    }
  }
}
</script>