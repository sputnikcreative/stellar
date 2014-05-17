(function() {
  var color, color_1, initChart, supportsSVG;

  supportsSVG = function() {
    return !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
  };

  if (supportsSVG) {
    color = '#c4572a';
    color_1 = '#16bef2';
    initChart = function(selector, color, unit_space) {
      var addDataNames, addDataUnits, buildBarChart, cell_length, cell_val, convertedData, g_bars, g_xdata, g_ydata, i, j, metric_data, name_data, o_cells, row_length, svg_container, svg_doc, svg_table, viewbox_height, viewbox_width, x_gap, x_padding, x_region, x_units_height, x_width, y_max, y_min, y_padding, y_scale, y_units_width;
      viewbox_height = 520;
      viewbox_width = 1040;
      svg_container = document.getElementById(selector);
      svg_table = svg_container.getElementsByTagName('table')[0];
      row_length = svg_table.rows.length;
      name_data = [];
      metric_data = [];
      i = 0;
      while (i < row_length) {
        o_cells = svg_table.rows.item(i).cells;
        cell_length = o_cells.length;
        j = 0;
        while (j < cell_length) {
          cell_val = o_cells.item(j).innerHTML;
          if (i === 0) {
            name_data.push(cell_val);
          }
          if (i === 1) {
            metric_data.push(parseInt(cell_val));
          }
          j++;
        }
        i++;
      }
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
      convertedData = metric_data.map(function(x) {
        return viewbox_height - (x * y_scale);
      });
      buildBarChart = function(data, i) {
        var animate, bar, tween, x_axis, x_unit, y_axis, y_unit;
        y_unit = data * y_scale;
        y_axis = viewbox_height - y_unit;
        x_unit = i;
        x_axis = x_width * x_unit;
        bar = document.createElementNS('http://www.w3.org/2000/svg', "rect");
        bar.setAttributeNS(null, "width", x_gap);
        bar.setAttributeNS(null, "height", y_unit);
        bar.setAttribute('transform', 'translate(' + x_axis + ', ' + viewbox_height + ')');
        bar.setAttributeNS(null, "fill", color);
        tween = new TWEEN.Tween({
          top: viewbox_height,
          left: x_axis
        }).to({
          top: y_axis,
          left: x_axis
        }, 1000).easing(TWEEN.Easing.Circular.InOut).onUpdate(function() {
          return bar.setAttribute('transform', 'translate(' + this.left + ', ' + this.top + ')');
        });
        tween.start();
        animate = function() {
          requestAnimationFrame(animate);
          return TWEEN.update();
        };
        g_bars.appendChild(bar);
        return animate();
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
      svg_table.setAttribute("style", "display:none;");
      svg_container.setAttribute('class', 'svg-container');
      svg_doc = document.createElementNS('http://www.w3.org/2000/svg', "svg");
      svg_doc.setAttributeNS(null, "viewBox", '0 0 ' + viewbox_width + ' ' + viewbox_height);
      svg_doc.setAttributeNS(null, "preserveAspectRatio", 'xMidYMin meet');
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
      svg_doc.appendChild(g_bars);
      svg_doc.appendChild(g_ydata);
      svg_doc.appendChild(g_xdata);
      metric_data.forEach(buildBarChart);
      metric_data.forEach(addDataUnits);
      return name_data.forEach(addDataNames);
    };
    initChart('speed-data', color, 20);
    initChart('mass-data', color, 30);
    initChart('distance-data', color, 100);
  }

}).call(this);
