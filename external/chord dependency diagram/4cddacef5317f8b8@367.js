function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Chord dependency diagram</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Chord dependency diagram

This [chord diagram](/@d3/chord-diagram/2) shows dependencies among a software class hierarchy. Although it does not reveal class-level detail, as [hierarchical edge bundling](/@d3/hierarchical-edge-bundling/2) does, it conveys the total number of imports between and within packages. Note, for example, that the *util* package does not import anything besides itself.`
)}

function _chart(d3,data)
{
  const width = 1080;
  const height = width;
  const innerRadius = Math.min(width, height) * 0.5 - 90;
  const outerRadius = innerRadius + 10;

  // Compute a dense matrix from the weighted links in data.
  const names = d3.sort(d3.union(data.map(d => d.source), data.map(d => d.target)));
  const index = new Map(names.map((name, i) => [name, i]));
  const matrix = Array.from(index, () => new Array(names.length).fill(0));
  for (const {source, target, value} of data) matrix[index.get(source)][index.get(target)] += value;

  const chord = d3.chordDirected()
      .padAngle(10 / innerRadius)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending);

  const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

  const ribbon = d3.ribbonArrow()
      .radius(innerRadius - 1)
      .padAngle(1 / innerRadius);

  const colors = d3.quantize(d3.interpolateRainbow, names.length);

  const svg = d3.create("svg")
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
${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

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

  return svg.node();
}


function _data(FileAttachment){return(
FileAttachment("flare-imports.csv").csv({typed: true})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["flare-imports.csv", {url: new URL("./files/bc3ae83fbfa3629f6d84f32ced165b4c09ebc4c4c8402bd365c0a8debc0bb6d1c9a94e42ca9cd955fc681f3347da7715a5be03ceb7cbace224260021f33f5d1a.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  return main;
}
