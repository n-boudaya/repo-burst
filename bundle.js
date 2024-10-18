(function (d3) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var d3__namespace = /*#__PURE__*/_interopNamespaceDefault(d3);

  d3__namespace.json("flare-2.json").then(function (flare) {
    const chart = Sunburst2(flare);
    console.log(chart);
    const output = d3__namespace.select('body').append('svg').append('chart');
    console.log(output);
  });

  console.log("aeiou");

  function Sunburst2(data){
      // Specify the chart’s colors and approximate radius (it will be adjusted at the end).
      const color = d3__namespace.scaleOrdinal(d3__namespace.quantize(d3__namespace.interpolateRainbow, data.children.length + 1));
      const radius = 928 / 2;
    
      // Prepare the layout.
      const partition = data => d3__namespace.partition()
        .size([2 * Math.PI, radius])
      (d3__namespace.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
    
      const arc = d3__namespace.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius / 2)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - 1);
    
      const root = partition(data);
    
      // Create the SVG container.
      const svg = d3__namespace.create("svg");
    
      // Add an arc for each element, with a title for tooltips.
      const format = d3__namespace.format(",d");
      svg.append("g")
          .attr("fill-opacity", 0.6)
        .selectAll("path")
        .data(root.descendants().filter(d => d.depth))
        .join("path")
          .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
          .attr("d", arc)
        .append("title")
          .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
    
      // Add a label for each element.
      svg.append("g")
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .attr("font-family", "sans-serif")
        .selectAll("text")
        .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
        .join("text")
          .attr("transform", function(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
          })
          .attr("dy", "0.35em")
          .text(d => d.data.name);
      
      return svg.node(); 
  }

})(d3);
//# sourceMappingURL=bundle.js.map
