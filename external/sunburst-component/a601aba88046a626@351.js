import define1 from "./7a9e12f9fb3d8e06@517.js";

function _1(md){return(
md`# Sunburst component

This radial space-filling visualization created by [John Stasko](https://www.cc.gatech.edu/gvu/ii/sunburst/) shows the cumulative values of subtrees. It is commonly used to visualize software packages (the size of source code within nested packages) and file systems (the size of files within nested folders). See also the [zoomable version](/@d3/zoomable-sunburst) and the [icicle diagram](/@d3/icicle?collection=@d3/charts).`
)}

function _chart(Sunburst,flare){return(
Sunburst(flare, {
  value: d => d.size, // size of each node (file); null for internal nodes (folders)
  label: d => d.name, // display name for each cell
  title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}\n${n.value.toLocaleString("en")}`, // hover text
  link: (d, n) => n.children
    ? `https://github.com/prefuse/Flare/tree/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}`
    : `https://github.com/prefuse/Flare/blob/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}.as`,
  width: 1152,
  height: 1152
})
)}

function _flare(FileAttachment){return(
FileAttachment("flare.json").json()
)}

function _4(howto){return(
howto("Sunburst", {alternatives: `[D3 sunburst example](/@d3/sunburst/2)`})
)}

function _Sunburst(d3){return(
function Sunburst(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
  path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
  id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
  parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
  children, // if hierarchical data, given a d in data, returns its children
  value, // given a node d, returns a quantitative value (for area encoding; null for count)
  sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
  label, // given a node d, returns the name to display on the rectangle
  title, // given a node d, returns its hover text
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links (if any)
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  margin = 1, // shorthand for margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  padding = 1, // separation between arcs
  startAngle = 0, // the starting angle for the sunburst
  endAngle = 2 * Math.PI, // the ending angle for the sunburst
  radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, // outer radius
  color = d3.interpolateRainbow, // color scheme, if any
  fill = "#ccc", // fill for arcs (if no color encoding)
  fillOpacity = 0.6, // fill opacity for arcs
} = {}) {

  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
  const root = path != null ? d3.stratify().path(path)(data)
      : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  // Compute the values of internal nodes by aggregating from the leaves.
  value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

  // Sort the leaves (typically by descending value for a pleasing layout).
  if (sort != null) root.sort(sort);

  // Compute the partition layout. Note polar coordinates: x is angle and y is radius.
  d3.partition().size([endAngle - startAngle, radius])(root);

  // Construct a color scale.
  if (color != null) {
    color = d3.scaleSequential([0, root.children.length], color).unknown(fill);
    root.children.forEach((child, i) => child.index = i);
  }

  // Construct an arc generator.
  const arc = d3.arc()
      .startAngle(d => d.x0 + startAngle)
      .endAngle(d => d.x1 + startAngle)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - padding);

  const svg = d3.create("svg")
      .attr("viewBox", [
        marginRight - marginLeft - width / 2,
        marginBottom - marginTop - height / 2,
        width,
        height
      ])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

  const cell = svg
    .selectAll("a")
    .data(root.descendants())
    .join("a")
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget);

  cell.append("path")
      .attr("d", arc)
      .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
      .attr("fill-opacity", fillOpacity);

  if (label != null) cell
    .filter(d => (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
    .append("text")
      .attr("transform", d => {
        if (!d.depth) return;
        const x = ((d.x0 + d.x1) / 2 + startAngle) * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.32em")
      .text(d => label(d.data, d));

  if (title != null) cell.append("title")
      .text(d => title(d.data, d));

  return svg.node();
}
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["flare.json", {url: new URL("./files/85b8f86120ba5c8012f55b82fb5af4fcc9ff5e3cf250d110e111b3ab98c32a3fa8f5c19f956e096fbf550c47d6895783a4edf72a9c474bef5782f879573750ba.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["Sunburst","flare"], _chart);
  main.variable(observer("flare")).define("flare", ["FileAttachment"], _flare);
  main.variable(observer()).define(["howto"], _4);
  main.variable(observer("Sunburst")).define("Sunburst", ["d3"], _Sunburst);
  const child1 = runtime.module(define1);
  main.import("howto", child1);
  return main;
}
