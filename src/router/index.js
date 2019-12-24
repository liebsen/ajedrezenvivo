import Vue from 'vue'
import Router from 'vue-router'
import $ from 'jquery'
import Landing from '../components/Landing'
import Results from '../components/Results'
import Contact from '../components/Contact'
import Play from '../components/Play'
import Lobby from '../components/Lobby'
import Live from '../components/Live'
import Preferences from '../components/Preferences'
import Stockfish from '../components/Stockfish'
import Eco from '../components/Eco'
import PlayEco from '../components/PlayEco'
import Game from '../components/Game'
import Watch from '../components/Watch'
import About from '../components/About'
import NotFound from '../components/NotFound'

window.jQuery = $;
window.$ = $;

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/results',
      name: 'results',
      component: Results
    },
    {
      path: '/eco',
      name: 'eco',
      component: Eco
    },
    {
      path: '/eco/:name',
      name: 'playeco',
      component: PlayEco
    },
    {
      path: '/live',
      name: 'live',
      component: Live
    },
    {
      path: '/game/:game',
      name: 'game',
      component: Game
    },
    {
      path: '/play/:game',
      name: 'play',
      component: Play
    },
    {
      path: '/watch/:game',
      name: 'watch',
      component: Watch
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: Preferences
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: Lobby
    },
    {
      path: '/stockfish',
      name: 'stockfish',
      component: Stockfish
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '*',
      name: 'notfound',
      component: NotFound
    }
  ]  
});

document.addEventListener('DOMContentLoaded', () => {
  var tosAgree = function(target){
    localStorage.setItem("tosagree",true)
    document.querySelector('.tosprompt').classList.remove('slideIn')
    document.querySelector('.tosprompt').classList.add('fadeOut')      
    setTimeout(() => {
      document.querySelector('.tosprompt').style.display = 'none';
    },1000)
  }

  document.querySelectorAll(".menu-burger, .menu-items").forEach(function(item) {
    item.addEventListener("click", function() {
      if(document.querySelector('.menu').classList.contains('fs')){
        document.querySelector('.menu').classList.remove('fs')
        document.querySelector('.menu').classList.remove('fs')
        document.querySelector('.menu-burger').classList.remove('cross')
      } else {
        document.querySelector('.menu').classList.add('fs')
        document.querySelector('.menu-burger').classList.add('cross')
      }
    },false)
  })

  document.querySelectorAll('.hidden-loading').forEach((item) => {
    item.classList.remove('hidden-loading')
  })

  if(!localStorage.getItem("tosagree")){
    document.querySelector('.tosprompt').classList.add('slideIn')
  } else {
    document.querySelector('.tosprompt').style.display = 'none';
  }
})

/*
window.onerror = function(msg, url, line, col, error) {
   // Note that col & error are new to the HTML 5 spec and may not be 
   // supported in every browser.  It worked for me in Chrome.
   var extra = !col ? '' : '\ncolumn: ' + col
   extra += !error ? '' : '\nerror: ' + error

   // You can view the information in an alert to see things working like this:
   //alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra)
   console.log("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra)

   // TODO: Report this error via ajax so you can keep track
   //       of what pages have JS issues

   var suppressErrorAlert = true
   // If you return true, then error alerts (like in older versions of 
   // Internet Explorer) will be suppressed.
   return suppressErrorAlert
}*/

router.beforeEach((to, from, next) => {
  setTimeout(function() {
    var body = $("html, body")
    body.stop().animate({scrollTop:0}, 250, 'swing', function() { 
    })
  }, 10)  
  next()
})

router.afterEach(function (to, from, next) {
})


export default router