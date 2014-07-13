(function() {
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
