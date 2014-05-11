# Responsive SVG Line Chart
# no library dependencies

supportsSVG = ->
  !!document.createElementNS and !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect

if supportsSVG
  firstSet = [119, 139, 140, 200, 159, 350, 340]
  secondSet = [159, 160, 119, 254, 350, 315, 279]
  thirdSet = [135, 119, 164, 350, 300, 285, 259]
  firstColor = '#e0ab27'
  secondColor = '#d0243d'
  thirdColor = '#21bb89'
  initChart = (data, color) ->
    stats = data
    svgDoc = document.querySelector("#viz")
    box = svgDoc.viewBox.baseVal
    svgHeight = box.height
    svgWidth = box.width
    yMax = Math.max.apply(Math, stats)
    yMin = Math.min.apply(Math, stats)
    yPadding = 50
    ySize = (yMax - yMin) + (yPadding * 2)
    console.log ySize
    # target ÷ context = result
    yScale = svgHeight / ySize
    xRegion = svgWidth / stats.length
    # target ÷ context = result
    xPoints = 100 / xRegion
    convertedData = stats.map( (x) ->
      ySize - (x * yScale)
    )
    line = ''
    line = document.createElementNS('http://www.w3.org/2000/svg', "polyline")
    line.setAttributeNS(null, "stroke", color)
    line.setAttributeNS(null, "stroke-width", "4px")
    line.setAttributeNS(null, "fill", 'none')
    lineData = ''
    dataPoints = ''
    buildLineData = (holder, points) ->
      holder.concat(points)

    lineDataPoints = (x, y) ->
      dataPoints = lineData+=''+x+','+y+' '

    dotDataPoints = (x, y) ->
      dataPoints = ''+x+','+y+' '

    g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    g.setAttribute('id', 'line-chart')
    g.setAttribute('transform','translate('+xRegion / 2+', '+(ySize - svgHeight) * yScale+')')

    buildDataPoints = (data, i) ->
      yUnit = data * yScale
      yAxis = ySize - yUnit
      xUnit = i
      xAxis = xRegion * xUnit
      dotDataPoints xAxis, yAxis
      circle = document.createElementNS('http://www.w3.org/2000/svg', "ellipse")
      circle.setAttributeNS(null, "rx", '4')
      circle.setAttributeNS(null, "ry", '4')
      circle.setAttributeNS(null, "fill", 'white')
      circle.setAttributeNS(null, "stroke", color)
      circle.setAttributeNS(null, "stroke-width", '4px')
      circle.setAttribute('transform','translate('+dataPoints+')')

      textValue = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      textValue.setAttribute('transform','translate('+xAxis+','+(yAxis - 10)+')')
      textValue.setAttributeNS(null, "fill", 'black')
      textValue.setAttributeNS(null, "font-size", '10')
      textValue.setAttributeNS(null, "text-anchor",  'middle')

      textNode = document.createTextNode(data)
      svgDoc.appendChild(g)
      g.appendChild(circle)
      g.appendChild(textValue)
      textValue.appendChild(textNode)

    buildLinePath = (data, i) ->
      yUnit = data * yScale
      yAxis = ySize - yUnit
      xUnit = i
      xAxis = xRegion * xUnit
      lineDataPoints xAxis, yAxis
      buildLineData lineData, dataPoints
      console.log lineData, dataPoints
      g.appendChild(line)

    stats.forEach(buildLinePath)
    stats.forEach(buildDataPoints)
    line.setAttributeNS(null, "points", lineData)

  initChart(firstSet, firstColor)
  setTimeout (->
    initChart(secondSet, secondColor)
  ), 1000
  setTimeout (->
    initChart(thirdSet, thirdColor)
  ), 2000
