var currentQuestion = 0
var currentPage = 0

var Backend = (function () {
  async function getQuestion (number) {
    var storedData = localStorage.getItem('question-' + number)
    if (storedData) {
      return JSON.parse(storedData)
    }

    const response = await fetch('/data/math/question-' + number + '.json')
    const jsonResponse = await response.json()
    console.log(jsonResponse)
    localStorage.setItem('question-' + number, JSON.stringify(jsonResponse))
    return jsonResponse
  }

  async function getNextQuestion () {
    var jsonData = getQuestion((currentQuestion++ % 2) + 1)
    Dom.questionToHTML(await jsonData)
  }

  async function getPage (number) {
    var item = localStorage.getItem('page-' + number)
    if (item) {
      Dom.pageToHTML(JSON.parse(item))
    } else {
      const response = await fetch('/data/page/' + number + '.json')
      const jsonResponse = await response.json()
      console.log(jsonResponse)
      localStorage.setItem('page-' + number, JSON.stringify(jsonResponse))
      Dom.pageToHTML(await jsonResponse)
    }
  }

  async function getNextPage () {
    var jsonData = getPage((currentPage++ % 2) + 1)
  }

  async function storePage (number, page) {
    localStorage.setItem('page-' + number, page)
  }

  return {
    getNextPage: getNextPage,
    getNextQuestion: getNextQuestion,
    getPage: getPage,
    getQuestion: getQuestion
  }
})()
