<template>
  <div class="container is-widescreen">
    <section class="content column">
      <h3 class="title">
        <span class="icon">
          <span class="fas fa-cog"></span>
        </span> 
        <span>Preferencias</span>
      </h3>
      <div class="columns">
        <div class="column">
          <label class="label">Nick</label>
          <input type="text" v-model="data.code" class="input" required>
        </div>
        <div class="column">
          <label class="label">Disponible</label>
          <div class="field">
            <input v-model="data.available" class="is-checkradio has-background-color is-success" id="available" type="checkbox">
            <label for="available"></label>
          </div>
        </div>
        <div class="column">
          <label class="label">Temas</label>
          <div class="field">
            <input v-model="data.pieces" class="is-checkradio is-success" id="pieces1" type="radio" value="classic" :checked="!data.pieces">
            <label for="pieces1">Classic</label>
          </div>

          <div class="field">
            <input v-model="data.pieces" class="is-checkradio is-success" id="pieces2" type="radio" value="neo">
            <label for="pieces2">Neo</label>
          </div>

          <div class="field">
            <input v-model="data.pieces" class="is-checkradio is-success" id="pieces3" type="radio" value="wood">
            <label for="pieces3">Wood</label>
          </div>

          <div class="field">
            <input v-model="data.pieces" class="is-checkradio is-success" id="pieces4" type="radio" value="neon">
            <label for="pieces4">Neon</label>
          </div>
        </div>
      </div>
      <div class="columns has-text-centered">
        <div class="column">
          <input type="button" @click="submit" class="button is-rounded is-success" :class="{ 'is-loading' : loading }" value="Guardar">
        </div>
      </div>
    </section>
  </div>
</template>

<script>

  import snackbar from '../components/Snackbar'

  export default {
    name: 'preferences',
    mounted: function(){
      const saved = localStorage.getItem('player')
      if(saved){
        this.data = JSON.parse(saved)
        this.nick = this.data.code
      }
    },
    sockets: {
      nick: function (data) {
        if(this.nick === data.oldnick){
          this.loading = false
          if(data.exists){
            snackbar('error','Las preferencias no fueron guardadas: El nick ' + data.nick + ' ya está en uso. Por favor elija otro.')
          } else {
            snackbar('success','Las preferencias han sido guardadas correctamente')
            localStorage.setItem('player', JSON.stringify(this.data))
            this.$root.player = this.data
          }
        }
      }
    },
    methods: {
      submit: function(){
        if(this.nick === this.data.code){
          localStorage.setItem('player', JSON.stringify(this.data))
          this.$root.player = this.data
          snackbar('success','Las preferencias han sido guardadas correctamente')
        } else {
          this.loading = true
          this.$socket.emit('preferences',{
            nick:this.data.code,
            oldnick:this.nick
          })
        }
      }
    },
    data () {
      return {
        data:{},
        nick:null,
        loading: false
      }
    }
  }
</script>
