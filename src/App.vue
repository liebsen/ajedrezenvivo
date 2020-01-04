<template>
  <div>
    <svg v-show="$root.loading" class="spinner-container" viewBox="0 0 44 44">
        <circle class="path" cx="22" cy="22" r="20" fill="none" stroke-width="4"></circle>
    </svg>
  
    <div class="menu hidden-loading slideDown">
      <div class="menu-container is-flex columns is-vcentered">
        <div class="column has-text-left">
          <router-link class="menu-logo" to="/">
            <img src="/assets/img/logo.png" alt="AjedrezEV">
          </router-link>
          <pre v-html="$root.player.observe"></pre>
        </div>
        <div class="column menu-primary has-text-right">
          <div class="is-hidden-mobile">
            <router-link to="/preferences" class="button is-rounded is-white is-outlined" title="Establece tus preferencias">
              <span class="icon">
                <span v-if="$root.player.observe" class="fas fa-user-astronaut"></span>
                <span v-else class="fas fa-user"></span>
              </span>
              <span v-html="$root.player.code"></span>
            </router-link>
            <!--router-link v-show="$root.players.length > 1" to="/lobby" class="button is-white is-outlined is-rounded fadeIn" title="Jugadores esperando invitación">
              <span v-html="$root.players.length - 1"></span>
            </router-link-->
          </div>
          <div class="is-hidden-tablet">
            <router-link to="/preferences" class="button is-small is-rounded">
              <span class="icon">
                <span v-if="$root.player.observe" class="fas fa-user-astronaut"></span>
                <span v-else class="fas fa-user"></span>
              </span>
              <span v-html="$root.player.code"></span>
            </router-link>
            <router-link v-show="$root.players.length > 1" to="/lobby" class="button is-small is-warning is-rounded fadeIn">
              <span v-html="$root.players.length - 1"></span>
            </router-link>
          </div>
        </div>
        <div class="menu-bg"></div>
        <div class="menu-burger">
          <svg viewBox="0 0 800 600">
            <path d="M300,220 C300,220 520,220 540,220 C740,220 640,540 520,420 C440,340 300,200 300,200" id="top"></path>
            <path d="M300,320 L540,320" id="middle"></path>
            <path d="M300,210 C300,210 520,210 540,210 C740,210 640,530 520,410 C440,330 300,190 300,190" id="bottom" transform="translate(480, 320) scale(1, -1) translate(-480, -318)"></path>
          </svg>
        </div>
      </div>       

      <div class="menu-items">
        <router-link to="/"><img src="/assets/img/logo.png"></router-link>
        <div class="menu-links has-text-left">
          <router-link to="/eco">
            <span class="icon">
              <span class="fas fa-book"></span>
            </span> 
            <span>Aperturas</span>
          </router-link>
          <router-link to="/live">
            <span class="icon">
              <span class="fas fa-fire"></span> 
            </span>
            <span>En vivo</span>
          </router-link>
          <router-link to="/results">
            <span class="icon">
              <span class="fas fa-list"></span>
            </span> 
            <span>Resultados</span>
          </router-link>
          <!--router-link to="/puzzles"><span class="aev-icon">🔖</span> Puzzles</router-link-->
          <router-link to="/about">
            <span class="icon">
              <span class="fa fa-info"></span>
            </span> 
            <span>Acerca de</span>
          </router-link>
          <router-link to="/contact">
            <span class="icon">
              <span class="fas fa-envelope"></span>
            </span> 
            <span>Contacto</span>
          </router-link>
          <router-link to="/preferences">
            <span class="icon">
              <span class="fas fa-sliders-h"></span>
            </span> 
            <span>Preferencias</span>
          </router-link>
        </div>
        <div class="column">
          <div class="has-text-centered">
            <router-link to="/lobby" class="button is-rounded is-success">
              <span class="icon">
                <span class="fas fa-user"></span>
              </span>
              <span>Humano</span>
            </router-link>
            <router-link class="button is-rounded is-info" to="/stockfish">
              <span class="icon">
                <span class="fas fa-server"></span>
              </span> 
              <span>Stockfish</span>
            </router-link>
          </div>
        </div>
      </div>    
    </div>  

    <keep-alive include="lobby">
      <router-view :key="$route.fullPath" v-show="!$root.loading" />
    </keep-alive>

    <div class="tosprompt"></div> 

    <div class="ui-snackbar ui-snackbar--is-inactive" :class="{ 'is-strong' : $root.player.strongnotification }">
      <p class="ui-snackbar__message"></p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      ver: '2.0.1'
    }
  }
}
</script>
