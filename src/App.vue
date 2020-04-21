<template>
  <div>
    <svg v-show="$root.loading" class="spinner-container" viewBox="0 0 44 44">
      <circle class="path" cx="22" cy="22" r="20" fill="none" stroke-width="4"></circle>
    </svg>
    <div class="menu hidden-loading slideDown preservefilter">
      <div class="menu-container is-flex columns is-vcentered">
        <div class="column menu-logo has-text-left">
          <router-link to="/">
            <img src="/static/img/logo.png" alt="AjedrezEV">
          </router-link>
        </div>
        <div class="column menu-primary has-text-right">
          <div class="is-hidden-mobile">
            <div class="buttons levels has-addons is-pulled-right">
              <router-link v-if="player" to="/preferences" class="button is-rounded is-grey" title="Establece tus preferencias">
                <span class="icon">
                  <span v-html="player.flag"></span>
                </span>
                <span v-html="player.code"></span>
              </router-link>
              <a @click="$root.play" class="button is-rounded is-success" :class="{ 'is-loading': $root.isFindingOpponent }" title="Buscar oponente">
                <span class="icon has-text-white">
                  <span class="fas fa-handshake"></span>
                </span>
              </a>
            </div>
          </div>
          <div v-if="player" class="is-hidden-tablet">
            <div class="buttons levels has-addons is-pulled-right">
              <router-link to="/preferences" class="button is-small is-rounded" title="Establece tus preferencias">
                <span class="icon">
                 <span v-html="player.flag"></span>
                </span>
                <span v-html="player.code"></span>
              </router-link>
              <a @click="$root.play" class="button is-small is-success is-rounded" :class="{ 'is-loading': $root.isFindingOpponent }" title="Buscar oponente">
                <span class="icon has-text-white">
                  <span class="fas fa-handshake"></span>
                </span>
              </a>
            </div>
          </div>
        </div>
        <div class="menu-burger" title="Abrir menú principal">
          <svg viewBox="0 0 800 600">
            <path d="M300,220 C300,220 520,220 540,220 C740,220 640,540 520,420 C440,340 300,200 300,200" id="top"></path>
            <path d="M300,320 L540,320" id="middle"></path>
            <path d="M300,210 C300,210 520,210 540,210 C740,210 640,530 520,410 C440,330 300,190 300,190" id="bottom" transform="translate(480, 320) scale(1, -1) translate(-480, -318)"></path>
          </svg>
        </div>
      </div>       
      <div class="menu-bg"></div>
      <div class="menu-items">
        <div>
          <router-link class="has-text-centered" to="/">
            <img src="/static/img/logo.png">
          </router-link>
          <div class="menu-links has-text-left">
            <router-link to="/groups">
              <span class="icon">
                <span class="fas fa-layer-group"></span>
              </span> 
              <span>Grupos</span>
            </router-link>
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
            <router-link to="/preferences">
              <span class="icon">
                <span class="fas fa-paint-brush"></span>
              </span> 
              <span>Preferencias</span>
            </router-link>
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
            <router-link to="/donate">
              <span class="icon">
                <span class="fas fa-hands"></span>
              </span> 
              <span>Donate</span>
            </router-link>
          </div>
          <div class="column">
            <div class="has-text-centered">
              <a @click="$root.createGroup" class="button is-rounded is-white is-outlined" :class="{ 'is-loading': $root.isCreatingGroup }">
                <span class="icon">
                  <span class="fas fa-layer-group"></span>
                </span> 
                <span>Nuevo Grupo</span>
              </a>
            </div>
          </div>
        </div>
      </div>    
    </div>  

    <keep-alive include="lobby">
      <router-view :key="$route.fullPath" />
    </keep-alive>

    <div class="tosprompt preservefilter"></div> 

    <div class="ui-snackbar ui-snackbar--is-inactive preservefilter" :class="{ 'is-strong' : player && player.strongnotification }">
      <p class="ui-snackbar__message"></p>
    </div>

  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'app',
  computed: {
    ...mapState([
      'player',
      'games',
    ])
  }
}
</script>
