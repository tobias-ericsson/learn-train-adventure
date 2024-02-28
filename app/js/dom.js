var Dom = (function () {
  // Get the content div
  var contentDiv = document.getElementById('content')

  function pageToHTML (jsonData) {
    var html = '<div>'

    var header = '<h2>' + jsonData.title + '</h2>'
    var content = '<p>' + jsonData.question + '</p>'

    html += header + content

    html += '</div>'
    contentDiv.innerHTML = html
  }

  function questionToHTML (jsonData) {
    var html = '<div>'

    var header = '<h2>' + jsonData.title + '</h2>'
    var content = '<p>' + jsonData.question + '</p>'

    html += header + content

    html += '</div>'
    contentDiv.innerHTML = html
  }

  return {
    questionToHTML: questionToHTML,
    pageToHTML: pageToHTML
  }
})()
