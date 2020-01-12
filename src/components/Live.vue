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
        <div class="field has-addons">
          <div class="control">
            <input ref="input" v-model="query" class="input is-rounded is-success" type="text" placeholder="Evento, lugar, fecha, jugador o PGN" autofocus>
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
      <div v-if="Object.keys(data).length" class="has-text-left">
        <table class="table">
          <thead>
            <th>Mesa</th>
            <th>Evento</th>
            <th>Blancas</th>
            <th>Negras</th>
            <th>Movimientos</th>
          </thead>
          <tbody>
            <tr v-for="item in data">
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
          <router-link :to="'?q=' + query + '&offset=' + page" class="pagination-link" :class="{'is-current': offset == page}" :title="'Ir a página ' + index"></router-link>
        </li>
      </ul>
    </nav>     
  </div>
</template>

<script>

  import axios from 'axios'
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
        axios.post( this.$root.endpoint + '/online', {
          query:this.query,
          offset:this.offset,
          limit:this.limit
        }).then((response) => {
          this.data = response.data
          var count = Object.keys(response.data).length
          if(response.data.error){
            if(res.data.error==='not_enough_params'){
              snackbar('info','Por favor ingresa una palabra clave para ver partidas. Puedes buscar por evento, lugar, jugador o PGN.', 15000);  
            }
          } else {
            if(count===0){
              snackbar('danger','No hay partidas que coincidan con tu palabra clave.', 5000);
            } else {
              var numPages = Math.ceil(count/this.limit)
              for(var i=1;i< numPages+1;i++){
                this.pages[i] = (i-1)*this.limit
              }
              snackbar('success','Se econtraron ' + count  +  ' partida' + (count>1?'s':'')  + '. Mostrando resultados de ' + (this.offset + 1) + ' a ' + (this.offset + this.limit > count ? count : this.offset + this.limit ), 5000);
            }
          }
          this.$root.loading = false
        })      
      },
      submit: function(){
        this.$router.push('/live?q=' + this.query)
      }    
    },
    data () {
      return {
        data:{},
        pages:{},
        query:'',
        limit:10,
        offset:0,
        msg: 'Live'
      }
    }
  }
</script>
