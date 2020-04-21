<template>
  <section class="hero fadeIn">
    <div class="hero-body">
      <div class="container is-flex-column is-vertical">
        <h1 class="title">
          <span class="icon is-margin-right">
            <span class="fa fa-robot"></span>
          </span> 
          <span>Este recurso no existe</span>
        </h1>
        <p jsb-word="not-found-text">Si creés que se trata de un error contáctanos</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'NotFound',
  data () {
    return {
      msg: 'Welcome to JetsBooking'
    }
  }
}
</script>
