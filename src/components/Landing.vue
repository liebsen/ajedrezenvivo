<template>
  <div class="container is-widescreen">
    <div class="area has-text-centered fadeIn">
      <div class="columns is-flex is-vcentered">
        <div class="column is-hidden-mobile"></div>
        <div class="column is-8 has-text-centered">
          <div class="content is-hidden-mobile">
            <h1 class=""></a>Estudia, entrena y gana</h1>
            <h6></h6>
          </div>
          <div class="content is-hidden-tablet">
            <h3 class=""></a>Estudia, entrena y gana</h3>
            <h6></h6>
          </div>
          <div class="has-text-centered">
            <form id="search" class="has-text-centered" @submit.prevent="submit">
              <div class="field has-addons is-hidden-mobile is-flex-centered">
                <div class="control">
                  <input v-model="query" class="input is-medium is-success is-rounded" name="query" type="text" placeholder="Evento, jugador o PGN" autofocus>
                </div>
                <div class="control">
                  <button type="submit" id="searchbtn" class="button is-medium is-rounded is-success">
                    <span class="icon">
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
                  <button type="submit" id="searchbtn" class="button is-rounded is-success">
                    <span class="icon">
                      <span class="fas fa-search"></span>
                    </span>
                  </button>
                </div>
              </div>
            </form>     
          </div>       
          <div class="has-text-centered">
            <h4 class="">Jugar contra</h4>
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
              <router-link class="button is-rounded is-fullwidth is-success" to="/lobby">
                <span class="icon">
                  <span class="fas fa-user"></span>
                </span> 
                <span>Humano</span>
              </router-link>    
            </div>
            <div class="column">
              <router-link class="button is-rounded is-fullwidth is-danger" to="/stockfish">
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
      <ul class="circles">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'landing',
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

<style>

#search .has-addons {
  margin-bottom: 1.25rem;
}

.area {
  display: inline-flex;
  position: fixed;
  left: 0;
  right: 0;
  top: 60px;
  padding: 2rem;
  min-height: 100%;
}

.area > .columns {
  width: 100%;
  margin-left: 0;
} 

.circles{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.circles li {
  display: block;
  position: absolute;
  bottom: -150px;    
  list-style: none;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
}

.circles li.white {
  animation: sink 25s linear infinite;
}

.circles li.black {
  animation: emerge 25s linear infinite;
}

.circles li:nth-child(1){
  left: 25%;
  width: 140px;
  height: 140px;
  background-image: url(/assets/img/chesspieces/neo/wK.png);
  animation-delay: 5s;
}

.circles li:nth-child(2){
  left: 10%;
  width: 180px;
  height: 180px;
  background-image: url(/assets/img/chesspieces/neo/wQ.png);
  animation-delay: 1s;
  animation-duration: 12s;
}

.circles li:nth-child(3){
  left: 70%;
  width: 90px;
  height: 90px;
  background-image: url(/assets/img/chesspieces/neo/wR.png);
  animation-delay: 7s;
}

.circles li:nth-child(4){
  left: 40%;
  width: 100px;
  height: 100px;
  background-image: url(/assets/img/chesspieces/neo/wB.png);
  animation-delay: 15s;
  animation-duration: 18s;
}

.circles li:nth-child(5){
  left: 65%;
  width: 80px;
  height: 80px;
  background-image: url(/assets/img/chesspieces/neo/wN.png);
  animation-delay: 11s;
}

.circles li:nth-child(6){
  left: 75%;
  width: 110px;
  height: 110px;
  background-image: url(/assets/img/chesspieces/neo/wP.png);
  animation-delay: 12s;
}

.circles li:nth-child(7){
  left: 35%;
  width: 140px;
  height: 140px;
  background-image: url(/assets/img/chesspieces/neo/bK.png);
  animation-delay: 2s;
}

.circles li:nth-child(8){
  left: 50%;
  width: 100px;
  height: 100px;
  background-image: url(/assets/img/chesspieces/neo/bQ.png);
  animation-delay: 10s;
  animation-duration: 45s;
}

.circles li:nth-child(9){
  left: 20%;
  width: 90px;
  height: 90px;
  background-image: url(/assets/img/chesspieces/neo/bR.png);
  animation-delay: 6s;
  animation-duration: 35s;
}

.circles li:nth-child(10){
  left: 85%;
  width: 150px;
  height: 150px;
  background-image: url(/assets/img/chesspieces/neo/bB.png);
  animation-delay: 3s;
  animation-duration: 11s;
}

.circles li:nth-child(11){
  left: 15%;
  width: 80px;
  height: 80px;
  background-image: url(/assets/img/chesspieces/neo/bN.png);
  animation-delay: 8s;
  animation-duration: 11s;
}

.circles li:nth-child(12){
  left: 50%;
  width: 160px;
  height: 160px;
  background-image: url(/assets/img/chesspieces/neo/bP.png);
  animation-delay: 4s;
  animation-duration: 11s;
}

@keyframes emerge {
  0%{
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }

  100%{
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
  }
}

@keyframes sink {
  0%{
    transform: translateY(-1000px) rotate(720deg);
    opacity: 1;
  }

  100%{
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
}

</style>