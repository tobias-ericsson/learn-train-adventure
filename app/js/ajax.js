async function getQuestion (number) {
  const response = await fetch('/data/math/question-' + number + '.json')
  const jsonResponse = await response.json()
  console.log(jsonResponse)
}

async function getPage (number) {
  const response = await fetch('/data/page/page-' + number + '.json')
  const jsonResponse = await response.json()
  console.log(jsonResponse)
}

getQuestion(1)
getQuestion(2)
getPage(1)
getPage(2)
