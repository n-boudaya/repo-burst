import * as d3 from 'd3';

d3.json("dependencies_2024-11-11-16-18-27.json").then(function (data) {

    const svg = d3.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

    svg.node().appendChild(computeMatrix(data));

});

// d3.csv("flare_depends.csv").then(function (data) {
//
//     const svg = d3.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);
//
//     svg.node().appendChild(chord_dependency(data));
//
// });

function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}

function computeMatrix(data){
    // console.log(data);

    const names = d3.sort(data.map(d=>d.path));
    // console.log(names);

    const index = new Map(names.map((name, i) => [name, i]));
    // console.log(index);

    const matrix = Array.from(index, () => new Array(names.length).fill(0));

    for(const d of data){
        const source = d.path;

        const onlyOutgoings = d3.map(d3.filter(d.outgoing, (d) => d.external === false), (d) => d.file);

        console.log(onlyOutgoings);

        for(const target of onlyOutgoings){
            matrix[index.get(source)][index.get(target)] += 1;
        }
    }

     console.log(matrix);

}


function chord_dependency(data)
{
    const width = 1080;
    const height = width;
    const innerRadius = Math.min(width, height) * 0.5 - 90;
    const outerRadius = innerRadius + 10;


    // // Compute a dense matrix from the weighted links in data.
    // const names = d3.sort(d3.union(data.map(d => d.source), data.map(d => d.target)));
    // console.log(names);
    //
    // const index = new Map(names.map((name, i) => [name, i]));
    // console.log(index);
    //
    // const matrix = Array.from(index, () => new Array(names.length).fill(0));
    // console.log(matrix);
    // for (const {source, target, value} of data) matrix[index.get(source)][index.get(target)] += value;
    // console.log(matrix);

    const chord = d3.chordDirected()
        .padAngle(10 / innerRadius)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const ribbon = d3.ribbonArrow()
        .radius(innerRadius - 1)
        // .sourceRadius(innerRadius -1)
        // .headRadius(innerRadius - 1)
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

    console.log(svg.node());
    // return svg.attr("viewBox", autoBox).node();
    return svg.node();
}
