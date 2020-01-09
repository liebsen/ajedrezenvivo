<template>
  <div class="container is-widescreen">
    <div class="content column">
      <h3>
        <span class="icon">
          <span class="fas fa-book"></span>
        </span> 
        <span>Aperturas</span>
      </h3>
      <form @submit.prevent="submit">
        <div class="field has-addons">
          <div class="control">
            <input ref="input" v-model="query" class="input is-rounded" type="text" placeholder="Nombre o PGN" autofocus>
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
      <div v-if="data.length" class="has-text-left">
        <table class="table is-narrow is-striped is-fullwidth">
          <thead>
            <th></th>
            <th>ECO</th>
            <th>Nombre</th>
            <th>Movimientos</th>
          </thead>
          <tbody>
            <tr v-for="item in data">
              <td>
                <router-link :to="'/eco/'+item.eco">
                  <span class="icon">
                    <span class="fa fa-play"></span>
                  </span>
                </router-link>
              </td>
              <td>
                <span v-html="item.eco"></span>
              </td>
              <td>
                <span v-html="item.name"></span>
              </td>
              <td>
                <span v-html="$root.countMoves(item.pgn)"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

  import axios from 'axios'
  import snackbar from '../components/Snackbar'

  export default {
    name: 'eco',
    watch: {
      '$route': function () {
        this.triggerSearch()
      }
    },
    mounted: function(){
      //snackbar('info','Por favor ingresa una palabra clave para ver aperturas. Puedes buscar por nombre de apertura o PGN.', 15000);  
      this.triggerSearch()
    },
    methods : {
      triggerSearch: function(){
        if(this.$route.query.q){
          this.query = this.$route.query.q
        }
        if(this.$route.query.offset){
          this.offset = parseInt(this.$route.query.offset)
        }
        this.$nextTick(() => this.$refs.input.focus())
        this.search()
      },
      search: function() {
        this.$root.processing = true
        this.data = []
        axios.get( '/assets/json/eco_es.json').then((response) => {
          const query = this.query.toLowerCase()
          if(query.length){
            response.data.forEach((item) => {
              if(item.name.toLowerCase().indexOf(query) > -1 || item.pgn.toLowerCase().indexOf(query) > -1 || item.eco.toLowerCase().indexOf(query) > -1){
                this.data.push(item)
              }
            })
          } else {
            this.data = response.data
          }

          if(this.data.length===0){
            snackbar('danger','No hay partidas que coincidan con tu palabra clave.', 5000);
          } 
          this.$root.processing = false
        })      
      },
      submit: function(){
        this.$router.push('/eco?q=' + this.query)
      }    
    },
    data () {
      return {
        data:[],
        query:'',
        limit:10,
        offset:0,
        msg: 'Results'
      }
    }
  }
</script>