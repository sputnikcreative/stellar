(function() {
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
            cell_val = o_cells.item(j).childNodes[0].nodeValue;
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
        line.setAttributeNS(null, "stroke-width", 1);
        line.setAttributeNS(null, "stroke", "#666");
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
