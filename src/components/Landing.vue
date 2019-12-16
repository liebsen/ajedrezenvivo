<template>
  <div class="hero is-info">
    <div class="hero-body is-illustrated has-text-centered fadeIn">
      <div class="columns">
        <div class="column is-hidden-mobile"></div>
        <div class="column is-8 has-text-centered">
          <div class="content">
            <h1 class="has-text-white"></a>Estudiá, entrená y ganá</h1>
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
            <h4>Jugar contra</h4>
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