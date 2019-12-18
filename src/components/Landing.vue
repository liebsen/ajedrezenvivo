<template>
  <div class="area has-text-centered fadeIn">

    <div class="columns is-vcentered">
      <div class="column is-hidden-mobile"></div>
      <div class="column is-8 has-text-centered">
        <div class="content is-hidden-mobile">
          <h1 class="has-text-white"></a>Estudiá, entrená y ganá</h1>
          <h6></h6>
        </div>
        <div class="content is-hidden-tablet">
          <h4 class="has-text-white"></a>Estudiá, entrená y ganá</h4>
          <h6></h6>
        </div>
        <div class="has-text-centered">
          <form id="search" class="has-text-centered" @submit.prevent="submit">
            <div class="field has-addons is-hidden-mobile">
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
            <div class="field has-addons is-hidden-tablet">
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
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
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

.area {
  display: inline-flex;
  position: fixed;
  left: 0;
  right: 0;
  top: 60px;
  padding: 2rem;
  min-height: 100%;
  background: linear-gradient(to left, #1f9cef, #4e54c8);  
}

.area > .columns {
  width: 100%;
} 

.area .field.has-addons {
  justify-content: center;
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

.circles li{
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  animation: animate 25s linear infinite;
  bottom: -150px;    
}

.circles li:nth-child(1){
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}

.circles li:nth-child(2){
  left: 10%;
  width: 20px;
  height: 20px;
  animation-delay: 2s;
  animation-duration: 12s;
}

.circles li:nth-child(3){
  left: 70%;
  width: 20px;
  height: 20px;
  animation-delay: 4s;
}

.circles li:nth-child(4){
  left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
  animation-duration: 18s;
}

.circles li:nth-child(5){
  left: 65%;
  width: 20px;
  height: 20px;
  animation-delay: 0s;
}

.circles li:nth-child(6){
  left: 75%;
  width: 110px;
  height: 110px;
  animation-delay: 3s;
}

.circles li:nth-child(7){
  left: 35%;
  width: 150px;
  height: 150px;
  animation-delay: 7s;
}

.circles li:nth-child(8){
  left: 50%;
  width: 25px;
  height: 25px;
  animation-delay: 15s;
  animation-duration: 45s;
}

.circles li:nth-child(9){
  left: 20%;
  width: 15px;
  height: 15px;
  animation-delay: 2s;
  animation-duration: 35s;
}

.circles li:nth-child(10){
  left: 85%;
  width: 150px;
  height: 150px;
  animation-delay: 0s;
  animation-duration: 11s;
}

@keyframes animate {
  0%{
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }

  100%{
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
}

</style>