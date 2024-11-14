import * as d3 from 'd3';

d3.json("dependencies_2024-11-14-14-57-34.json").then(function (data) {

    const svg = d3.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

    svg.node().appendChild(chord_dependency(data, 10));
    // computeMatrix(data, 8);
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

function computeMatrix(data, level){
    // console.log(data);

    var allDepends = [];
    for(const d of data){
        const source = d.path;

        for(const target of d.outgoing){
            allDepends.push([source,target]);
        }
    }

    const newData = d3.rollup(allDepends,(D)=>D.length, (d)=>cutoff(d[0],level), (d)=>cutoff(d[1],level));

    console.log(newData);

    const uniqueFiles = new Set;
    data.map(d => cutoff(d.path, level)).forEach(e => uniqueFiles.add(e));
    console.log(uniqueFiles);

    const names = d3.sort(uniqueFiles);

    const index = new Map(names.map((name, i) => [name, i]));
    console.log(index);


    const matrix = Array.from(index, () => new Array(names.length).fill(0));
    // console.log(matrix);

    let numberOfConnects = 0;
    for(const n of names){
        const nIndex = index.get(n)

        for(const e of names){
            const eIndex = index.get(e);

            if(typeof newData.get(n) !== "undefined"){
                if(typeof newData.get(n).get(e) !== "undefined"){
                    matrix[nIndex][eIndex] = newData.get(n).get(e);
                    console.log("From: "+n+" To: "+e+" Value: "+newData.get(n).get(e));
                }

            }
        }
    }

     console.log(matrix);
    console.log(numberOfConnects);

}



 function cutoff(path, level){
    const pathArr = path.split("\\");

    const shortened = pathArr.slice(0,level);

    const output = shortened.join("\\");

    // console.log(output);

    // console.log("Path: "+path+" Path level: "+pathArr.length+" Level: "+level+" Output: "+output);

    return output;
}

function chord_dependency(data, level)
{
    const width = 1080;
    const height = width;
    const innerRadius = Math.min(width, height) * 0.5 - 90;
    const outerRadius = innerRadius + 10;

    var allDepends = [];
    for(const d of data){
        const source = d.path;

        for(const target of d.outgoing){
            allDepends.push([source,target]);
        }
    }

    const newData = d3.rollup(allDepends,(D)=>D.length, (d)=>cutoff(d[0],level), (d)=>cutoff(d[1],level));

    console.log(newData);

    const uniqueFiles = new Set;
    data.map(d => cutoff(d.path, level)).forEach(e => uniqueFiles.add(e));
    console.log(uniqueFiles);

    const names = d3.sort(uniqueFiles);

    const index = new Map(names.map((name, i) => [name, i]));
    console.log(index);


    const matrix = Array.from(index, () => new Array(names.length).fill(0));
    // console.log(matrix);

    let numberOfConnects = 0;
    for(const n of names){
        const nIndex = index.get(n)

        for(const e of names){
            const eIndex = index.get(e);

            if(typeof newData.get(n) !== "undefined"){
                if(typeof newData.get(n).get(e) !== "undefined"){
                    matrix[nIndex][eIndex] = newData.get(n).get(e);
                    console.log("From: "+n+" To: "+e+" Value: "+newData.get(n).get(e));
                }

            }
        }
    }

    console.log(matrix);
    console.log(numberOfConnects);


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
