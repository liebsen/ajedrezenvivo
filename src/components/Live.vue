<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn">
      <h3>
        <span class="icon">
          <span class="fas fa-fire"></span> 
        </span>
        <span>En vivo</span>
      </h3>
      <form @submit.prevent="submit">
        <label class="label"><span v-html="eco.name" class="has-text-grey"></span></label>
        <div class="field has-addons">
          <div class="control">
            <input ref="input" @keyup="inputTrigger" v-model="query" class="input is-rounded is-success" type="text" placeholder="Evento, lugar, fecha, jugador o PGN" autofocus>
          </div>
          <div class="control">
            <button v-show="query.length" type="button" @click="clear" class="button is-rounded is-danger">
              <span class="icon">
                <span class="fas fa-times"></span>
              </span>
            </button>
            <button v-show="!query.length" type="submit" id="searchbtn" class="button is-rounded is-success">
              <span class="icon">
                <span class="fas fa-search"></span>
              </span>
            </button>
          </div>
        </div>
      </form>   
      <div v-if="Object.keys(data).length" class="has-text-left">
        <table class="table">
          <thead>
            <th>Mesa</th>
            <th>Evento</th>
            <th>Blancas</th>
            <th>Negras</th>
            <th>Plys</th>
          </thead>
          <tbody>
            <tr v-for="item in data.games">
              <td>
                <router-link :to="'/watch/'+item._id">
                  <span class="icon">
                    <span class="fa fa-play"></span>
                  </span>
                </router-link>
              </td>
              <td>
                <span v-html="item.event"></span>
              </td>
              <td>
                <span v-html="item.white"></span>
              </td>
              <td>
                <span v-html="item.black"></span>
              </td>
              <td>
                <span v-html="$root.countMoves(item.pgn)"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <nav class="pagination is-centered is-rounded" role="navigation" aria-label="pagination">
      <!--a class="pagination-previous">Previous</a>
      <a class="pagination-next">Next page</a-->
      <ul class="pagination-list">
        <li v-for="(page, index) in pages">
          <router-link :to="'?q=' + query + '&offset=' + page" class="pagination-link" :class="{'is-current': offset == page}" :title="'Ir a página ' + parseInt(page / limit + 1)"></router-link>
        </li>
      </ul>
    </nav>     
  </div>
</template>

<script>
  import axios from 'axios'
  import { mapState } from 'vuex'
  import snackbar from '../components/Snackbar';
  export default {
    name: 'live',
    watch: {
      '$route': function () {
        this.triggerSearch()
      }
    },
    mounted: function(){
      this.triggerSearch()
    },
    methods : {
      inputTrigger: function(){
        if(this.interval) clearInterval(this.interval)
        this.interval = setTimeout(() => {
          this.$router.push({ path: 'live', query: { q: this.query }})
        },1500)
      },
      clear: function(){
        this.query = ''
        this.submit()
      },
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
        this.$root.loading = true
        axios.post('/online', {query:this.query,offset:this.offset,limit:this.limit} ).then((res) => {
          this.data = res.data

          var pages = []
          if(res.data.error){
            if(res.data.error==='not_enough_params'){
              snackbar('info','Ingresá una palabra clave para ver partidas. Podés buscar por evento, lugar, jugador o PGN.', 15000);  
            }
          } else {
            if(res.data.count===0){
              snackbar('warning','No hay partidas en vivo', 5000);
            } else {
              var numPages = Math.ceil(res.data.count/this.limit)
              for(var i=0;i< numPages;i++){
                pages[i] = i*this.limit
              }
              snackbar('success','Se econtraron ' + this.data.count  +  ' partida' + (this.data.count>1?'s':'')  + '. Mostrando resultados de ' + (this.offset + 1) + ' a ' + (this.offset + this.limit > this.data.count ? this.data.count : this.offset + this.limit ), 5000);
            }
          }

          let max = 20
          
          if (pages.length > max) {
            pages.splice(max / 2, pages.length - max)
          }

          this.pages = pages
          this.$root.loading = false
          axios.post(this.$root.endpoint + '/eco/search/pgn', {pgn: this.query}).then((res2) => {
            if(res2.data){
              t.eco = res2.data
            }
          })
        })       
      },
      submit: function(){
        this.$router.push('/live?q=' + this.query.trim())
      }    
    },
    data () {
      return {
        data:{},
        pages:{},
        eco:{},
        query:'',
        limit:10,
        offset:0
      }
    }
  }
</script>
