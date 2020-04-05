<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn">
      <h3>
        <span class="icon">
          <span class="fas fa-book"></span>
        </span> 
        <span>Aperturas</span>
      </h3>
      <form @submit.prevent="submit">
        <div class="field has-addons">
          <div class="control">
            <input ref="input" @keyup="inputTrigger" v-model="query" class="input is-rounded is-success" type="text" placeholder="Nombre o PGN" autofocus>
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
      <div v-show="Object.keys(data).length" class="has-text-left">
        <table class="table is-narrow is-striped is-fullwidth">
          <thead>
            <th></th>
            <th>ECO</th>
            <th>Nombre</th>
            <th>Plys</th>
          </thead>
          <tbody>
            <tr v-for="item in data.games">
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
    <nav class="pagination is-centered is-rounded" role="navigation" aria-label="pagination">
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
  import snackbar from '../components/Snackbar'

  export default {
    name: 'eco',
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
          this.$router.push({ path: 'eco', query: { q: this.query }})
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
        axios.post('/eco/search', {query:this.query,offset:this.offset,limit:this.limit} ).then((res) => {
          this.data = res.data
          var pages = []
          if(res.data.error){
            if(res.data.error==='not_enough_params'){
              snackbar('info','Ingresá una palabra clave para ver aperturas. Podés buscar por nombre o PGN.', 15000);  
            }
          } else {
            if(res.data.count===0){
              snackbar('danger','No hay aperturas que coincidan con tu palabra clave.', 5000);
            } else {
              var numPages = Math.ceil(res.data.count/this.limit)
              for(var i=0;i< numPages;i++){
                pages[i] = i*this.limit
              }
              snackbar('success','Se econtraron ' + this.data.count  +  ' apertura' + (this.data.count>1?'s':'')  + '. Mostrando resultados de ' + (this.offset + 1) + ' a ' + (this.offset + this.limit > this.data.count ? this.data.count : this.offset + this.limit ), 5000);
            }
          }

          let max = 20
          
          if (pages.length > max) {
            pages.splice(max / 2, pages.length - max)
          }

          this.pages = pages
          this.$root.loading = false
        })    
      },
      submit: function(){
        this.$router.push('/eco?q=' + this.query.trim())
      }    
    },
    data () {
      return {
        data:{count:0,games:[]},
        pages:{},
        query:'',
        limit:10,
        offset:0
      }
    }
  }
</script>