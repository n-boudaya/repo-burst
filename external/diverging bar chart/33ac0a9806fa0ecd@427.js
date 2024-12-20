import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Diverging stacked bar chart</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Diverging stacked bar chart

This chart stacks negative categories to the left and positive categories to the right. Inspired by Robert Mann, the truthfulness of presidential candidates is assessed here by PolitiFact. For reasons to avoid this chart form, see [Rost & Aisch](https://blog.datawrapper.de/divergingbars/).`
)}

function _2(Swatches,chart){return(
Swatches(chart.scales.color)
)}

function _chart(data,d3)
{

  // Assign a valence to each category.
  const signs = new Map([].concat(
    data.negatives.map(d => [d, -1]),
    data.positives.map(d => [d, +1])
  ));

  // Compute the bias = sum of negative values for each candidate.
  const bias = d3.sort(
    d3.rollup(data, v => d3.sum(v, d => d.value * Math.min(0, signs.get(d.category))), d => d.name),
    ([, a]) => a
  );

  // Specify the chart’s dimensions, with a space of height 33px for each candidate.
  const width = 928;
  const marginTop = 40;
  const marginRight = 30;
  const marginBottom = 0;
  const marginLeft = 80;
  const height = bias.length * 33 + marginTop + marginBottom;

  // Prepare the stack; the values are stacked from the inside out, starting with more
  // moderate values (“mostly false”, “half true”), and ending with the extreme values.
  const series = d3.stack()
    .keys([].concat(data.negatives.slice().reverse(), data.positives))
    .value(([, value], category) => signs.get(category) * (value.get(category) || 0))
    .offset(d3.stackOffsetDiverging)
  (d3.rollup(data, data => d3.rollup(data, ([d]) => d.value, d => d.category), d => d.name));

  // Construct the scales.
  const x = d3.scaleLinear()
    .domain(d3.extent(series.flat(2)))
    .rangeRound([marginLeft, width - marginRight])

  const y = d3.scaleBand()
    .domain(bias.map(([name]) => name))
    .rangeRound([marginTop, height - marginBottom])
    .padding(2 / 33)

  const color = d3.scaleOrdinal()
    .domain([].concat(data.negatives, data.positives))
    .range(d3.schemeSpectral[data.negatives.length + data.positives.length])

  // A function to format a percentage, used both on the axis and in the tooltips.
  const formatValue = ((format) => (x) => format(Math.abs(x)))(d3.format(".0%"));

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Append a rect for each value, with a tooltip.
  svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d.map(v => Object.assign(v, {key: d.key})))
    .join("rect")
      .attr("x", d => x(d[0]))
      .attr("y", ({data: [name]}) => y(name))
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("height", y.bandwidth())
    .append("title")
      .text(({key, data: [name, value]}) => `${name}
${formatValue(value.get(key))} ${key}`);

  // Create the axes.
  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
    .call(d3.axisTop(x)
        .ticks(width / 80)
        .tickFormat(formatValue)
        .tickSizeOuter(0))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", x(0) + 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.positive))
    .call(g => g.append("text")
        .attr("x", x(0) - 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(data.negative));

  svg.append("g")
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .call(g => g.selectAll(".tick").data(bias).attr("transform", ([name, min]) => `translate(${x(min)},${y(name) + y.bandwidth() / 2})`))
    .call(g => g.select(".domain").attr("transform", `translate(${x(0)},0)`));

  // Return the color scale as a property of the node, for the legend.
  return Object.assign(svg.node(), {scales: {color}});
}


async function _data(d3,FileAttachment)
{
  const categories = {
    "pants-fire": "Pants on fire!",
    "false": "False",
    "mostly-false": "Mostly false",
    "barely-true": "Mostly false", // recategorized
    "half-true": "Half true",
    "mostly-true": "Mostly true",
    "true": "True"
  };

  const data = d3.csvParse(await FileAttachment("politifact.csv").text(), ({speaker: name, ruling: category, count: value}) => categories[category] ? {name, category: categories[category], value: +value} : null);

  // Normalize absolute values to percentage.
  d3.rollup(data, group => {
    const sum = d3.sum(group, d => d.value);
    for (const d of group) d.value /= sum;
  }, d => d.name);

  return Object.assign(data, {
    negative: "← More falsehoods",
    positive: "More truths →",
    negatives: ["Pants on fire!", "False", "Mostly false"],
    positives: ["Half true", "Mostly true", "True"]
  });
}


function _6(md){return(
md`See [Plot: Diverging stacked bars](https://observablehq.com/@observablehq/plot-diverging-stacked-bar) for a similar chart made with [Observable Plot](/plot/)’s concise API. `
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["politifact.csv", {url: new URL("./files/00677154fd47f6e479b42c7e5e95120a918d07c06cb2eee835a24e01a52d65c03afba70fbbe4c760f1bc41efec40d793f7b374c8b9bc86df5c1da482e33f0f78.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["Swatches","chart"], _2);
  main.variable(observer("chart")).define("chart", ["data","d3"], _chart);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  const child1 = runtime.module(define1);
  main.import("Swatches", child1);
  main.variable(observer()).define(["md"], _6);
  return main;
}
