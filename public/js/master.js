/* svg.js 1.0.0-rc.5-6-g2a986d0 - svg inventor regex default color array pointarray patharray number viewbox bbox rbox element parent container fx relative event defs group arrange mask clip gradient pattern doc shape use rect ellipse line poly path image text textpath nested hyperlink sugar set data memory loader - svgjs.com/license */
;(function() {

  this.SVG = function(element) {
    if (SVG.supported) {
      element = new SVG.Doc(element)

      if (!SVG.parser)
        SVG.prepare(element)

      return element
    }
  }

  // Default namespaces
  SVG.ns    = 'http://www.w3.org/2000/svg'
  SVG.xmlns = 'http://www.w3.org/2000/xmlns/'
  SVG.xlink = 'http://www.w3.org/1999/xlink'

  // Element id sequence
  SVG.did  = 1000

  // Get next named element id
  SVG.eid = function(name) {
    return 'Svgjs' + name.charAt(0).toUpperCase() + name.slice(1) + (SVG.did++)
  }

  // Method for element creation
  SVG.create = function(name) {
    /* create element */
    var element = document.createElementNS(this.ns, name)

    /* apply unique id */
    element.setAttribute('id', this.eid(name))

    return element
  }

  // Method for extending objects
  SVG.extend = function() {
    var modules, methods, key, i

    /* get list of modules */
    modules = [].slice.call(arguments)

    /* get object with extensions */
    methods = modules.pop()

    for (i = modules.length - 1; i >= 0; i--)
      if (modules[i])
        for (key in methods)
          modules[i].prototype[key] = methods[key]

    /* make sure SVG.Set inherits any newly added methods */
    if (SVG.Set && SVG.Set.inherit)
      SVG.Set.inherit()
  }

  // Method for getting an element by id
  SVG.get = function(id) {
    var node = document.getElementById(id)
    if (node) return node.instance
  }

  // Initialize parsing element
  SVG.prepare = function(element) {
    /* select document body and create invisible svg element */
    var body = document.getElementsByTagName('body')[0]
      , draw = (body ? new SVG.Doc(body) : element.nested()).size(2, 2)
      , path = SVG.create('path')

    /* insert parsers */
    draw.node.appendChild(path)

    /* create parser object */
    SVG.parser = {
      body: body || element.parent
    , draw: draw.style('opacity:0;position:fixed;left:100%;top:100%;overflow:hidden')
    , poly: draw.polyline().node
    , path: path
    }
  }

  // svg support test
  SVG.supported = (function() {
    return !! document.createElementNS &&
           !! document.createElementNS(SVG.ns,'svg').createSVGRect
  })()

  if (!SVG.supported) return false

  SVG.invent = function(config) {
  	/* create element initializer */
  	var initializer = typeof config.create == 'function' ?
  		config.create :
  		function() {
  			this.constructor.call(this, SVG.create(config.create))
  		}

  	/* inherit prototype */
  	if (config.inherit)
  		initializer.prototype = new config.inherit

  	/* extend with methods */
  	if (config.extend)
  		SVG.extend(initializer, config.extend)

  	/* attach construct method to parent */
  	if (config.construct)
  		SVG.extend(config.parent || SVG.Container, config.construct)

  	return initializer
  }

  SVG.regex = {
    /* test a given value */
    test: function(value, test) {
      return this[test].test(value)
    }

    /* parse unit value */
  , unit:         /^(-?[\d\.]+)([a-z%]{0,2})$/

    /* parse hex value */
  , hex:          /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

    /* parse rgb value */
  , rgb:          /rgb\((\d+),(\d+),(\d+)\)/

    /* test hex value */
  , isHex:        /^#[a-f0-9]{3,6}$/i

    /* test rgb value */
  , isRgb:        /^rgb\(/

    /* test css declaration */
  , isCss:        /[^:]+:[^;]+;?/

    /* test for blank string */
  , isBlank:      /^(\s+)?$/

    /* test for numeric string */
  , isNumber:     /^-?[\d\.]+$/

    /* test for percent value */
  , isPercent:    /^-?[\d\.]+%$/

    /* test for image url */
  , isImage:      /\.(jpg|jpeg|png|gif)(\?[^=]+.*)?/i

  }

  SVG.defaults = {
    // Default matrix
    matrix:       '1 0 0 1 0 0'

    // Default attribute values
  , attrs: {
      /* fill and stroke */
      'fill-opacity':     1
    , 'stroke-opacity':   1
    , 'stroke-width':     0
    , 'stroke-linejoin':  'miter'
    , 'stroke-linecap':   'butt'
    , fill:               '#000000'
    , stroke:             '#000000'
    , opacity:            1
      /* position */
    , x:                  0
    , y:                  0
    , cx:                 0
    , cy:                 0
      /* size */
    , width:              0
    , height:             0
      /* radius */
    , r:                  0
    , rx:                 0
    , ry:                 0
      /* gradient */
    , offset:             0
    , 'stop-opacity':     1
    , 'stop-color':       '#000000'
      /* text */
    , 'font-size':        16
    , 'font-family':      'Helvetica, Arial, sans-serif'
    , 'text-anchor':      'start'
    }

    // Default transformation values
  , trans: function() {
      return {
        /* translate */
        x:        0
      , y:        0
        /* scale */
      , scaleX:   1
      , scaleY:   1
        /* rotate */
      , rotation: 0
        /* skew */
      , skewX:    0
      , skewY:    0
        /* matrix */
      , matrix:   this.matrix
      , a:        1
      , b:        0
      , c:        0
      , d:        1
      , e:        0
      , f:        0
      }
    }

  }

  SVG.Color = function(color) {
    var match

    /* initialize defaults */
    this.r = 0
    this.g = 0
    this.b = 0

    /* parse color */
    if (typeof color == 'string') {
      if (SVG.regex.isRgb.test(color)) {
        /* get rgb values */
        match = SVG.regex.rgb.exec(color.replace(/\s/g,''))

        /* parse numeric values */
        this.r = parseInt(match[1])
        this.g = parseInt(match[2])
        this.b = parseInt(match[3])

      } else if (SVG.regex.isHex.test(color)) {
        /* get hex values */
        match = SVG.regex.hex.exec(this._fullHex(color))

        /* parse numeric values */
        this.r = parseInt(match[1], 16)
        this.g = parseInt(match[2], 16)
        this.b = parseInt(match[3], 16)

      }

    } else if (typeof color == 'object') {
      this.r = color.r
      this.g = color.g
      this.b = color.b

    }

  }

  SVG.extend(SVG.Color, {
    // Default to hex conversion
    toString: function() {
      return this.toHex()
    }
    // Build hex value
  , toHex: function() {
      return '#'
        + this._compToHex(this.r)
        + this._compToHex(this.g)
        + this._compToHex(this.b)
    }
    // Build rgb value
  , toRgb: function() {
      return 'rgb(' + [this.r, this.g, this.b].join() + ')'
    }
    // Calculate true brightness
  , brightness: function() {
      return (this.r / 255 * 0.30)
           + (this.g / 255 * 0.59)
           + (this.b / 255 * 0.11)
    }
    // Make color morphable
  , morph: function(color) {
      this.destination = new SVG.Color(color)

      return this
    }
    // Get morphed color at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this

      /* normalise pos */
      pos = pos < 0 ? 0 : pos > 1 ? 1 : pos

      /* generate morphed color */
      return new SVG.Color({
        r: ~~(this.r + (this.destination.r - this.r) * pos)
      , g: ~~(this.g + (this.destination.g - this.g) * pos)
      , b: ~~(this.b + (this.destination.b - this.b) * pos)
      })
    }
    // Private: ensure to six-based hex
  , _fullHex: function(hex) {
      return hex.length == 4 ?
        [ '#',
          hex.substring(1, 2), hex.substring(1, 2)
        , hex.substring(2, 3), hex.substring(2, 3)
        , hex.substring(3, 4), hex.substring(3, 4)
        ].join('') : hex
    }
    // Private: component to hex value
  , _compToHex: function(comp) {
      var hex = comp.toString(16)
      return hex.length == 1 ? '0' + hex : hex
    }

  })

  // Test if given value is a color string
  SVG.Color.test = function(color) {
    color += ''
    return SVG.regex.isHex.test(color)
        || SVG.regex.isRgb.test(color)
  }

  // Test if given value is a rgb object
  SVG.Color.isRgb = function(color) {
    return color && typeof color.r == 'number'
                 && typeof color.g == 'number'
                 && typeof color.b == 'number'
  }

  // Test if given value is a color
  SVG.Color.isColor = function(color) {
    return SVG.Color.isRgb(color) || SVG.Color.test(color)
  }

  SVG.Array = function(array, fallback) {
    array = (array || []).valueOf()

    /* if array is empty and fallback is provided, use fallback */
    if (array.length == 0 && fallback)
      array = fallback.valueOf()

    /* parse array */
    this.value = this.parse(array)
  }

  SVG.extend(SVG.Array, {
    // Make array morphable
    morph: function(array) {
      this.destination = this.parse(array)

      /* normalize length of arrays */
      if (this.value.length != this.destination.length) {
        var lastValue       = this.value[this.value.length - 1]
          , lastDestination = this.destination[this.destination.length - 1]

        while(this.value.length > this.destination.length)
          this.destination.push(lastDestination)
        while(this.value.length < this.destination.length)
          this.value.push(lastValue)
      }

      return this
    }
    // Clean up any duplicate points
  , settle: function() {
      /* find all unique values */
      for (var i = 0, il = this.value.length, seen = []; i < il; i++)
        if (seen.indexOf(this.value[i]) == -1)
          seen.push(this.value[i])

      /* set new value */
      return this.value = seen
    }
    // Get morphed array at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this

      /* generate morphed array */
      for (var i = 0, il = this.value.length, array = []; i < il; i++)
        array.push(this.value[i] + (this.destination[i] - this.value[i]) * pos)

      return new SVG.Array(array)
    }
    // Convert array to string
  , toString: function() {
      return this.value.join(' ')
    }
    // Real value
  , valueOf: function() {
      return this.value
    }
    // Parse whitespace separated string
  , parse: function(array) {
      array = array.valueOf()

      /* if already is an array, no need to parse it */
      if (Array.isArray(array)) return array

      return this.split(array)
    }
    // Strip unnecessary whitespace
  , split: function(string) {
      return string.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g,'').split(' ')
    }

  })



  SVG.PointArray = function() {
    this.constructor.apply(this, arguments)
  }

  // Inherit from SVG.Array
  SVG.PointArray.prototype = new SVG.Array

  SVG.extend(SVG.PointArray, {
    // Convert array to string
    toString: function() {
      /* convert to a poly point string */
      for (var i = 0, il = this.value.length, array = []; i < il; i++)
        array.push(this.value[i].join(','))

      return array.join(' ')
    }
    // Get morphed array at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this

      /* generate morphed point string */
      for (var i = 0, il = this.value.length, array = []; i < il; i++)
        array.push([
          this.value[i][0] + (this.destination[i][0] - this.value[i][0]) * pos
        , this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos
        ])

      return new SVG.PointArray(array)
    }
    // Parse point string
  , parse: function(array) {
      array = array.valueOf()

      /* if already is an array, no need to parse it */
      if (Array.isArray(array)) return array

      /* split points */
      array = this.split(array)

      /* parse points */
      for (var i = 0, il = array.length, p, points = []; i < il; i++) {
        p = array[i].split(',')
        points.push([parseFloat(p[0]), parseFloat(p[1])])
      }

      return points
    }
    // Move point string
  , move: function(x, y) {
      var box = this.bbox()

      /* get relative offset */
      x -= box.x
      y -= box.y

      /* move every point */
      if (!isNaN(x) && !isNaN(y))
        for (var i = this.value.length - 1; i >= 0; i--)
          this.value[i] = [this.value[i][0] + x, this.value[i][1] + y]

      return this
    }
    // Resize poly string
  , size: function(width, height) {
      var i, box = this.bbox()

      /* recalculate position of all points according to new size */
      for (i = this.value.length - 1; i >= 0; i--) {
        this.value[i][0] = ((this.value[i][0] - box.x) * width)  / box.width  + box.x
        this.value[i][1] = ((this.value[i][1] - box.y) * height) / box.height + box.x
      }

      return this
    }
    // Get bounding box of points
  , bbox: function() {
      SVG.parser.poly.setAttribute('points', this.toString())

      return SVG.parser.poly.getBBox()
    }

  })

  SVG.PathArray = function(array, fallback) {
    this.constructor.call(this, array, fallback)
  }

  // Inherit from SVG.Array
  SVG.PathArray.prototype = new SVG.Array

  SVG.extend(SVG.PathArray, {
    // Convert array to string
    toString: function() {
      return arrayToString(this.value)
    }
    // Move path string
  , move: function(x, y) {
  		/* get bounding box of current situation */
  		var box = this.bbox()

      /* get relative offset */
      x -= box.x
      y -= box.y

      if (!isNaN(x) && !isNaN(y)) {
        /* move every point */
        for (var l, i = this.value.length - 1; i >= 0; i--) {
          l = this.value[i][0]

          if (l == 'M' || l == 'L' || l == 'T')  {
            this.value[i][1] += x
            this.value[i][2] += y

          } else if (l == 'H')  {
            this.value[i][1] += x

          } else if (l == 'V')  {
            this.value[i][1] += y

          } else if (l == 'C' || l == 'S' || l == 'Q')  {
            this.value[i][1] += x
            this.value[i][2] += y
            this.value[i][3] += x
            this.value[i][4] += y

            if (l == 'C')  {
              this.value[i][5] += x
              this.value[i][6] += y
            }

          } else if (l == 'A')  {
            this.value[i][6] += x
            this.value[i][7] += y
          }

        }
      }

      return this
    }
    // Resize path string
  , size: function(width, height) {
  		/* get bounding box of current situation */
  		var i, l, box = this.bbox()

      /* recalculate position of all points according to new size */
      for (i = this.value.length - 1; i >= 0; i--) {
        l = this.value[i][0]

        if (l == 'M' || l == 'L' || l == 'T')  {
          this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
          this.value[i][2] = ((this.value[i][2] - box.y) * height) / box.height + box.y

        } else if (l == 'H')  {
          this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x

        } else if (l == 'V')  {
          this.value[i][1] = ((this.value[i][1] - box.y) * height) / box.height + box.y

        } else if (l == 'C' || l == 'S' || l == 'Q')  {
          this.value[i][1] = ((this.value[i][1] - box.x) * width)  / box.width  + box.x
          this.value[i][2] = ((this.value[i][2] - box.y) * height) / box.height + box.y
          this.value[i][3] = ((this.value[i][3] - box.x) * width)  / box.width  + box.x
          this.value[i][4] = ((this.value[i][4] - box.y) * height) / box.height + box.y

          if (l == 'C')  {
            this.value[i][5] = ((this.value[i][5] - box.x) * width)  / box.width  + box.x
            this.value[i][6] = ((this.value[i][6] - box.y) * height) / box.height + box.y
          }

        } else if (l == 'A')  {
          /* resize radii */
          this.value[i][1] = (this.value[i][1] * width)  / box.width
          this.value[i][2] = (this.value[i][2] * height) / box.height

          /* move position values */
          this.value[i][6] = ((this.value[i][6] - box.x) * width)  / box.width  + box.x
          this.value[i][7] = ((this.value[i][7] - box.y) * height) / box.height + box.y
        }

      }

      return this
    }
    // Absolutize and parse path to array
  , parse: function(array) {
      /* if it's already is a patharray, no need to parse it */
      if (array instanceof SVG.PathArray) return array.valueOf()

      /* prepare for parsing */
      var i, il, x0, y0, x1, y1, x2, y2, s, seg, segs
        , x = 0
        , y = 0

      /* populate working path */
      SVG.parser.path.setAttribute('d', typeof array === 'string' ? array : arrayToString(array))

      /* get segments */
      segs = SVG.parser.path.pathSegList

      for (i = 0, il = segs.numberOfItems; i < il; ++i) {
        seg = segs.getItem(i)
        s = seg.pathSegTypeAsLetter

        /* yes, this IS quite verbose but also about 30 times faster than .test() with a precompiled regex */
        if (s == 'M' || s == 'L' || s == 'H' || s == 'V' || s == 'C' || s == 'S' || s == 'Q' || s == 'T' || s == 'A') {
          if ('x' in seg) x = seg.x
          if ('y' in seg) y = seg.y

        } else {
          if ('x1' in seg) x1 = x + seg.x1
          if ('x2' in seg) x2 = x + seg.x2
          if ('y1' in seg) y1 = y + seg.y1
          if ('y2' in seg) y2 = y + seg.y2
          if ('x'  in seg) x += seg.x
          if ('y'  in seg) y += seg.y

          if (s == 'm')
            segs.replaceItem(SVG.parser.path.createSVGPathSegMovetoAbs(x, y), i)
          else if (s == 'l')
            segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoAbs(x, y), i)
          else if (s == 'h')
            segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoHorizontalAbs(x), i)
          else if (s == 'v')
            segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoVerticalAbs(y), i)
          else if (s == 'c')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i)
          else if (s == 's')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i)
          else if (s == 'q')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i)
          else if (s == 't')
            segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i)
          else if (s == 'a')
            segs.replaceItem(SVG.parser.path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i)
          else if (s == 'z' || s == 'Z') {
            x = x0
            y = y0
          }
        }

        /* record the start of a subpath */
        if (s == 'M' || s == 'm') {
          x0 = x
          y0 = y
        }
      }

      /* build internal representation */
      array = []
      segs  = SVG.parser.path.pathSegList

      for (i = 0, il = segs.numberOfItems; i < il; ++i) {
        seg = segs.getItem(i)
        s = seg.pathSegTypeAsLetter
        x = [s]

        if (s == 'M' || s == 'L' || s == 'T')
          x.push(seg.x, seg.y)
        else if (s == 'H')
          x.push(seg.x)
        else if (s == 'V')
          x.push(seg.y)
        else if (s == 'C')
          x.push(seg.x1, seg.y1, seg.x2, seg.y2, seg.x, seg.y)
        else if (s == 'S')
          x.push(seg.x2, seg.y2, seg.x, seg.y)
        else if (s == 'Q')
          x.push(seg.x1, seg.y1, seg.x, seg.y)
        else if (s == 'A')
          x.push(seg.r1, seg.r2, seg.angle, seg.largeArcFlag|0, seg.sweepFlag|0, seg.x, seg.y)

        /* store segment */
        array.push(x)
      }

      return array
    }
    // Get bounding box of path
  , bbox: function() {
      SVG.parser.path.setAttribute('d', this.toString())

      return SVG.parser.path.getBBox()
    }

  })

  // PathArray Helpers
  function arrayToString(a) {
    for (var i = 0, il = a.length, s = ''; i < il; i++) {
      s += a[i][0]

      if (a[i][1] != null) {
        s += a[i][1]

        if (a[i][2] != null) {
          s += ' '
          s += a[i][2]

          if (a[i][3] != null) {
            s += ' '
            s += a[i][3]
            s += ' '
            s += a[i][4]

            if (a[i][5] != null) {
              s += ' '
              s += a[i][5]
              s += ' '
              s += a[i][6]

              if (a[i][7] != null) {
                s += ' '
                s += a[i][7]
              }
            }
          }
        }
      }
    }

    return s + ' '
  }

  SVG.Number = function(value) {

    /* initialize defaults */
    this.value = 0
    this.unit = ''

    /* parse value */
    switch(typeof value) {
      case 'number':
        /* ensure a valid numeric value */
        this.value = isNaN(value) ? 0 : !isFinite(value) ? (value < 0 ? -3.4e+38 : +3.4e+38) : value
      break
      case 'string':
        var match = value.match(SVG.regex.unit)

        if (match) {
          /* make value numeric */
          this.value = parseFloat(match[1])

          /* normalize percent value */
          if (match[2] == '%')
            this.value /= 100
          else if (match[2] == 's')
            this.value *= 1000

          /* store unit */
          this.unit = match[2]
        }

      break
      default:
        if (value instanceof SVG.Number) {
          this.value = value.value
          this.unit  = value.unit
        }
      break
    }
  }

  SVG.extend(SVG.Number, {
    // Stringalize
    toString: function() {
      return (
        this.unit == '%' ?
          ~~(this.value * 1e8) / 1e6:
        this.unit == 's' ?
          this.value / 1e3 :
          this.value
      ) + this.unit
    }
  , // Convert to primitive
    valueOf: function() {
      return this.value
    }
    // Add number
  , plus: function(number) {
      this.value = this + new SVG.Number(number)

      return this
    }
    // Subtract number
  , minus: function(number) {
      return this.plus(-new SVG.Number(number))
    }
    // Multiply number
  , times: function(number) {
      this.value = this * new SVG.Number(number)

      return this
    }
    // Divide number
  , divide: function(number) {
      this.value = this / new SVG.Number(number)

      return this
    }
    // Convert to different unit
  , to: function(unit) {
      if (typeof unit === 'string')
        this.unit = unit

      return this
    }
    // Make number morphable
  , morph: function(number) {
      this.destination = new SVG.Number(number)

      return this
    }
    // Get morphed number at given position
  , at: function(pos) {
      /* make sure a destination is defined */
      if (!this.destination) return this

      /* generate morphed number */
      return new SVG.Number(this.destination)
          .minus(this)
          .times(pos)
          .plus(this)
    }

  })

  SVG.ViewBox = function(element) {
    var x, y, width, height
      , wm   = 1 /* width multiplier */
      , hm   = 1 /* height multiplier */
      , box  = element.bbox()
      , view = (element.attr('viewBox') || '').match(/-?[\d\.]+/g)

    /* get dimensions of current node */
    width  = new SVG.Number(element.width())
    height = new SVG.Number(element.height())

    /* find nearest non-percentual dimensions */
    while (width.unit == '%') {
      wm *= width.value
      width = new SVG.Number(element instanceof SVG.Doc ? element.parent.offsetWidth : element.width())
    }
    while (height.unit == '%') {
      hm *= height.value
      height = new SVG.Number(element instanceof SVG.Doc ? element.parent.offsetHeight : element.height())
    }

    /* ensure defaults */
    this.x      = box.x
    this.y      = box.y
    this.width  = width  * wm
    this.height = height * hm
    this.zoom   = 1

    if (view) {
      /* get width and height from viewbox */
      x      = parseFloat(view[0])
      y      = parseFloat(view[1])
      width  = parseFloat(view[2])
      height = parseFloat(view[3])

      /* calculate zoom accoring to viewbox */
      this.zoom = ((this.width / this.height) > (width / height)) ?
        this.height / height :
        this.width  / width

      /* calculate real pixel dimensions on parent SVG.Doc element */
      this.x      = x
      this.y      = y
      this.width  = width
      this.height = height

    }

  }

  //
  SVG.extend(SVG.ViewBox, {
    // Parse viewbox to string
    toString: function() {
      return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height
    }

  })

  SVG.BBox = function(element) {
    var box

    /* initialize zero box */
    this.x      = 0
    this.y      = 0
    this.width  = 0
    this.height = 0

    /* get values if element is given */
    if (element) {
      try {
        /* actual, native bounding box */
        box = element.node.getBBox()
      } catch(e) {
        /* fallback for some browsers */
        box = {
          x:      element.node.clientLeft
        , y:      element.node.clientTop
        , width:  element.node.clientWidth
        , height: element.node.clientHeight
        }
      }

      /* include translations on x an y */
      this.x = box.x + element.trans.x
      this.y = box.y + element.trans.y

      /* plain width and height */
      this.width  = box.width  * element.trans.scaleX
      this.height = box.height * element.trans.scaleY
    }

    /* add the center */
    this.cx = this.x + this.width / 2
    this.cy = this.y + this.height / 2

  }

  //
  SVG.extend(SVG.BBox, {
    // merge bounding box with another, return a new instance
    merge: function(box) {
      var b = new SVG.BBox()

      /* merge box */
      b.x      = Math.min(this.x, box.x)
      b.y      = Math.min(this.y, box.y)
      b.width  = Math.max(this.x + this.width,  box.x + box.width)  - b.x
      b.height = Math.max(this.y + this.height, box.y + box.height) - b.y

      /* add the center */
      b.cx = b.x + b.width / 2
      b.cy = b.y + b.height / 2

      return b
    }

  })

  SVG.RBox = function(element) {
    var e, zoom
      , box = {}

    /* initialize zero box */
    this.x      = 0
    this.y      = 0
    this.width  = 0
    this.height = 0

    if (element) {
      e = element.doc().parent
      zoom = element.doc().viewbox().zoom

      /* actual, native bounding box */
      box = element.node.getBoundingClientRect()

      /* get screen offset */
      this.x = box.left
      this.y = box.top

      /* subtract parent offset */
      this.x -= e.offsetLeft
      this.y -= e.offsetTop

      while (e = e.offsetParent) {
        this.x -= e.offsetLeft
        this.y -= e.offsetTop
      }

      /* calculate cumulative zoom from svg documents */
      e = element
      while (e = e.parent) {
        if (e.type == 'svg' && e.viewbox) {
          zoom *= e.viewbox().zoom
          this.x -= e.x() || 0
          this.y -= e.y() || 0
        }
      }
    }

    /* recalculate viewbox distortion */
    this.x /= zoom
    this.y /= zoom
    this.width  = box.width  /= zoom
    this.height = box.height /= zoom

    /* add the center */
    this.cx = this.x + this.width  / 2
    this.cy = this.y + this.height / 2

  }

  //
  SVG.extend(SVG.RBox, {
    // merge rect box with another, return a new instance
    merge: function(box) {
      var b = new SVG.RBox()

      /* merge box */
      b.x      = Math.min(this.x, box.x)
      b.y      = Math.min(this.y, box.y)
      b.width  = Math.max(this.x + this.width,  box.x + box.width)  - b.x
      b.height = Math.max(this.y + this.height, box.y + box.height) - b.y

      /* add the center */
      b.cx = b.x + b.width / 2
      b.cy = b.y + b.height / 2

      return b
    }

  })

  SVG.Element = SVG.invent({
    // Initialize node
    create: function(node) {
      /* make stroke value accessible dynamically */
      this._stroke = SVG.defaults.attrs.stroke

      /* initialize style store */
      this.styles = {}

      /* initialize transformation store with defaults */
      this.trans = SVG.defaults.trans()

      /* keep reference to the element node */
      if (this.node = node) {
        this.type = node.nodeName
        this.node.instance = this
      }
    }

    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        if (x) {
          x = new SVG.Number(x)
          x.value /= this.trans.scaleX
        }
        return this.attr('x', x)
      }
      // Move over y-axis
    , y: function(y) {
        if (y) {
          y = new SVG.Number(y)
          y.value /= this.trans.scaleY
        }
        return this.attr('y', y)
      }
      // Move by center over x-axis
    , cx: function(x) {
        return x == null ? this.x() + this.width() / 2 : this.x(x - this.width() / 2)
      }
      // Move by center over y-axis
    , cy: function(y) {
        return y == null ? this.y() + this.height() / 2 : this.y(y - this.height() / 2)
      }
      // Move element to given x and y values
    , move: function(x, y) {
        return this.x(x).y(y)
      }
      // Move element by its center
    , center: function(x, y) {
        return this.cx(x).cy(y)
      }
      // Set width of element
    , width: function(width) {
        return this.attr('width', width)
      }
      // Set height of element
    , height: function(height) {
        return this.attr('height', height)
      }
      // Set element size to given width and height
    , size: function(width, height) {
        var p = this._proportionalSize(width, height)

        return this.attr({
          width:  new SVG.Number(p.width)
        , height: new SVG.Number(p.height)
        })
      }
      // Clone element
    , clone: function() {
        var clone , attr
          , type = this.type

        /* invoke shape method with shape-specific arguments */
        clone = type == 'rect' || type == 'ellipse' ?
          this.parent[type](0,0) :
        type == 'line' ?
          this.parent[type](0,0,0,0) :
        type == 'image' ?
          this.parent[type](this.src) :
        type == 'text' ?
          this.parent[type](this.content) :
        type == 'path' ?
          this.parent[type](this.attr('d')) :
        type == 'polyline' || type == 'polygon' ?
          this.parent[type](this.attr('points')) :
        type == 'g' ?
          this.parent.group() :
          this.parent[type]()

        /* apply attributes attributes */
        attr = this.attr()
        delete attr.id
        clone.attr(attr)

        /* copy transformations */
        clone.trans = this.trans

        /* apply attributes and translations */
        return clone.transform({})
      }
      // Remove element
    , remove: function() {
        if (this.parent)
          this.parent.removeElement(this)

        return this
      }
      // Replace element
    , replace: function(element) {
        this.after(element).remove()

        return element
      }
      // Add element to given container and return self
    , addTo: function(parent) {
        return parent.put(this)
      }
      // Add element to given container and return container
    , putIn: function(parent) {
        return parent.add(this)
      }
      // Get parent document
    , doc: function(type) {
        return this._parent(type || SVG.Doc)
      }
      // Set svg element attribute
    , attr: function(a, v, n) {
        if (a == null) {
          /* get an object of attributes */
          a = {}
          v = this.node.attributes
          for (n = v.length - 1; n >= 0; n--)
            a[v[n].nodeName] = SVG.regex.test(v[n].nodeValue, 'isNumber') ? parseFloat(v[n].nodeValue) : v[n].nodeValue

          return a

        } else if (typeof a == 'object') {
          /* apply every attribute individually if an object is passed */
          for (v in a) this.attr(v, a[v])

        } else if (v === null) {
            /* remove value */
            this.node.removeAttribute(a)

        } else if (v == null) {
          /* act as a getter if the first and only argument is not an object */
          v = this.node.getAttribute(a)
          return v == null ?
            SVG.defaults.attrs[a] :
          SVG.regex.test(v, 'isNumber') ?
            parseFloat(v) : v

        } else if (a == 'style') {
          /* redirect to the style method */
          return this.style(v)

        } else {
          /* BUG FIX: some browsers will render a stroke if a color is given even though stroke width is 0 */
          if (a == 'stroke-width')
            this.attr('stroke', parseFloat(v) > 0 ? this._stroke : null)
          else if (a == 'stroke')
            this._stroke = v

          /* convert image fill and stroke to patterns */
          if (a == 'fill' || a == 'stroke') {
            if (SVG.regex.isImage.test(v))
              v = this.doc().defs().image(v, 0, 0)

            if (v instanceof SVG.Image)
              v = this.doc().defs().pattern(0, 0, function() {
                this.add(v)
              })
          }

          /* ensure full hex color */
          if (SVG.Color.isColor(v))
            v = new SVG.Color(v)

          /* ensure correct numeric values */
          else if (typeof v === 'number')
            v = new SVG.Number(v)

          /* parse array values */
          else if (Array.isArray(v))
            v = new SVG.Array(v)

          /* if the passed attribute is leading... */
          if (a == 'leading') {
            /* ... call the leading method instead */
            if (this.leading)
              this.leading(v)
          } else {
            /* set give attribute on node */
            n != null ?
              this.node.setAttributeNS(n, a, v.toString()) :
              this.node.setAttribute(a, v.toString())
          }

          /* rebuild if required */
          if (this.rebuild && (a == 'font-size' || a == 'x'))
            this.rebuild(a, v)
        }

        return this
      }
      // Manage transformations
    , transform: function(o, v) {

        if (arguments.length == 0) {
          /* act as a getter if no argument is given */
          return this.trans

        } else if (typeof o === 'string') {
          /* act as a getter if only one string argument is given */
          if (arguments.length < 2)
            return this.trans[o]

          /* apply transformations as object if key value arguments are given*/
          var transform = {}
          transform[o] = v

          return this.transform(transform)
        }

        /* ... otherwise continue as a setter */
        var transform = []

        /* parse matrix */
        o = this._parseMatrix(o)

        /* merge values */
        for (v in o)
          if (o[v] != null)
            this.trans[v] = o[v]

        /* compile matrix */
        this.trans.matrix = this.trans.a
                    + ' ' + this.trans.b
                    + ' ' + this.trans.c
                    + ' ' + this.trans.d
                    + ' ' + this.trans.e
                    + ' ' + this.trans.f

        /* alias current transformations */
        o = this.trans

        /* add matrix */
        if (o.matrix != SVG.defaults.matrix)
          transform.push('matrix(' + o.matrix + ')')

        /* add rotation */
        if (o.rotation != 0)
          transform.push('rotate(' + o.rotation + ' ' + (o.cx == null ? this.bbox().cx : o.cx) + ' ' + (o.cy == null ? this.bbox().cy : o.cy) + ')')

        /* add scale */
        if (o.scaleX != 1 || o.scaleY != 1)
          transform.push('scale(' + o.scaleX + ' ' + o.scaleY + ')')

        /* add skew on x axis */
        if (o.skewX != 0)
          transform.push('skewX(' + o.skewX + ')')

        /* add skew on y axis */
        if (o.skewY != 0)
          transform.push('skewY(' + o.skewY + ')')

        /* add translation */
        if (o.x != 0 || o.y != 0)
          transform.push('translate(' + new SVG.Number(o.x / o.scaleX) + ' ' + new SVG.Number(o.y / o.scaleY) + ')')

        /* update transformations, even if there are none */
        if (transform.length == 0)
          this.node.removeAttribute('transform')
        else
          this.node.setAttribute('transform', transform.join(' '))

        return this
      }
      // Dynamic style generator
    , style: function(s, v) {
        if (arguments.length == 0) {
          /* get full style */
          return this.attr('style') || ''

        } else if (arguments.length < 2) {
          /* apply every style individually if an object is passed */
          if (typeof s == 'object') {
            for (v in s) this.style(v, s[v])

          } else if (SVG.regex.isCss.test(s)) {
            /* parse css string */
            s = s.split(';')

            /* apply every definition individually */
            for (var i = 0; i < s.length; i++) {
              v = s[i].split(':')

              if (v.length == 2)
                this.style(v[0].replace(/\s+/g, ''), v[1].replace(/^\s+/,'').replace(/\s+$/,''))
            }
          } else {
            /* act as a getter if the first and only argument is not an object */
            return this.styles[s]
          }

        } else if (v === null || SVG.regex.test(v, 'isBlank')) {
          /* remove value */
          delete this.styles[s]

        } else {
          /* store value */
          this.styles[s] = v
        }

        /* rebuild style string */
        s = ''
        for (v in this.styles)
          s += v + ':' + this.styles[v] + ';'

        /* apply style */
        if (s == '')
          this.node.removeAttribute('style')
        else
          this.node.setAttribute('style', s)

        return this
      }
      // Get bounding box
    , bbox: function() {
        return new SVG.BBox(this)
      }
      // Get rect box
    , rbox: function() {
        return new SVG.RBox(this)
      }
      // Checks whether the given point inside the bounding box of the element
    , inside: function(x, y) {
        var box = this.bbox()

        return x > box.x
            && y > box.y
            && x < box.x + box.width
            && y < box.y + box.height
      }
      // Show element
    , show: function() {
        return this.style('display', '')
      }
      // Hide element
    , hide: function() {
        return this.style('display', 'none')
      }
      // Is element visible?
    , visible: function() {
        return this.style('display') != 'none'
      }
      // Return id on string conversion
    , toString: function() {
        return this.attr('id')
      }
      // Private: find svg parent by instance
    , _parent: function(parent) {
        var element = this

        while (element != null && !(element instanceof parent))
          element = element.parent

        return element
      }
      // Private: parse a matrix string
    , _parseMatrix: function(o) {
        if (o.matrix) {
          /* split matrix string */
          var m = o.matrix.replace(/\s/g, '').split(',')

          /* pasrse values */
          if (m.length == 6) {
            o.a = parseFloat(m[0])
            o.b = parseFloat(m[1])
            o.c = parseFloat(m[2])
            o.d = parseFloat(m[3])
            o.e = parseFloat(m[4])
            o.f = parseFloat(m[5])
          }
        }

        return o
      }
      // Private: calculate proportional width and height values when necessary
    , _proportionalSize: function(width, height) {
        if (width == null || height == null) {
          var box = this.bbox()

          if (height == null)
            height = box.height / box.width * width
          else if (width == null)
            width = box.width / box.height * height
        }

        return {
          width:  width
        , height: height
        }
      }
    }

  })

  SVG.Parent = SVG.invent({
    // Initialize node
    create: function(element) {
      this.constructor.call(this, element)
    }

    // Inherit from
  , inherit: SVG.Element

    // Add class methods
  , extend: {
      // Returns all child elements
      children: function() {
        return this._children || (this._children = [])
      }
      // Add given element at a position
    , add: function(element, i) {
        if (!this.has(element)) {
          /* define insertion index if none given */
          i = i == null ? this.children().length : i

          /* remove references from previous parent */
          if (element.parent)
            element.parent.children().splice(element.parent.index(element), 1)

          /* add element references */
          this.children().splice(i, 0, element)
          this.node.insertBefore(element.node, this.node.childNodes[i] || null)
          element.parent = this
        }

        /* reposition defs */
        if (this._defs) {
          this.node.removeChild(this._defs.node)
          this.node.appendChild(this._defs.node)
        }

        return this
      }
      // Basically does the same as `add()` but returns the added element instead
    , put: function(element, i) {
        this.add(element, i)
        return element
      }
      // Checks if the given element is a child
    , has: function(element) {
        return this.index(element) >= 0
      }
      // Gets index of given element
    , index: function(element) {
        return this.children().indexOf(element)
      }
      // Get a element at the given index
    , get: function(i) {
        return this.children()[i]
      }
      // Get first child, skipping the defs node
    , first: function() {
        return this.children()[0]
      }
      // Get the last child
    , last: function() {
        return this.children()[this.children().length - 1]
      }
      // Iterates over all children and invokes a given block
    , each: function(block, deep) {
        var i, il
          , children = this.children()

        for (i = 0, il = children.length; i < il; i++) {
          if (children[i] instanceof SVG.Element)
            block.apply(children[i], [i, children])

          if (deep && (children[i] instanceof SVG.Container))
            children[i].each(block, deep)
        }

        return this
      }
      // Remove a child element at a position
    , removeElement: function(element) {
        this.children().splice(this.index(element), 1)
        this.node.removeChild(element.node)
        element.parent = null

        return this
      }
      // Remove all elements in this container
    , clear: function() {
        /* remove children */
        for (var i = this.children().length - 1; i >= 0; i--)
          this.removeElement(this.children()[i])

        /* remove defs node */
        if (this._defs)
          this._defs.clear()

        return this
      }
     , // Get defs
      defs: function() {
        return this.doc().defs()
      }
    }

  })


  SVG.Container = SVG.invent({
    // Initialize node
    create: function(element) {
      this.constructor.call(this, element)
    }

    // Inherit from
  , inherit: SVG.Parent

    // Add class methods
  , extend: {
      // Get the viewBox and calculate the zoom value
      viewbox: function(v) {
        if (arguments.length == 0)
          /* act as a getter if there are no arguments */
          return new SVG.ViewBox(this)

        /* otherwise act as a setter */
        v = arguments.length == 1 ?
          [v.x, v.y, v.width, v.height] :
          [].slice.call(arguments)

        return this.attr('viewBox', v)
      }
    }

  })

  SVG.FX = SVG.invent({
    // Initialize FX object
    create: function(element) {
      /* store target element */
      this.target = element
    }

    // Add class methods
  , extend: {
      // Add animation parameters and start animation
      animate: function(d, ease, delay) {
        var akeys, tkeys, skeys, key
          , element = this.target
          , fx = this

        /* dissect object if one is passed */
        if (typeof d == 'object') {
          delay = d.delay
          ease = d.ease
          d = d.duration
        }

        /* ensure default duration and easing */
        d = d == '=' ? d : d == null ? 1000 : new SVG.Number(d).valueOf()
        ease = ease || '<>'

        /* process values */
        fx.to = function(pos) {
          var i

          /* normalise pos */
          pos = pos < 0 ? 0 : pos > 1 ? 1 : pos

          /* collect attribute keys */
          if (akeys == null) {
            akeys = []
            for (key in fx.attrs)
              akeys.push(key)

            /* make sure morphable elements are scaled, translated and morphed all together */
            if (element.morphArray && (fx._plot || akeys.indexOf('points') > -1)) {
              /* get destination */
              var box
                , p = new element.morphArray(fx._plot || fx.attrs.points || element.array)

              /* add size */
              if (fx._size) p.size(fx._size.width.to, fx._size.height.to)

              /* add movement */
              box = p.bbox()
              if (fx._x) p.move(fx._x.to, box.y)
              else if (fx._cx) p.move(fx._cx.to - box.width / 2, box.y)

              box = p.bbox()
              if (fx._y) p.move(box.x, fx._y.to)
              else if (fx._cy) p.move(box.x, fx._cy.to - box.height / 2)

              /* delete element oriented changes */
              delete fx._x
              delete fx._y
              delete fx._cx
              delete fx._cy
              delete fx._size

              fx._plot = element.array.morph(p)
            }
          }

          /* collect transformation keys */
          if (tkeys == null) {
            tkeys = []
            for (key in fx.trans)
              tkeys.push(key)
          }

          /* collect style keys */
          if (skeys == null) {
            skeys = []
            for (key in fx.styles)
              skeys.push(key)
          }

          /* apply easing */
          pos = ease == '<>' ?
            (-Math.cos(pos * Math.PI) / 2) + 0.5 :
          ease == '>' ?
            Math.sin(pos * Math.PI / 2) :
          ease == '<' ?
            -Math.cos(pos * Math.PI / 2) + 1 :
          ease == '-' ?
            pos :
          typeof ease == 'function' ?
            ease(pos) :
            pos

          /* run plot function */
          if (fx._plot) {
            element.plot(fx._plot.at(pos))

          } else {
            /* run all x-position properties */
            if (fx._x)
              element.x(at(fx._x, pos))
            else if (fx._cx)
              element.cx(at(fx._cx, pos))

            /* run all y-position properties */
            if (fx._y)
              element.y(at(fx._y, pos))
            else if (fx._cy)
              element.cy(at(fx._cy, pos))

            /* run all size properties */
            if (fx._size)
              element.size(at(fx._size.width, pos), at(fx._size.height, pos))
          }

          /* run all viewbox properties */
          if (fx._viewbox)
            element.viewbox(
              at(fx._viewbox.x, pos)
            , at(fx._viewbox.y, pos)
            , at(fx._viewbox.width, pos)
            , at(fx._viewbox.height, pos)
            )

          /* animate attributes */
          for (i = akeys.length - 1; i >= 0; i--)
            element.attr(akeys[i], at(fx.attrs[akeys[i]], pos))

          /* animate transformations */
          for (i = tkeys.length - 1; i >= 0; i--)
            element.transform(tkeys[i], at(fx.trans[tkeys[i]], pos))

          /* animate styles */
          for (i = skeys.length - 1; i >= 0; i--)
            element.style(skeys[i], at(fx.styles[skeys[i]], pos))

          /* callback for each keyframe */
          if (fx._during)
            fx._during.call(element, pos, function(from, to) {
              return at({ from: from, to: to }, pos)
            })
        }

        if (typeof d === 'number') {
          /* delay animation */
          this.timeout = setTimeout(function() {
            var start = new Date().getTime()

            /* initialize situation object */
            fx.situation = {
              interval: 1000 / 60
            , start:    start
            , play:     true
            , finish:   start + d
            , duration: d
            }

            /* render function */
            fx.render = function(){

              if (fx.situation.play === true) {
                // This code was borrowed from the emile.js micro framework by Thomas Fuchs, aka MadRobby.
                var time = new Date().getTime()
                  , pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d

                /* process values */
                fx.to(pos)

                /* finish off animation */
                if (time > fx.situation.finish) {
                  if (fx._plot)
                    element.plot(new SVG.PointArray(fx._plot.destination).settle())

                  if (fx._loop === true || (typeof fx._loop == 'number' && fx._loop > 1)) {
                    if (typeof fx._loop == 'number')
                      --fx._loop
                    fx.animate(d, ease, delay)
                  } else {
                    fx._after ? fx._after.apply(element, [fx]) : fx.stop()
                  }

                } else {
                  requestAnimFrame(fx.render)
                }
              } else {
                requestAnimFrame(fx.render)
              }

            }

            /* start animation */
            fx.render()

          }, new SVG.Number(delay).valueOf())
        }

        return this
      }
      // Get bounding box of target element
    , bbox: function() {
        return this.target.bbox()
      }
      // Add animatable attributes
    , attr: function(a, v) {
        if (typeof a == 'object') {
          for (var key in a)
            this.attr(key, a[key])

        } else {
          var from = this.target.attr(a)

          this.attrs[a] = SVG.Color.isColor(from) ?
            new SVG.Color(from).morph(v) :
          SVG.regex.unit.test(from) ?
            new SVG.Number(from).morph(v) :
            { from: from, to: v }
        }

        return this
      }
      // Add animatable transformations
    , transform: function(o, v) {
        if (arguments.length == 1) {
          /* parse matrix string */
          o = this.target._parseMatrix(o)

          /* dlete matrixstring from object */
          delete o.matrix

          /* store matrix values */
          for (v in o)
            this.trans[v] = { from: this.target.trans[v], to: o[v] }

        } else {
          /* apply transformations as object if key value arguments are given*/
          var transform = {}
          transform[o] = v

          this.transform(transform)
        }

        return this
      }
      // Add animatable styles
    , style: function(s, v) {
        if (typeof s == 'object')
          for (var key in s)
            this.style(key, s[key])

        else
          this.styles[s] = { from: this.target.style(s), to: v }

        return this
      }
      // Animatable x-axis
    , x: function(x) {
        this._x = { from: this.target.x(), to: x }

        return this
      }
      // Animatable y-axis
    , y: function(y) {
        this._y = { from: this.target.y(), to: y }

        return this
      }
      // Animatable center x-axis
    , cx: function(x) {
        this._cx = { from: this.target.cx(), to: x }

        return this
      }
      // Animatable center y-axis
    , cy: function(y) {
        this._cy = { from: this.target.cy(), to: y }

        return this
      }
      // Add animatable move
    , move: function(x, y) {
        return this.x(x).y(y)
      }
      // Add animatable center
    , center: function(x, y) {
        return this.cx(x).cy(y)
      }
      // Add animatable size
    , size: function(width, height) {
        if (this.target instanceof SVG.Text) {
          /* animate font size for Text elements */
          this.attr('font-size', width)

        } else {
          /* animate bbox based size for all other elements */
          var box = this.target.bbox()

          this._size = {
            width:  { from: box.width,  to: width  }
          , height: { from: box.height, to: height }
          }
        }

        return this
      }
      // Add animatable plot
    , plot: function(p) {
        this._plot = p

        return this
      }
      // Add animatable viewbox
    , viewbox: function(x, y, width, height) {
        if (this.target instanceof SVG.Container) {
          var box = this.target.viewbox()

          this._viewbox = {
            x:      { from: box.x,      to: x      }
          , y:      { from: box.y,      to: y      }
          , width:  { from: box.width,  to: width  }
          , height: { from: box.height, to: height }
          }
        }

        return this
      }
      // Add animateable gradient update
    , update: function(o) {
        if (this.target instanceof SVG.Stop) {
          if (o.opacity != null) this.attr('stop-opacity', o.opacity)
          if (o.color   != null) this.attr('stop-color', o.color)
          if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))
        }

        return this
      }
      // Add callback for each keyframe
    , during: function(during) {
        this._during = during

        return this
      }
      // Callback after animation
    , after: function(after) {
        this._after = after

        return this
      }
      // Make loopable
    , loop: function(times) {
        this._loop = times || true

        return this
      }
      // Stop running animation
    , stop: function() {
        /* stop current animation */
        clearTimeout(this.timeout)
        clearInterval(this.interval)

        /* reset storage for properties that need animation */
        this.attrs     = {}
        this.trans     = {}
        this.styles    = {}
        this.situation = {}

        delete this._x
        delete this._y
        delete this._cx
        delete this._cy
        delete this._size
        delete this._plot
        delete this._loop
        delete this._after
        delete this._during
        delete this._viewbox

        return this
      }
      // Pause running animation
    , pause: function() {
        if (this.situation.play === true) {
          this.situation.play  = false
          this.situation.pause = new Date().getTime()
        }

        return this
      }
      // Play running animation
    , play: function() {
        if (this.situation.play === false) {
          var pause = new Date().getTime() - this.situation.pause

          this.situation.finish += pause
          this.situation.start  += pause
          this.situation.play    = true
        }

        return this
      }

    }

    // Define parent class
  , parent: SVG.Element

    // Add method to parent elements
  , construct: {
      // Get fx module or create a new one, then animate with given duration and ease
      animate: function(d, ease, delay) {
        return (this.fx || (this.fx = new SVG.FX(this))).stop().animate(d, ease, delay)
      }
      // Stop current animation; this is an alias to the fx instance
    , stop: function() {
        if (this.fx)
          this.fx.stop()

        return this
      }
      // Pause current animation
    , pause: function() {
        if (this.fx)
          this.fx.pause()

        return this
      }
      // Play paused current animation
    , play: function() {
        if (this.fx)
          this.fx.play()

        return this
      }

    }
  })

  // Calculate position according to from and to
  function at(o, pos) {
    /* number recalculation (don't bother converting to SVG.Number for performance reasons) */
    return typeof o.from == 'number' ?
      o.from + (o.to - o.from) * pos :

    /* instance recalculation */
    o instanceof SVG.Color || o instanceof SVG.Number ? o.at(pos) :

    /* for all other values wait until pos has reached 1 to return the final value */
    pos < 1 ? o.from : o.to
  }

  // Shim layer with setTimeout fallback by Paul Irish
  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.msRequestAnimationFrame     ||
            function (c) { window.setTimeout(c, 1000 / 60) }
  })()

  SVG.extend(SVG.Element, SVG.FX, {
    // Relative move over x axis
    dx: function(x) {
      return this.x(this.x() + x)
    }
    // Relative move over y axis
  , dy: function(y) {
      return this.y(this.y() + y)
    }
    // Relative move over x and y axes
  , dmove: function(x, y) {
      return this.dx(x).dy(y)
    }

  })

  ;[  'click'
    , 'dblclick'
    , 'mousedown'
    , 'mouseup'
    , 'mouseover'
    , 'mouseout'
    , 'mousemove'
    , 'mouseenter'
    , 'mouseleave'
    , 'touchstart'
    , 'touchmove'
    , 'touchleave'
    , 'touchend'
    , 'touchcancel' ].forEach(function(event) {

    /* add event to SVG.Element */
    SVG.Element.prototype[event] = function(f) {
      var self = this

      /* bind event to element rather than element node */
      this.node['on' + event] = typeof f == 'function' ?
        function() { return f.apply(self, arguments) } : null

      return this
    }

  })

  // Add event binder in the SVG namespace
  SVG.on = function(node, event, listener) {
    if (node.addEventListener)
      node.addEventListener(event, listener, false)
    else
      node.attachEvent('on' + event, listener)
  }

  // Add event unbinder in the SVG namespace
  SVG.off = function(node, event, listener) {
    if (node.removeEventListener)
      node.removeEventListener(event, listener, false)
    else
      node.detachEvent('on' + event, listener)
  }

  //
  SVG.extend(SVG.Element, {
    // Bind given event to listener
    on: function(event, listener) {
      SVG.on(this.node, event, listener)

      return this
    }
    // Unbind event from listener
  , off: function(event, listener) {
      SVG.off(this.node, event, listener)

      return this
    }
  })

  SVG.Defs = SVG.invent({
    // Initialize node
    create: 'defs'

    // Inherit from
  , inherit: SVG.Container
  })

  SVG.G = SVG.invent({
    // Initialize node
    create: 'g'

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        return x == null ? this.trans.x : this.transform('x', x)
      }
      // Move over y-axis
    , y: function(y) {
        return y == null ? this.trans.y : this.transform('y', y)
      }
      // Move by center over x-axis
    , cx: function(x) {
        return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2)
      }
      // Move by center over y-axis
    , cy: function(y) {
        return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2)
      }
    }

    // Add parent method
  , construct: {
      // Create a group element
      group: function() {
        return this.put(new SVG.G)
      }
    }
  })

  SVG.extend(SVG.Element, {
    // Get all siblings, including myself
    siblings: function() {
      return this.parent.children()
    }
    // Get the curent position siblings
  , position: function() {
      return this.parent.index(this)
    }
    // Get the next element (will return null if there is none)
  , next: function() {
      return this.siblings()[this.position() + 1]
    }
    // Get the next element (will return null if there is none)
  , previous: function() {
      return this.siblings()[this.position() - 1]
    }
    // Send given element one step forward
  , forward: function() {
      var i = this.position()
      return this.parent.removeElement(this).put(this, i + 1)
    }
    // Send given element one step backward
  , backward: function() {
      var i = this.position()

      if (i > 0)
        this.parent.removeElement(this).add(this, i - 1)

      return this
    }
    // Send given element all the way to the front
  , front: function() {
      return this.parent.removeElement(this).put(this)
    }
    // Send given element all the way to the back
  , back: function() {
      if (this.position() > 0)
        this.parent.removeElement(this).add(this, 0)

      return this
    }
    // Inserts a given element before the targeted element
  , before: function(element) {
      element.remove()

      var i = this.position()

      this.parent.add(element, i)

      return this
    }
    // Insters a given element after the targeted element
  , after: function(element) {
      element.remove()

      var i = this.position()

      this.parent.add(element, i + 1)

      return this
    }

  })

  SVG.Mask = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('mask'))

      /* keep references to masked elements */
      this.targets = []
    }

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      // Unmask all masked elements and remove itself
      remove: function() {
        /* unmask all targets */
        for (var i = this.targets.length - 1; i >= 0; i--)
          if (this.targets[i])
            this.targets[i].unmask()
        delete this.targets

        /* remove mask from parent */
        this.parent.removeElement(this)

        return this
      }
    }

    // Add parent method
  , construct: {
      // Create masking element
      mask: function() {
        return this.defs().put(new SVG.Mask)
      }
    }
  })


  SVG.extend(SVG.Element, {
    // Distribute mask to svg element
    maskWith: function(element) {
      /* use given mask or create a new one */
      this.masker = element instanceof SVG.Mask ? element : this.parent.mask().add(element)

      /* store reverence on self in mask */
      this.masker.targets.push(this)

      /* apply mask */
      return this.attr('mask', 'url("#' + this.masker.attr('id') + '")')
    }
    // Unmask element
  , unmask: function() {
      delete this.masker
      return this.attr('mask', null)
    }

  })


  SVG.Clip = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('clipPath'))

      /* keep references to clipped elements */
      this.targets = []
    }

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      // Unclip all clipped elements and remove itself
      remove: function() {
        /* unclip all targets */
        for (var i = this.targets.length - 1; i >= 0; i--)
          if (this.targets[i])
            this.targets[i].unclip()
        delete this.targets

        /* remove clipPath from parent */
        this.parent.removeElement(this)

        return this
      }
    }

    // Add parent method
  , construct: {
      // Create clipping element
      clip: function() {
        return this.defs().put(new SVG.Clip)
      }
    }
  })

  //
  SVG.extend(SVG.Element, {
    // Distribute clipPath to svg element
    clipWith: function(element) {
      /* use given clip or create a new one */
      this.clipper = element instanceof SVG.Clip ? element : this.parent.clip().add(element)

      /* store reverence on self in mask */
      this.clipper.targets.push(this)

      /* apply mask */
      return this.attr('clip-path', 'url("#' + this.clipper.attr('id') + '")')
    }
    // Unclip element
  , unclip: function() {
      delete this.clipper
      return this.attr('clip-path', null)
    }

  })

  SVG.Gradient = SVG.invent({
    // Initialize node
    create: function(type) {
      this.constructor.call(this, SVG.create(type + 'Gradient'))

      /* store type */
      this.type = type
    }

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      // From position
      from: function(x, y) {
        return this.type == 'radial' ?
          this.attr({ fx: new SVG.Number(x), fy: new SVG.Number(y) }) :
          this.attr({ x1: new SVG.Number(x), y1: new SVG.Number(y) })
      }
      // To position
    , to: function(x, y) {
        return this.type == 'radial' ?
          this.attr({ cx: new SVG.Number(x), cy: new SVG.Number(y) }) :
          this.attr({ x2: new SVG.Number(x), y2: new SVG.Number(y) })
      }
      // Radius for radial gradient
    , radius: function(r) {
        return this.type == 'radial' ?
          this.attr({ r: new SVG.Number(r) }) :
          this
      }
      // Add a color stop
    , at: function(offset, color, opacity) {
        return this.put(new SVG.Stop).update(offset, color, opacity)
      }
      // Update gradient
    , update: function(block) {
        /* remove all stops */
        this.clear()

        /* invoke passed block */
        if (typeof block == 'function')
          block.call(this, this)

        return this
      }
      // Return the fill id
    , fill: function() {
        return 'url(#' + this.attr('id') + ')'
      }
      // Alias string convertion to fill
    , toString: function() {
        return this.fill()
      }
    }

    // Add parent method
  , construct: {
      // Create gradient element in defs
      gradient: function(type, block) {
        return this.defs().gradient(type, block)
      }
    }
  })

  SVG.extend(SVG.Defs, {
    // define gradient
    gradient: function(type, block) {
      return this.put(new SVG.Gradient(type)).update(block)
    }

  })

  SVG.Stop = SVG.invent({
    // Initialize node
    create: 'stop'

    // Inherit from
  , inherit: SVG.Element

    // Add class methods
  , extend: {
      // add color stops
      update: function(o) {
        if (typeof o == 'number' || o instanceof SVG.Number) {
          o = {
            offset:  arguments[0]
          , color:   arguments[1]
          , opacity: arguments[2]
          }
        }

        /* set attributes */
        if (o.opacity != null) this.attr('stop-opacity', o.opacity)
        if (o.color   != null) this.attr('stop-color', o.color)
        if (o.offset  != null) this.attr('offset', new SVG.Number(o.offset))

        return this
      }
    }

  })


  SVG.Pattern = SVG.invent({
    // Initialize node
    create: 'pattern'

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      // Return the fill id
  	  fill: function() {
  	    return 'url(#' + this.attr('id') + ')'
  	  }
  	  // Update pattern by rebuilding
  	, update: function(block) {
  			/* remove content */
        this.clear()

        /* invoke passed block */
        if (typeof block == 'function')
        	block.call(this, this)

        return this
  		}
  	  // Alias string convertion to fill
  	, toString: function() {
  	    return this.fill()
  	  }
    }

    // Add parent method
  , construct: {
      // Create pattern element in defs
  	  pattern: function(width, height, block) {
  	    return this.defs().pattern(width, height, block)
  	  }
    }
  })

  SVG.extend(SVG.Defs, {
    // Define gradient
    pattern: function(width, height, block) {
      return this.put(new SVG.Pattern).update(block).attr({
        x:            0
      , y:            0
      , width:        width
      , height:       height
      , patternUnits: 'userSpaceOnUse'
      })
    }

  })

  SVG.Doc = SVG.invent({
    // Initialize node
    create: function(element) {
      /* ensure the presence of a html element */
      this.parent = typeof element == 'string' ?
        document.getElementById(element) :
        element

      /* If the target is an svg element, use that element as the main wrapper.
         This allows svg.js to work with svg documents as well. */
      this.constructor
        .call(this, this.parent.nodeName == 'svg' ? this.parent : SVG.create('svg'))

      /* set svg element attributes */
      this
        .attr({ xmlns: SVG.ns, version: '1.1', width: '100%', height: '100%' })
        .attr('xmlns:xlink', SVG.xlink, SVG.xmlns)

      /* create the <defs> node */
      this._defs = new SVG.Defs
      this._defs.parent = this
      this.node.appendChild(this._defs.node)

      /* turn off sub pixel offset by default */
      this.doSpof = false

      /* ensure correct rendering */
      if (this.parent != this.node)
        this.stage()
    }

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      /* enable drawing */
      stage: function() {
        var element = this

        /* insert element */
        this.parent.appendChild(this.node)

        /* fix sub-pixel offset */
        element.spof()

        /* make sure sub-pixel offset is fixed every time the window is resized */
        SVG.on(window, 'resize', function() {
          element.spof()
        })

        return this
      }

      // Creates and returns defs element
    , defs: function() {
        return this._defs
      }

      // Fix for possible sub-pixel offset. See:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=608812
    , spof: function() {
        if (this.doSpof) {
          var pos = this.node.getScreenCTM()

          if (pos)
            this
              .style('left', (-pos.e % 1) + 'px')
              .style('top',  (-pos.f % 1) + 'px')
        }

        return this
      }

      // Enable sub-pixel offset
    , fixSubPixelOffset: function() {
        this.doSpof = true

        return this
      }
    }

  })


  SVG.Shape = SVG.invent({
    // Initialize node
    create: function(element) {
  	  this.constructor.call(this, element)
  	}

    // Inherit from
  , inherit: SVG.Element

  })

  SVG.Use = SVG.invent({
    // Initialize node
    create: 'use'

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // Use element as a reference
      element: function(element) {
        /* store target element */
        this.target = element

        /* set lined element */
        return this.attr('href', '#' + element, SVG.xlink)
      }
    }

    // Add parent method
  , construct: {
      // Create a use element
      use: function(element) {
        return this.put(new SVG.Use).element(element)
      }
    }
  })

  SVG.Rect = SVG.invent({
  	// Initialize node
    create: 'rect'

  	// Inherit from
  , inherit: SVG.Shape

  	// Add parent method
  , construct: {
    	// Create a rect element
    	rect: function(width, height) {
    	  return this.put(new SVG.Rect().size(width, height))
    	}

  	}

  })

  SVG.Ellipse = SVG.invent({
    // Initialize node
    create: 'ellipse'

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        return x == null ? this.cx() - this.attr('rx') : this.cx(x + this.attr('rx'))
      }
      // Move over y-axis
    , y: function(y) {
        return y == null ? this.cy() - this.attr('ry') : this.cy(y + this.attr('ry'))
      }
      // Move by center over x-axis
    , cx: function(x) {
        return x == null ? this.attr('cx') : this.attr('cx', new SVG.Number(x).divide(this.trans.scaleX))
      }
      // Move by center over y-axis
    , cy: function(y) {
        return y == null ? this.attr('cy') : this.attr('cy', new SVG.Number(y).divide(this.trans.scaleY))
      }
      // Set width of element
    , width: function(width) {
        return width == null ? this.attr('rx') * 2 : this.attr('rx', new SVG.Number(width).divide(2))
      }
      // Set height of element
    , height: function(height) {
        return height == null ? this.attr('ry') * 2 : this.attr('ry', new SVG.Number(height).divide(2))
      }
      // Custom size function
    , size: function(width, height) {
        var p = this._proportionalSize(width, height)

        return this.attr({
          rx: new SVG.Number(p.width).divide(2)
        , ry: new SVG.Number(p.height).divide(2)
        })
      }

    }

    // Add parent method
  , construct: {
      // Create circle element, based on ellipse
      circle: function(size) {
        return this.ellipse(size, size)
      }
      // Create an ellipse
    , ellipse: function(width, height) {
        return this.put(new SVG.Ellipse).size(width, height).move(0, 0)
      }

    }

  })

  SVG.Line = SVG.invent({
    // Initialize node
    create: 'line'

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        var b = this.bbox()

        return x == null ? b.x : this.attr({
          x1: this.attr('x1') - b.x + x
        , x2: this.attr('x2') - b.x + x
        })
      }
      // Move over y-axis
    , y: function(y) {
        var b = this.bbox()

        return y == null ? b.y : this.attr({
          y1: this.attr('y1') - b.y + y
        , y2: this.attr('y2') - b.y + y
        })
      }
      // Move by center over x-axis
    , cx: function(x) {
        var half = this.bbox().width / 2
        return x == null ? this.x() + half : this.x(x - half)
      }
      // Move by center over y-axis
    , cy: function(y) {
        var half = this.bbox().height / 2
        return y == null ? this.y() + half : this.y(y - half)
      }
      // Set width of element
    , width: function(width) {
        var b = this.bbox()

        return width == null ? b.width : this.attr(this.attr('x1') < this.attr('x2') ? 'x2' : 'x1', b.x + width)
      }
      // Set height of element
    , height: function(height) {
        var b = this.bbox()

        return height == null ? b.height : this.attr(this.attr('y1') < this.attr('y2') ? 'y2' : 'y1', b.y + height)
      }
      // Set line size by width and height
    , size: function(width, height) {
        var p = this._proportionalSize(width, height)

        return this.width(p.width).height(p.height)
      }
      // Set path data
    , plot: function(x1, y1, x2, y2) {
        return this.attr({
          x1: x1
        , y1: y1
        , x2: x2
        , y2: y2
        })
      }
    }

    // Add parent method
  , construct: {
      // Create a line element
      line: function(x1, y1, x2, y2) {
        return this.put(new SVG.Line().plot(x1, y1, x2, y2))
      }
    }
  })


  SVG.Polyline = SVG.invent({
    // Initialize node
    create: 'polyline'

    // Inherit from
  , inherit: SVG.Shape

    // Add parent method
  , construct: {
      // Create a wrapped polyline element
      polyline: function(p) {
        return this.put(new SVG.Polyline).plot(p)
      }
    }
  })

  SVG.Polygon = SVG.invent({
    // Initialize node
    create: 'polygon'

    // Inherit from
  , inherit: SVG.Shape

    // Add parent method
  , construct: {
      // Create a wrapped polygon element
      polygon: function(p) {
        return this.put(new SVG.Polygon).plot(p)
      }
    }
  })

  // Add polygon-specific functions
  SVG.extend(SVG.Polyline, SVG.Polygon, {
    // Define morphable array
    morphArray:  SVG.PointArray
    // Plot new path
  , plot: function(p) {
      return this.attr('points', (this.array = new SVG.PointArray(p, [[0,0]])))
    }
    // Move by left top corner
  , move: function(x, y) {
      return this.attr('points', this.array.move(x, y))
    }
    // Move by left top corner over x-axis
  , x: function(x) {
      return x == null ? this.bbox().x : this.move(x, this.bbox().y)
    }
    // Move by left top corner over y-axis
  , y: function(y) {
      return y == null ? this.bbox().y : this.move(this.bbox().x, y)
    }
    // Set width of element
  , width: function(width) {
      var b = this.bbox()

      return width == null ? b.width : this.size(width, b.height)
    }
    // Set height of element
  , height: function(height) {
      var b = this.bbox()

      return height == null ? b.height : this.size(b.width, height)
    }
    // Set element size to given width and height
  , size: function(width, height) {
      var p = this._proportionalSize(width, height)

      return this.attr('points', this.array.size(p.width, p.height))
    }

  })

  SVG.Path = SVG.invent({
    // Initialize node
    create: 'path'

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // Plot new poly points
      plot: function(p) {
        return this.attr('d', (this.array = new SVG.PathArray(p, [['M', 0, 0]])))
      }
      // Move by left top corner
    , move: function(x, y) {
        return this.attr('d', this.array.move(x, y))
      }
      // Move by left top corner over x-axis
    , x: function(x) {
        return x == null ? this.bbox().x : this.move(x, this.bbox().y)
      }
      // Move by left top corner over y-axis
    , y: function(y) {
        return y == null ? this.bbox().y : this.move(this.bbox().x, y)
      }
      // Set element size to given width and height
    , size: function(width, height) {
        var p = this._proportionalSize(width, height)

        return this.attr('d', this.array.size(p.width, p.height))
      }
      // Set width of element
    , width: function(width) {
        return width == null ? this.bbox().width : this.size(width, this.bbox().height)
      }
      // Set height of element
    , height: function(height) {
        return height == null ? this.bbox().height : this.size(this.bbox().width, height)
      }

    }

    // Add parent method
  , construct: {
      // Create a wrapped path element
      path: function(d) {
        return this.put(new SVG.Path).plot(d)
      }
    }
  })

  SVG.Image = SVG.invent({
    // Initialize node
    create: 'image'

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // (re)load image
      load: function(url) {
        if (!url) return this

        var self = this
          , img  = document.createElement('img')

        /* preload image */
        img.onload = function() {
          var p = self.doc(SVG.Pattern)

          /* ensure image size */
          if (self.width() == 0 && self.height() == 0)
            self.size(img.width, img.height)

          /* ensure pattern size if not set */
          if (p && p.width() == 0 && p.height() == 0)
            p.size(self.width(), self.height())

          /* callback */
          if (typeof self._loaded == 'function')
            self._loaded.call(self, {
              width:  img.width
            , height: img.height
            , ratio:  img.width / img.height
            , url:    url
            })
        }

        return this.attr('href', (img.src = this.src = url), SVG.xlink)
      }
      // Add loade callback
    , loaded: function(loaded) {
        this._loaded = loaded
        return this
      }
    }

    // Add parent method
  , construct: {
      // Create image element, load image and set its size
      image: function(source, width, height) {
        return this.put(new SVG.Image).load(source).size(width || 0, height || width || 0)
      }
    }
  })

  SVG.Text = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('text'))

      this._leading = new SVG.Number(1.3) /* store leading value for rebuilding */
      this._rebuild = true                /* enable automatic updating of dy values */
      this._build   = false               /* disable build mode for adding multiple lines */

      /* set default font */
      this.attr('font-family', SVG.defaults.attrs['font-family'])
    }

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // Move over x-axis
      x: function(x) {
        /* act as getter */
        if (x == null)
          return this.attr('x')

        /* move lines as well if no textPath is present */
        if (!this.textPath)
          this.lines.each(function() { if (this.newLined) this.x(x) })

        return this.attr('x', x)
      }
      // Move over y-axis
    , y: function(y) {
        /* act as getter */
        if (y == null)
          return this.attr('y')

        return this.attr('y', y + this.attr('y') - this.bbox().y)
      }
      // Move center over x-axis
    , cx: function(x) {
        return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2)
      }
      // Move center over y-axis
    , cy: function(y) {
        return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2)
      }
      // Move element to given x and y values
    , move: function(x, y) {
        return this.x(x).y(y)
      }
      // Move element by its center
    , center: function(x, y) {
        return this.cx(x).cy(y)
      }
      // Set the text content
    , text: function(text) {
        /* act as getter */
        if (!text) return this.content

        /* remove existing content */
        this.clear().build(true)

        if (typeof text === 'function') {
          /* call block */
          text.call(this, this)

        } else {
          /* store text and make sure text is not blank */
          text = (this.content = (SVG.regex.isBlank.test(text) ? 'text' : text)).split('\n')

          /* build new lines */
          for (var i = 0, il = text.length; i < il; i++)
            this.tspan(text[i]).newLine()
        }

        /* disable build mode and rebuild lines */
        return this.build(false).rebuild()
      }
      // Set font size
    , size: function(size) {
        return this.attr('font-size', size).rebuild()
      }
      // Set / get leading
    , leading: function(value) {
        /* act as getter */
        if (value == null)
          return this._leading

        /* act as setter */
        this._leading = new SVG.Number(value)

        return this.rebuild()
      }
      // Rebuild appearance type
    , rebuild: function(rebuild) {
        var self = this

        /* store new rebuild flag if given */
        if (typeof rebuild == 'boolean')
          this._rebuild = rebuild

        /* define position of all lines */
        if (this._rebuild) {
          this.lines.each(function() {
            if (this.newLined) {
              if (!this.textPath)
                this.attr('x', self.attr('x'))
              this.attr('dy', self._leading * new SVG.Number(self.attr('font-size')))
            }
          })
        }

        return this
      }
      // Enable / disable build mode
    , build: function(build) {
        this._build = !!build
        return this
      }
    }

    // Add parent method
  , construct: {
      // Create text element
      text: function(text) {
        return this.put(new SVG.Text).text(text)
      }
      // Create plain text element
    , plain: function(text) {
        return this.put(new SVG.Text).plain(text)
      }
    }

  })

  SVG.TSpan = SVG.invent({
    // Initialize node
    create: 'tspan'

    // Inherit from
  , inherit: SVG.Shape

    // Add class methods
  , extend: {
      // Set text content
      text: function(text) {
        typeof text === 'function' ? text.call(this, this) : this.plain(text)

        return this
      }
      // Shortcut dx
    , dx: function(dx) {
        return this.attr('dx', dx)
      }
      // Shortcut dy
    , dy: function(dy) {
        return this.attr('dy', dy)
      }
      // Create new line
    , newLine: function() {
        /* fetch text parent */
        var t = this.doc(SVG.Text)

        /* mark new line */
        this.newLined = true

        /* apply new hy¡n */
        return this.dy(t._leading * t.attr('font-size')).attr('x', t.x())
      }
    }

  })

  SVG.extend(SVG.Text, SVG.TSpan, {
    // Create plain text node
    plain: function(text) {
      /* clear if build mode is disabled */
      if (this._build === false)
        this.clear()

      /* create text node */
      this.node.appendChild(document.createTextNode((this.content = text)))

      return this
    }
    // Create a tspan
  , tspan: function(text) {
      var node  = (this.textPath || this).node
        , tspan = new SVG.TSpan

      /* clear if build mode is disabled */
      if (this._build === false)
        this.clear()

      /* add new tspan and reference */
      node.appendChild(tspan.node)
      tspan.parent = this

      /* only first level tspans are considered to be "lines" */
      if (this instanceof SVG.Text)
        this.lines.add(tspan)

      return tspan.text(text)
    }
    // Clear all lines
  , clear: function() {
      var node = (this.textPath || this).node

      /* remove existing child nodes */
      while (node.hasChildNodes())
        node.removeChild(node.lastChild)

      /* reset content references  */
      if (this instanceof SVG.Text) {
        delete this.lines
        this.lines = new SVG.Set
        this.content = ''
      }

      return this
    }
  })



  SVG.TextPath = SVG.invent({
    // Initialize node
    create: 'textPath'

    // Inherit from
  , inherit: SVG.Element

    // Define parent class
  , parent: SVG.Text

    // Add parent method
  , construct: {
      // Create path for text to run on
      path: function(d) {
        /* create textPath element */
        this.textPath = new SVG.TextPath

        /* move lines to textpath */
        while(this.node.hasChildNodes())
          this.textPath.node.appendChild(this.node.firstChild)

        /* add textPath element as child node */
        this.node.appendChild(this.textPath.node)

        /* create path in defs */
        this.track = this.doc().defs().path(d)

        /* create circular reference */
        this.textPath.parent = this

        /* link textPath to path and add content */
        this.textPath.attr('href', '#' + this.track, SVG.xlink)

        return this
      }
      // Plot path if any
    , plot: function(d) {
        if (this.track) this.track.plot(d)
        return this
      }
    }
  })

  SVG.Nested = SVG.invent({
    // Initialize node
    create: function() {
      this.constructor.call(this, SVG.create('svg'))

      this.style('overflow', 'visible')
    }

    // Inherit from
  , inherit: SVG.Container

    // Add parent method
  , construct: {
      // Create nested svg document
    nested: function() {
        return this.put(new SVG.Nested)
      }
    }
  })

  SVG.A = SVG.invent({
    // Initialize node
    create: 'a'

    // Inherit from
  , inherit: SVG.Container

    // Add class methods
  , extend: {
      // Link url
      to: function(url) {
        return this.attr('href', url, SVG.xlink)
      }
      // Link show attribute
    , show: function(target) {
        return this.attr('show', target, SVG.xlink)
      }
      // Link target attribute
    , target: function(target) {
        return this.attr('target', target)
      }
    }

    // Add parent method
  , construct: {
      // Create a hyperlink element
      link: function(url) {
        return this.put(new SVG.A).to(url)
      }
    }
  })

  SVG.extend(SVG.Element, {
    // Create a hyperlink element
    linkTo: function(url) {
      var link = new SVG.A

      if (typeof url == 'function')
        url.call(link, link)
      else
        link.to(url)

      return this.parent.put(link).put(this)
    }

  })

  var sugar = {
    stroke: ['color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset']
  , fill:   ['color', 'opacity', 'rule']
  , prefix: function(t, a) {
      return a == 'color' ? t : t + '-' + a
    }
  }

  /* Add sugar for fill and stroke */
  ;['fill', 'stroke'].forEach(function(m) {
    var i, extension = {}

    extension[m] = function(o) {
      if (typeof o == 'string' || SVG.Color.isRgb(o) || (o && typeof o.fill === 'function'))
        this.attr(m, o)

      else
        /* set all attributes from sugar.fill and sugar.stroke list */
        for (i = sugar[m].length - 1; i >= 0; i--)
          if (o[sugar[m][i]] != null)
            this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]])

      return this
    }

    SVG.extend(SVG.Element, SVG.FX, extension)

  })

  SVG.extend(SVG.Element, SVG.FX, {
    // Rotation
    rotate: function(deg, x, y) {
      return this.transform({
        rotation: deg || 0
      , cx: x
      , cy: y
      })
    }
    // Skew
  , skew: function(x, y) {
      return this.transform({
        skewX: x || 0
      , skewY: y || 0
      })
    }
    // Scale
  , scale: function(x, y) {
      return this.transform({
        scaleX: x
      , scaleY: y == null ? x : y
      })
    }
    // Translate
  , translate: function(x, y) {
      return this.transform({
        x: x
      , y: y
      })
    }
    // Matrix
  , matrix: function(m) {
      return this.transform({ matrix: m })
    }
    // Opacity
  , opacity: function(value) {
      return this.attr('opacity', value)
    }

  })

  SVG.extend(SVG.Rect, SVG.Ellipse, SVG.FX, {
    // Add x and y radius
    radius: function(x, y) {
      return this.attr({ rx: x, ry: y || x })
    }

  })

  SVG.extend(SVG.Path, {
    // Get path length
    length: function() {
      return this.node.getTotalLength()
    }
    // Get point at length
  , pointAt: function(length) {
      return this.node.getPointAtLength(length)
    }

  })

  SVG.extend(SVG.Text, SVG.FX, {
    // Set font
    font: function(o) {
      for (var k in o)
        k == 'leading' ?
          this.leading(o[k]) :
        k == 'anchor' ?
          this.attr('text-anchor', o[k]) :
        k == 'size' || k == 'family' || k == 'weight' || k == 'stretch' || k == 'variant' || k == 'style' ?
          this.attr('font-'+ k, o[k]) :
          this.attr(k, o[k])

      return this
    }

  })



  SVG.Set = SVG.invent({
    // Initialize
    create: function() {
      /* set initial state */
      this.clear()
    }

    // Add class methods
  , extend: {
      // Add element to set
      add: function() {
        var i, il, elements = [].slice.call(arguments)

        for (i = 0, il = elements.length; i < il; i++)
          this.members.push(elements[i])

        return this
      }
      // Remove element from set
    , remove: function(element) {
        var i = this.index(element)

        /* remove given child */
        if (i > -1)
          this.members.splice(i, 1)

        return this
      }
      // Iterate over all members
    , each: function(block) {
        for (var i = 0, il = this.members.length; i < il; i++)
          block.apply(this.members[i], [i, this.members])

        return this
      }
      // Restore to defaults
    , clear: function() {
        /* initialize store */
        this.members = []

        return this
      }
      // Checks if a given element is present in set
    , has: function(element) {
        return this.index(element) >= 0
      }
      // retuns index of given element in set
    , index: function(element) {
        return this.members.indexOf(element)
      }
      // Get member at given index
    , get: function(i) {
        return this.members[i]
      }
      // Default value
    , valueOf: function() {
        return this.members
      }
      // Get the bounding box of all members included or empty box if set has no items
    , bbox: function(){
        var box = new SVG.BBox()

        /* return an empty box of there are no members */
        if (this.members.length == 0)
          return box

        /* get the first rbox and update the target bbox */
        var rbox = this.members[0].rbox()
        box.x      = rbox.x
        box.y      = rbox.y
        box.width  = rbox.width
        box.height = rbox.height

        this.each(function() {
          /* user rbox for correct position and visual representation */
          box = box.merge(this.rbox())
        })

        return box
      }
    }

    // Add parent method
  , construct: {
      // Create a new set
      set: function() {
        return new SVG.Set
      }
    }
  })

  SVG.SetFX = SVG.invent({
    // Initialize node
    create: function(set) {
      /* store reference to set */
      this.set = set
    }

  })

  // Alias methods
  SVG.Set.inherit = function() {
    var m
      , methods = []

    /* gather shape methods */
    for(var m in SVG.Shape.prototype)
      if (typeof SVG.Shape.prototype[m] == 'function' && typeof SVG.Set.prototype[m] != 'function')
        methods.push(m)

    /* apply shape aliasses */
    methods.forEach(function(method) {
      SVG.Set.prototype[method] = function() {
        for (var i = 0, il = this.members.length; i < il; i++)
          if (this.members[i] && typeof this.members[i][method] == 'function')
            this.members[i][method].apply(this.members[i], arguments)

        return method == 'animate' ? (this.fx || (this.fx = new SVG.SetFX(this))) : this
      }
    })

    /* clear methods for the next round */
    methods = []

    /* gather fx methods */
    for(var m in SVG.FX.prototype)
      if (typeof SVG.FX.prototype[m] == 'function' && typeof SVG.SetFX.prototype[m] != 'function')
        methods.push(m)

    /* apply fx aliasses */
    methods.forEach(function(method) {
      SVG.SetFX.prototype[method] = function() {
        for (var i = 0, il = this.set.members.length; i < il; i++)
          this.set.members[i].fx[method].apply(this.set.members[i].fx, arguments)

        return this
      }
    })
  }




  SVG.extend(SVG.Element, {
  	// Store data values on svg nodes
    data: function(a, v, r) {
    	if (typeof a == 'object') {
    		for (v in a)
    			this.data(v, a[v])

      } else if (arguments.length < 2) {
        try {
          return JSON.parse(this.attr('data-' + a))
        } catch(e) {
          return this.attr('data-' + a)
        }

      } else {
        this.attr(
          'data-' + a
        , v === null ?
            null :
          r === true || typeof v === 'string' || typeof v === 'number' ?
            v :
            JSON.stringify(v)
        )
      }

      return this
    }
  })

  SVG.extend(SVG.Element, {
    // Remember arbitrary data
    remember: function(k, v) {
      /* remember every item in an object individually */
      if (typeof arguments[0] == 'object')
        for (var v in k)
          this.remember(v, k[v])

      /* retrieve memory */
      else if (arguments.length == 1)
        return this.memory()[k]

      /* store memory */
      else
        this.memory()[k] = v

      return this
    }

    // Erase a given memory
  , forget: function() {
      if (arguments.length == 0)
        this._memory = {}
      else
        for (var i = arguments.length - 1; i >= 0; i--)
          delete this.memory()[arguments[i]]

      return this
    }

    // Initialize or return local memory object
  , memory: function() {
      return this._memory || (this._memory = {})
    }

  })

  if (typeof define === 'function' && define.amd)
    define(function() { return SVG })
  else if (typeof exports !== 'undefined')
    exports.SVG = SVG

}).call(this);
;/**
 * @author sole / http://soledadpenades.com
 * @author mrdoob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 * @author endel / http://endel.me
 * @author Ben Delarre / http://delarre.net
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '13',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};



// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
;(function() {
  var backOut, body, circOut, draw, elastic, glass, glass_2, glass_3, glass_4, glass_mask, glass_outside, light_grey, loading_panel, shape_1, shape_2, shape_3, shape_4, whiskey, whiskey_color;

  backOut = function(pos) {
    var s;
    pos = pos - 1;
    s = 1.70158;
    return pos * pos * ((s + 1) * pos + s) + 1;
  };

  circOut = function(pos) {
    return Math.sqrt(1 - Math.pow(pos - 1, 2));
  };

  elastic = function(pos) {
    if (pos === !!pos) {
      return pos;
    }
    return Math.pow(2, -10 * pos) * Math.sin((pos - 0.075) * (2 * Math.PI) / .3) + 1;
  };

  light_grey = '#ddd';

  shape_1 = 'M81.155,367.61 c85.62,20.005,151.713,20.152,236.266,0.014c4.247-1.011,7.445-4.89,7.916-9.665l38.384-287.664 c0.648-6.57-4.006-12.308-9.984-12.308H47.579c-5.951,0-10.597,5.689-9.991,12.234l35.608,287.642 C73.641,362.683,76.867,366.608,81.155,367.61z';

  shape_2 = 'M85.974,290.421 c76.429,13.759,152.387,13.86,227.863,0.01c3.791-0.696,6.646-3.363,7.067-6.647L364.37,69.849 c1.572-3.026-11.824-14.464-13.396-11.438l-304.569-1c-5.312,0-9.002,8.308-8.461,12.809l40.925,213.497 C79.267,287.032,82.146,289.732,85.974,290.421z';

  shape_3 = 'M93.418,274.278 c-4.93,1.369,107.461-27.184,210.759,0';

  shape_4 = 'M79.734,298.658c0,0,107.266,50.342,242.025-2';

  whiskey_color = '#ad5321';

  body = document.getElementsByTagName('body')[0];

  loading_panel = document.getElementById('loading-panel');

  if (loading_panel) {
    draw = SVG("glass").viewbox(0, 0, 400, 400).attr('preserveAspectRatio', 'xMidYMin meet');
    whiskey = draw.path(shape_2).fill(whiskey_color).opacity(0);
    glass_outside = draw.path(shape_1).fill('none').stroke({
      'color': light_grey,
      'width': 7
    });
    glass_2 = draw.path(shape_2).fill('none').stroke({
      'color': light_grey,
      'width': 2
    });
    glass_3 = draw.path(shape_3).fill('none').stroke({
      'color': light_grey,
      'width': 2
    });
    glass_4 = draw.path(shape_4).fill('none').stroke({
      'color': light_grey,
      'width': 2
    });
    glass_mask = draw.rect(400, 300).fill('none').translate(0, 300);
    whiskey.clipWith(glass_mask);
    glass_mask.animate(3000, circOut, 1000).translate(0, 100).after(function() {
      whiskey.animate(300, circOut, 0).scale(1.1, 1.1).translate(-15, -15).opacity(0);
      return glass.animate(400, circOut, 0).scale(1.1, 1.1).translate(-15, -15).opacity(0).after(function() {
        body.setAttribute('class', '');
        loading_panel.setAttribute('class', '');
        return setTimeout(function() {
          return loading_panel.setAttribute('class', 'loading-done');
        }, 1000);
      });
    });
    glass = draw.set().add(glass_outside).add(glass_2).add(glass_3).add(glass_4).translate(100, 0).scale(.5, .5).opacity(0);
    glass.animate(700, circOut, 500).opacity(1).during(function(pos, morph) {
      return this.scale(morph(.9, 1), morph(.9, 1)).translate(morph(15, 0), morph(0, 0));
    }).after(function() {
      return whiskey.opacity(1);
    });
  } else {
    setTimeout(function() {
      return body.setAttribute('class', 'page-loaded');
    }, 300);
  }

}).call(this);
;(function() {
  var color, color_1, initChart, supportsSVG;

  supportsSVG = function() {
    return !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
  };

  if (supportsSVG) {
    color = '#c4572a';
    color_1 = '#16bef2';
    initChart = function(selector, color, unit_space, vb_width, vb_height) {
      var addDataNames, addDataUnits, addTicks, buildBarChart, g_bars, g_ticks, g_xdata, g_ydata, getTableData, metric_data, name_data, svg_container, svg_doc, svg_table, viewbox_height, viewbox_width, x_gap, x_padding, x_region, x_units_height, x_width, y_max, y_min, y_padding, y_scale, y_units_width;
      viewbox_height = vb_height;
      viewbox_width = vb_width;
      name_data = [];
      metric_data = [];
      svg_table = '';
      svg_container = '';
      getTableData = function(selector) {
        var cell_length, cell_val, i, j, o_cells, row_length, _results;
        svg_container = document.getElementById(selector);
        svg_table = svg_container.getElementsByTagName('table')[0];
        row_length = svg_table.rows.length;
        i = 0;
        _results = [];
        while (i < row_length) {
          o_cells = svg_table.rows.item(i).cells;
          cell_length = o_cells.length;
          j = 0;
          while (j < cell_length) {
            cell_val = o_cells.item(j).childNodes[0].textContent;
            if (i === 0) {
              name_data.push(cell_val);
            }
            if (i === 1) {
              metric_data.push(parseInt(cell_val));
            }
            j++;
          }
          _results.push(i++);
        }
        return _results;
      };
      getTableData(selector);
      y_max = Math.max.apply(Math, metric_data);
      y_min = Math.min.apply(Math, metric_data);
      y_padding = 20;
      y_units_width = unit_space;
      x_units_height = 50;
      x_region = (viewbox_width - y_units_width) / metric_data.length;
      y_scale = (viewbox_height - (x_units_height + y_padding)) / y_max;
      x_width = (viewbox_width - y_units_width) / metric_data.length;
      x_gap = x_width / 1.5;
      x_padding = x_gap / 2;
      buildBarChart = function(data, i) {
        var bar, x_axis, x_unit, y_axis, y_unit;
        y_unit = data * y_scale;
        y_axis = viewbox_height - y_unit;
        x_unit = i;
        x_axis = x_width * x_unit;
        bar = document.createElementNS('http://www.w3.org/2000/svg', "rect");
        bar.setAttributeNS(null, "width", x_gap);
        bar.setAttributeNS(null, "height", y_unit);
        bar.setAttribute('transform', 'translate(' + x_axis + ', ' + y_axis + ')');
        bar.setAttributeNS(null, "fill", color);
        return g_bars.appendChild(bar);
      };
      addDataNames = function(data, i) {
        var text, textNode, x_axis, x_unit, y_axis;
        x_unit = i;
        x_axis = (x_width * x_unit) + x_padding;
        y_axis = viewbox_height - y_padding;
        text = document.createElementNS('http://www.w3.org/2000/svg', "text");
        text.setAttributeNS(null, "text-anchor", 'middle');
        text.setAttribute('transform', 'translate(' + x_axis + ', ' + y_axis + ')');
        textNode = document.createTextNode(data);
        g_xdata.appendChild(text);
        return text.appendChild(textNode);
      };
      addDataUnits = function(data, i) {
        var text, textNode, x_axis, y_axis, y_unit;
        y_unit = data * y_scale;
        y_axis = viewbox_height - y_unit;
        x_axis = y_units_width + (x_padding / 2);
        text = document.createElementNS('http://www.w3.org/2000/svg', "text");
        text.setAttributeNS(null, "text-anchor", 'end');
        text.setAttribute('transform', 'translate(' + x_axis + ', ' + (y_axis + 3) + ')');
        textNode = document.createTextNode(data);
        g_ydata.appendChild(text);
        return text.appendChild(textNode);
      };
      addTicks = function(data, i) {
        var line, x_axis, y_axis, y_unit;
        y_unit = data * y_scale;
        y_axis = viewbox_height - y_unit;
        x_axis = y_units_width + (x_padding / 2);
        line = document.createElementNS('http://www.w3.org/2000/svg', "line");
        line.setAttributeNS(null, "x1", x_axis + 10);
        line.setAttributeNS(null, "y1", y_axis);
        line.setAttributeNS(null, "x2", viewbox_width);
        line.setAttributeNS(null, "y2", y_axis);
        line.setAttributeNS(null, "stroke-width", 0.75);
        line.setAttributeNS(null, "stroke", "#606060");
        return g_ticks.appendChild(line);
      };
      svg_table.setAttribute("style", "display:none;");
      svg_container.setAttribute('class', 'svg-container');
      svg_doc = document.createElementNS('http://www.w3.org/2000/svg', "svg");
      svg_doc.setAttributeNS(null, "viewBox", '0 0 ' + viewbox_width + ' ' + viewbox_height);
      svg_doc.setAttributeNS(null, "preserveAspectRatio", 'xMidYMin meet');
      g_ticks = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g_ticks.setAttribute('class', 'ticks');
      g_ticks.setAttribute('transform', 'translate(0, ' + (-x_units_height) + ')');
      g_bars = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g_bars.setAttribute('class', 'bar-chart');
      g_bars.setAttribute('transform', 'translate(' + (y_units_width + x_padding) + ' , ' + -(+x_units_height) + ')');
      g_ydata = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g_ydata.setAttribute('class', 'ydata');
      g_ydata.setAttribute('transform', 'translate(0, ' + (-x_units_height) + ')');
      g_xdata = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g_xdata.setAttribute('class', 'xdata');
      g_xdata.setAttribute('transform', 'translate(' + (y_units_width + x_padding) + ',0)');
      svg_container.appendChild(svg_doc);
      svg_doc.appendChild(g_ticks);
      svg_doc.appendChild(g_bars);
      svg_doc.appendChild(g_ydata);
      svg_doc.appendChild(g_xdata);
      metric_data.forEach(buildBarChart);
      metric_data.forEach(addDataUnits);
      metric_data.forEach(addTicks);
      return name_data.forEach(addDataNames);
    };
    initChart('speed-data', color, 20, 1040, 520);
    initChart('mass-data', color, 30, 1040, 520);
    initChart('distance-data', color, 100, 1040, 520);
  }

}).call(this);
