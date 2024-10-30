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

  d3__namespace.csv("flare_depends.csv").then(function (data) {

    const svg = d3__namespace.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

    console.log(data);

    svg.node().appendChild(chord_dependency(data));

  });

  function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
  }

  function chord_dependency(data)
  {
    console.log(data);

    const width = 1080;
    const height = width;
    const innerRadius = Math.min(width, height) * 0.5 - 90;
    const outerRadius = innerRadius + 10;

    
    // Compute a dense matrix from the weighted links in data.
    const names = d3__namespace.sort(d3__namespace.union(data.map(d => d.source), data.map(d => d.target)));
    const index = new Map(names.map((name, i) => [name, i]));
    const matrix = Array.from(index, () => new Array(names.length).fill(0));
    for (const {source, target, value} of data) matrix[index.get(source)][index.get(target)] += value;

    console.log(matrix);

    const chord = d3__namespace.chordDirected()
        .padAngle(10 / innerRadius)
        .sortSubgroups(d3__namespace.descending)
        .sortChords(d3__namespace.descending);

    const arc = d3__namespace.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const ribbon = d3__namespace.ribbonArrow()
        .radius(innerRadius - 1)
        .padAngle(1 / innerRadius);

    const colors = d3__namespace.quantize(d3__namespace.interpolateRainbow, names.length);

    const svg = d3__namespace.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

    const chords = chord(matrix);

    const group = svg.append("g")
      .selectAll()
      .data(chords.groups)
      .join("g");

    group.append("path")
        .attr("fill", d => colors[d.index])
        .attr("d", arc);

    group.append("text")
        .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
        .attr("dy", "0.35em")
        .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text(d => names[d.index]);

    group.append("title")
        .text(d => `${names[d.index]}
${d3__namespace.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3__namespace.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

    svg.append("g")
        .attr("fill-opacity", 0.75)
      .selectAll()
      .data(chords)
      .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("fill", d => colors[d.target.index])
        .attr("d", ribbon)
      .append("title")
        .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`);

    console.log(svg.node());
    return svg.attr("viewBox", autoBox).node();
  }

})(d3);
//# sourceMappingURL=bundle.js.map
