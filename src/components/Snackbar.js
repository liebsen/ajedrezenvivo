var snackbarClock = null;

module.exports = function (type, message, options) {

  var snackBarElement = document.querySelector('.ui-snackbar');
  if(snackbarClock){
    clearInterval(snackbarClock)
  } 

  if(options===undefined) {
    options = 3000
  }

  if (!message) return;

  snackBarElement.classList.remove('ui-snackbar--is-inactive')
  snackBarElement.classList.remove('ui-snackbar--success')
  snackBarElement.classList.remove('ui-snackbar--error')
  snackBarElement.classList.remove('ui-snackbar--default')
  snackBarElement.querySelector('.ui-snackbar__message').innerHTML = message
  snackBarElement.classList.add('ui-snackbar--' + type)
  snackBarElement.classList.add('ui-snackbar--is-active')

  snackbarClock = setTimeout(() => {
    snackBarElement.classList.remove('ui-snackbar--is-active')
    snackBarElement.classList.add('ui-snackbar--is-inactive')
  },options)
}
