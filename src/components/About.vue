<template>
  <div class="container">
    <section class="content column">
      <h3 class="title">
        <span class="icon">
          <span class="fa fa-info"></span>
        </span> 
        <span>Acerca de</span>
      </h3>
      <h2>¿Qué es?</h2>
      <p>AjedrezEV es una herramienta para seguir en vivo y estudiar el deporte del Ajedrez.</p>
      <blockquote class="has-background-info"><span class="has-text-white">Este proyecto es puramente educacional. Los participantes no reciben ningún tipo de financiación y no tienen ánimos de lucro por este proyecto.</span></blockquote>
      <h2>¿Qué hace?</h2>
      <p>AjedrezEV permite visualizar cualquier partida previemante emitida o cargada a partir de todos sus movimientos. AjedrezEV es una forma de ver y estudiar el ajedrez. También se puede jugar con un oponente humano y estudiar posteriormente esas partidas.</p>
      <h2>¿Qué objetivos persigue?</h2>
      <p>El código fuente de este proyecto fue creado y es mantenido por un solo desarrollador ad honorem. Actualmente tiene un solo idioma, <i>castellano neutro</i> o mas conocido como español neutro porque pretende llegar a los nuevos entusiastas del ajedrez en Argentina y países hermanos de habla castellana. Existe la posibilidad de extender la aplicación a multi-idioma pero es necesaria la bondadosa colaboración de eventuales entusiastas.</p>
      <blockquote class="has-background-info"><span class="has-text-white">Este proyecto es puramente educacional y motivado exclusivamente, por parte de todos los integrantes de su equipo, por el amor que dedicamos a este singular deporte que es el ajedrez. Creemos que el ajedrez ayuda a traer el discernimiento de lo razonable que necesita nuestra sociedad para aspirar vivir en paz. Este proyecto es voluntario, no recibe ningún tipo de financiación y no persigue ánimos de lucro.</span></blockquote>        
      <p><a href="mailto:overlemonsoft@gmail.com?Subject=Hola, Quiero conocer mas sobre el proyecto AjedrezEV" class="button is-success is-outlined">Conocer mas sobre AjedrezEV</a></p>
      
      <h4>Objetivos</h4>
      <ul>
        <li>Proveer de herramientas digitales para la promoción del deporte del ajedrez en Argentina, tanto tableros virtuales de eventos en tiempo real y como para estudio offline.</li>
        <li>Segmentación por torneos, jugadores y rondas (en desarrollo)</li>
        <li>Estadísticas (en desarrollo)</li>
      </ul>

      <h4>Aspectos técnicos</h4>
      <p>Ajedrezenvivo usa mLab como capa de datos persistente, Node JS como API REST y Webpack + Vue JS como aplicación.</p>
      <h5>Cliente</h5>
      <ul>
        <li>Vue JS</li>
        <li>Webpack</li>
        <li>Chess JS engine (motor de juego)</li>
        <li>Chessboard JS (renderización de tableros)</li>
      </ul>
      <h5>Servidor</h5>
      <ul>
        <li>API REST Node Express</li>
        <li>Socket.io (transmisión en tiempo real)</li>
        <li>mLab (capa de datos persistente)</li>
      </ul>

      <h4>Entornos</h4>
      <p>AjedrezEV, como todo proyecto en constante evolución posee dos entornos. A continuación las urls de cada una de ellas.</p>
      <ul>
        <li>
          <a href="https://ajedrezenvivo.net" target="_blank">AjedrezEV Producción</a>
        </li>
        <li>  
          <a href="https://ajedrezenvivo.herokuapp.com" target="_blank">AjedrezEV Desarrollo</a>
        </li>
      </ul>

      <h4>Repositorios</h4>
      <p>AjedrezEV publica el código de su plataforma de forma libre y gratuita. Si estas en interesado en participar del desarrollo por favor conéctate via github para ampliar este proyecto. Desde ya muchas gracias.</p>

      <ul>
        <li>
          <a href="https://github.com/martinfrith/livechessapi.git" target="_blank">API REST</a>
        </li>
        <li>  
          <a href="https://github.com/martinfrith/livechessvue.git" target="_blank">APP</a>
        </li>
      </ul>

      <h4>Equipo de desarrollo de AjedrezEV</h4>
      <ul>
        <li>👨🏻‍ Cristhian Daher - Tester 🌎 Esquel</li>
        <li>👨🏻‍ ‍Martín Frith - Developer 🌎 Esquel </li>
      </ul>
      <h4>Agradecimientos</h4>
        <p>AjedrezEV quiere agradecer a todas las personas que contribuyen con este proyecto directa o indirectamente usando la aplicación.</p>
        <p>Un agradecimiento general a todo el equipo de desarrollo y testing de <a href="https://chess-db.com" target="_blank">ChessDB</a>, <a href="https://nodejs.org">NodeJS</a> y <a href="https://vuejs.org">VueJS</a> y en especial a <a href="https://github.com/jhlywa">Jeff Hlywa</a> de <a href="https://github.com/jhlywa/chess.js">chess.js</a> y a <a href="https://github.com/oakmac">Chris Oakman</a> de <a href="https://github.com/oakmac/chessboardjs">chessboard.js</a> como así también a todo su equipo de desarrollo por su contribución al render y al motor de juego. </p>

        <blockquote class="has-background-info"><span class="has-text-white">Son algunos desarrolladores que gracias a su colaboración colectiva apostando <em>su</em> calidad de trabajo individual <em>en</em> la comunidad <em>sin fines de lucro</em> quienes nos permiten acceder y aprovechar software mas especializado y eficiente cada día. ¡Muchas gracias a todos ellos! </span></blockquote>

      <h4>ChangeLog</h4>
      <ul>
        <li class="has-text-success">2019.4.2 Versión 0.1 Inicio del proyecto — Visualización de partida.</li>
        <li class="has-text-success">2019.4.4 Versión 0.11 — Capa de datos persistente. Posibilidad de guardar partidas.</li>
        <li class="has-text-success">2019.4.6 Versión 0.111 — Detalle completo de partidas.</li>
        <li class="has-text-success">2019.4.9 Versión 0.2 — Modo nocturno. Noticación sonora de movimiento. Resaltar último movimiento.</li>
        <li class="has-text-success">2019.4.11 Versión 0.3 — Emisión en vivo. Listado de partidas Online. Formulario de búsqueda de partidas por jugador, lugar o evento.</li>
        <li class="has-text-success">2019.4.13 Versión 0.4 — Código de seguridad de transmisión que garantiza la privacidad de las mesas siendo emitidas. Vista de resultados completos.</li>
        <li class="has-text-success">2019.5.18 Versión 0.5 — Vista de partida con índice de movimientos. Se cargan 5000 partidas históricas de <a href="http://chess-db.com" target="_blank">chess-db.com</a>.</li>
        <li class="has-text-info">2019.7.20 Versión 0.6 — Segmentación cliente-servidor.  Frontend Webpack + vue. API REST Node Express <span class="tag is-warning">in progress</span> <span class="tag is-danger">delayed</span></li>
        <li class="has-text-info">2019.7.30 Versión 0.7 — Plataforma de juego online con posibilidad de invitar oponente via email y redes sociales. <span class="tag is-info">schedule</span></li>
      </ul>
      <h4>¿Quieres participar?</h4>
      <p>Si leíste efectivamente hasta el Changelog tal vez sea hora de preguntarte, ... ¿estas interesado en colaborar voluntariamente con este proyecto? Si piensas que puede ser así este el momento para hacerlo.</p>
      <p><a id="colaborar" class="button is-success is-outlined" href="mailto:overlemonsoft@gmail.com?Subject=Hola, Quiero colaborar con el proyecto AjedrezEV">Quiero colaborar con AjedrezEV</a></p>

      <br>
      <p>Gracias por utilizar <em>Ajedrez en vivo</em>.</p>
    </section>
  </div>
</template>

<script>

export default {
  name: 'about',
  mounted: function(){
  },
  data () {
    return {
    }
  }
}
</script>
