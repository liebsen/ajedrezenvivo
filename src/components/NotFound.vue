<template>
  <section class="hero fadeIn">
    <div class="hero-body">
      <div class="container is-flex-column is-vertical">
        <h1 class="title">
          <span class="icon">
            <span class="fa fa-chess-queen"></span>
          </span> 
          <span>Esta partida no existe</span>
        </h1>
        <p jsb-word="not-found-text">Si cree que se trata de un error por favor contáctenos.</p>
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
