var canvas = document.querySelector('.canvas')
var result = document.querySelector('.result')
var colorpicker = document.querySelector('.colorpicker')
var lastColorsDiv = document.querySelector('.lastColors')
var hex = document.querySelector('.hex')

var lastColors = []
var maxLastColors = 20

// STATE
var mousedown = false
// If true, user startet clicking on same-colored pixel
// While this is true, remove color instead of inserting
var erasemode = false

var currentColor = '#FF0000'
hex.textContent = '#FF0000'
hex.style.color = '#FF0000'

var lastPushedColor = ''
function pushLastColor(color) {
  // Paranoia and optimalisations
  if(!color) return
  if(color === lastPushedColor) return
  if(lastColors.indexOf(color) !== -1) return

  var colorDiv = document.createElement('div')

  var active = document.querySelector('.color.active');

  if(active) {
    active.classList.remove('active')
  }

  if(colorpicker.value != color) {
    colorpicker.value = color
  }


  colorDiv.classList.add('color')
  colorDiv.classList.add('active')
  colorDiv.style.backgroundColor = color
  colorDiv.dataset.color = color

  colorpicker.value = color
  currentColor = color
  hex.textContent = color
  hex.style.color = color

  lastColorsDiv.appendChild(colorDiv)

  lastColors.push(color)
  if(lastColors.length > maxLastColors) {
    lastColors.shift()
    lastColorsDiv.querySelector('.color:not(.active)').remove()
  }
}

lastColorsDiv.onclick = function(e) {
  var target = e.target
  
  var active = document.querySelector('.color.active');
  if(active) {
    active.classList.remove('active')
  }
  currentColor = target.dataset.color
  hex.textContent = color
  hex.style.color = color

  target.classList.add('active')
}

// Dimensions of image
var height = 16
var width = 16

var rows = []

var colors


if(location.search) {
  colors = []
  var search = location.search.substring(1).split('&')
  search.forEach(function(query) {
    query = query.split('=')

    if(query[0] === 'w') {
      width = parseInt(query[1])
      
    } else if(query[0] === 'h') {
      height = parseInt(query[1])
    } else if(query[0] === 'c') {
      var c = query[1].split('')
      for(var i = 0; i < c.length; i++) {
        if(c[i] === '_') {
          colors.push('')
        } else {
          var color = '#' + c[i + 1] + c[i + 2] + c[i + 3] + c[i + 4] + c[i + 5] + c[i + 6]

          colors.push(color)
          pushLastColor(color)
          i = i + 6
        }
      }
    }
  })
}


document.onmousedown = function() {
	mousedown = true
}

document.onmouseup = function() {
	mousedown = false
  erasemode = false
}

colorpicker.oninput = function(e) {
	currentColor = e.target.value
  hex.textContent = color
  hex.style.color = color
}

function createURL() {
  var url = []
  url.push('?h=' + height)
  url.push('&w=' + width)
  url.push('&c=')
  rows.forEach(function(row) {
    row.forEach(function(cell) {
      url.push(cell.color || '_')
    })
  })

  var url = url.join('').replace(/#/g, 'M')

  history.replaceState({}, "Iconizer", url);
}


var cellCount = 0
for(var i = 0; i < height; i++) {
	var row = []
	rows.push(row)
  
  var rowDiv = document.createElement('div')
  rowDiv.classList.add('row')
  canvas.appendChild(rowDiv)

  var resultRow =  document.createElement('div')
  resultRow.classList.add('resultRow')
  result.appendChild(resultRow)
  
	for(var j = 0; j < width; j++) {
  	var cellDiv = document.createElement('div')
    var pixelDiv = document.createElement('div')

    cellDiv.classList.add('cell')
    pixelDiv.classList.add('pixel')

    rowDiv.appendChild(cellDiv)
    resultRow.appendChild(pixelDiv)
  	var cell = {
    	x: i,
      y: j,
      cell: cellDiv,
      pixel: pixelDiv,
      color: colors ? colors[cellCount++] : ''
    }

    if(cell.color) {
      cellDiv.style.backgroundColor = cell.color
      pixelDiv.style.backgroundColor = cell.color
    }
    
    cellDiv['data-cell'] = cell

    function paint(element, color) {
      var cell = element['data-cell']
      pushLastColor(color)
      element.style.backgroundColor = color
      cell.pixel.style.backgroundColor = color
      cell.color = color
      createURL()
    }
    
    cellDiv.onmouseover = function(e) {
    	if(!mousedown) return

      var cell = e.target['data-cell']
      var color = erasemode ? '' : currentColor

      paint(e.target, color)
    }
    
    cellDiv.onmousedown = function(e) {
    	var cell = e.target['data-cell']

      if(cell.color !== currentColor) {
        paint(e.target, currentColor)
      } else {
        paint(e.target, '')
	      erasemode = true
      }

    }
    
    row.push(cell)
  }
}

