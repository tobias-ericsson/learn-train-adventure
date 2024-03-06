var Dom = (function () {
  // Get the content div
  var contentDiv = document.getElementById('content')
  var footer = document.getElementById('footer')

  function pageToHTML (jsonData) {
    var html = '<div>'

    //var header = '<h2>' + jsonData.title + '</h2>'

    jsonData.question.forEach(line => (html += '<p>' + line + '</p>'))

    //var content = '<p>' + jsonData.question + '</p>'

    //html += content

    html += '</div>'
    contentDiv.innerHTML = html
    footer.innerHTML = jsonData.title
  }

  function questionToHTML (jsonData) {
    var html = '<div>'

    //var header = '<h2>' + jsonData.title + '</h2>'
    var content = '<p>' + jsonData.question + '</p>'

    html += header + content

    html += '</div>'
    contentDiv.innerHTML = html
    footer.innerHTML = jsonData.title
  }

  return {
    questionToHTML: questionToHTML,
    pageToHTML: pageToHTML
  }
})()
