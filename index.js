import * as d3 from 'd3';


const sunburstSVG = d3
    .select("body")
    .append("div")
    .attr("id", "zoomableSunburstComponent")
    .append("svg")
    .attr('width', window.innerHeight)
    .attr('height', window.innerHeight)
    .attr("scale", 0.1);

// let testData;


//https://stackoverflow.com/a/51113326
Promise.all([
    d3.json("hierarchy_2024-11-18-11-19-10.json"),
    d3.json("dependencies_2024-11-18-11-19-10.json"),
]).then(function(files) {
    sunburstSVG.node().appendChild(zoomableSunburst(files[0], files[1], 3));
    chordSVG.node().appendChild(chord_dependency(files[1], 4));
    // console.log(files[1])
}).catch(function(err) {
    console.log(err);
});

const chordSVG = d3
    .select("body")
    .append("div")
    .attr("id", "chordComponent")
    .append("svg")
    .attr('width', window.innerHeight)
    .attr('height', window.innerHeight)
    .attr("transform","translate(2000 0 0)");

function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}
//
// d3.json("hierarchy_2024-11-18-11-19-10.json").then(function (data) {
//
// // testData = data;
//
//     svg.node().appendChild(zoomableSunburst(data, 3));
//     // svg.node().appendChild(SunburstZoom(data));
//
// });
//
// svg.node().appendChild(zoomableSunburst(data, 3));

function zoomableSunburst(hierarchyData, dependencyData, startVisibleLevels) {
    // console.log(data);

    // Specify the chart’s dimensions.
    const width = 10000;
    const height = width;
    const radius = 500;
    const innerCircleRadius = 2000;
    const outerCircleWidth = 2000;

    let startLvl = 0;
    let stopLvl = startLvl + startVisibleLevels;

    let sliderStartLvl = startLvl;
    let sliderStopLvl = stopLvl;

    const levelPadding = 10;
    let visibleLevels = stopLvl - startLvl + 1;

    // Compute the layout.
    const hierarchy = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    let root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
    root.each(d => d.current = d);
    root.each(d => d.hasChildren = hasChildren(d));
    // console.log(root);

    // console.log(maxLevel);

    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
        .padRadius(radius * 1.5)
        .innerRadius(d => calculateRadius(d.y0, true, levelPadding))
        .outerRadius(d => calculateRadius(d.y0, false, levelPadding));

    function calculateRadius(yValue, isInnerRadius, padding) {
        const result = ((visibleLevels - (yValue - startLvl) - 1) * (outerCircleWidth / visibleLevels)) + innerCircleRadius;

        // console.log(
        //     "visibleLevels: "+visibleLevels+
        //     " d.y0: "+yValue+
        //     " startLvl: "+startLvl+
        //     " outerCircleWidth: "+outerCircleWidth+
        //     " innerCircleRadius: "+innerCircleRadius+
        //     " result: "+result);
        //
        // console.log(
        //     " (yValue-startLvl): "+(yValue-startLvl)+
        // " (outerCircleWidth/visibleLevels): "+(outerCircleWidth/visibleLevels)+
        // " (visibleLevels - (yValue-startLvl) - 1): "+(visibleLevels - (yValue-startLvl) - 1)+
        // "  ((visibleLevels - (yValue-startLvl) - 1) * (outerCircleWidth/visibleLevels)): "+ ((visibleLevels - (yValue-startLvl) - 1) * (outerCircleWidth/visibleLevels))
        // );


        if (isInnerRadius) {
            return result;
        } else {
            return (((visibleLevels - (yValue - startLvl)) * (outerCircleWidth / visibleLevels)) - padding) + innerCircleRadius;
        }
    }

    const longArc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
        .padRadius(radius * 1.5)
        .innerRadius(innerCircleRadius)
        .outerRadius(d => Math.min((calculateRadius(d.y0 + 1, false, 0)), innerCircleRadius + outerCircleWidth - levelPadding));


    d3.select("#applyLevels").on("click", callArcs);

    function callArcs() {
        root.each(d => d.current = d);

        if (sliderStartLvl > sliderStopLvl) {
            startLvl = sliderStopLvl;
            stopLvl = sliderStartLvl;
        } else {
            startLvl = sliderStartLvl;
            stopLvl = sliderStopLvl;
        }

        visibleLevels = stopLvl - startLvl + 1;

        const shortArcData = root.descendants().slice(1).filter(d => d.y0 <= stopLvl);
        const longArcData = root.descendants().slice(1).filter(d => (d.y0 <= stopLvl) && !d.children);
        // console.log(visibleLevels);

        // console.log(shortArcData);
        // console.log(longArcData);
        drawArcs(shortArcData, longArcData, true);
    }

    d3.select("#startLevelInput").on("change", adjustStart);

    function adjustStart(event) {
        console.log("Start Level Adjusted:" + event.target.value);

        sliderStartLvl = event.target.value;
    }

    d3.select("#stopLevelInput").on("change", adjustStop);

    function adjustStop(event) {
        console.log("Stop Level Adjusted:" + event.target.value);

        sliderStopLvl = event.target.value;
    }

    const internalSvg = d3
        .select("body")
        .append("div")
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width]).attr("y", 100);

    const longArcPath = internalSvg.append("g").attr("class", "group1");
    const shortArcPath = internalSvg.append("g").attr("class", "group2");
    const label = internalSvg.append("g")
        .attr("class", "group3")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none");


    const format = d3.format(",d");


    function drawArcs(shortData, longData, isOriginal) {

        // console.log(longData);
        // console.log(isOriginal);

        longArcPath.selectAll("path")
            .data(longData, function (d) {
                return d;
            })
            .join("path")
            .attr("fill", "black")
            .attr("fill-opacity", 0.05)
            .attr("d", d => longArc(d.current));


        // Append the arcs.
        shortArcPath.selectAll("path")
            .data(shortData, function (d) {
                return d;
            })
            .join("path")
            .attr("fill", d => d3.interpolateWarm(d.x0 / (2 * Math.PI)))
            .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 1 : 0.3) : 0.1)
            .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => arc(d.current))
            .append("title")
            .text(d => `
            ${d.ancestors().map(d => d.data.name).reverse().join("/")}\n
            ${format(d.value)}\n
            Depth: ${d.depth}
            `);


        // console.log(shortArcPath);

        shortArcPath.selectAll("path").filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

        longArcPath.selectAll("path").attr("fill", "red").attr("fill-opacity", "1.0");
        shortArcPath.selectAll("path").filter(d => d.current.y0 == stopLvl).attr("fill", "red").attr("fill-opacity", "1.0").attr("fake", d => console.log(d));

        label
            .selectAll("text")
            .data(shortData.filter(d => labelVisible(d.current)))
            .join("text")
            .attr("dy", "0.35em")
            .attr("font-size", d => (outerCircleWidth / visibleLevels) / d.data.name.toString().length)
            .attr("font-family", "monospace")
            // .attr("dy", "10.00em")
            // .attr("fill-opacity", d=>labelVisible(d.current)?"1":"0")
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

        // console.log(svg);
        // console.log(startLvl);

        return internalSvg.node();
    }

    let searchText = "";

    d3.select("#fileSearchText").on("input", changeFileSearchText);

    function changeFileSearchText() {
        // console.log(event.target.value);

        searchText = event.target.value;
    }

    d3.select("#fileSearchButton").on("click", fileSearch);

    function fileSearch() {

        shortArcPath.selectAll("path").filter(function (d) {
            return d.data.path.startsWith(searchText);
        })
            .sort((a, b) => a.depth - b.depth)
            .attr("fill", (d, i) => {
                if (i === 0) {
                    return "black";
                } else {
                    return "red";
                }
            });

    }

    // const parent = svg.append("circle")
    //     .datum(root)
    //     // .attr("fake", d=> console.log(d))
    //     .attr("r", radius)
    //     .attr("fill", "none")
    //     .attr("pointer-events", "all")
    //     .on("click", clicked);


    function hasChildren(d) {
        if (typeof d.data.children !== "undefined") {
            if (d.data.children.length === 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    const testButton = d3.select("#ui").append("button").attr("id", "testButton").html("Test Button").on("click", testFunction);

    function testFunction() {
        console.log("Button clicked!");
    }

    // Handle zoom on click.
    function clicked(event, p) {
        console.log(p);
        console.log(event);

        startLvl = p.depth;
        stopLvl = startLvl + 1;

        visibleLevels = stopLvl - startLvl + 1;
        // parent.datum(p.parent || root);

        root.each(d => d.current = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            // y0: Math.max(0, d.y0 - p.depth),
            // y1: Math.max(0, d.y1 - p.depth),
            y0: d.y0,
            y1: d.y1
            // hasChildren: d.hasChildren,
            // name: d.data.name
        });

        const shortArcData = root.descendants().slice(1).filter(d => d.current.y0 <= stopLvl);
        const longArcData = root.descendants().slice(1).filter(d => (d.current.y0 <= stopLvl) && !d.children);

        console.log(startLvl);
        console.log(stopLvl);
        console.log(shortArcData.map(d => d.current));

        drawArcs(shortArcData, longArcData, false);

    }

    function arcVisible(d) {
        // return d.y1 <= visibleLevels+1 && d.y0 >= 1 && d.x1 > d.x0;

        return d.y0 >= startLvl && d.y0 <= stopLvl;
    }

    function labelVisible(d) {
        return d.y0 >= startLvl && d.y0 <= stopLvl && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = ((visibleLevels - (d.y0 - startLvl) - 0.5) * (outerCircleWidth / visibleLevels)) + innerCircleRadius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    return internalSvg.node();
}


function chord_dependency(data, level) {
    const chordWidth = 10000;
    const chordHeight = 10000;
    const chordInnerRadius = Math.min(chordWidth, chordHeight) * 0.5 - 90;
    const chordOuterRadius = chordInnerRadius + 100;

    const chord = d3.chordDirected()
        .padAngle(10 / chordInnerRadius)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    const arc = d3.arc()
        .padAngle(1 / chordInnerRadius)
        .innerRadius(chordInnerRadius)
        .outerRadius(chordOuterRadius);

    const ribbon = d3.ribbonArrow()
        .radius(chordInnerRadius - 1)
        // .sourceRadius(innerRadius -1)
        // .headRadius(innerRadius - 1)
        .padAngle(1 / chordInnerRadius)
        .headRadius(chordInnerRadius / 10);

    const internalSvg = d3
        .select("body")
        .append("div")
        .append("svg")
        .attr("width", chordWidth)
        .attr("height", chordHeight)
        // .attr("viewBox", [-chordWidth / 2, -chordHeight / 2, chordWidth, chordHeight])
        .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");
    // .attr("transform", "scale(0.1 0.1)");

    internalSvg.attr("transform","scale(0.1 0.1)");

    const groupArcs = internalSvg.append("g").attr("class", "donutGroups");
    const chordObject = internalSvg.append("g").attr("class", "chords");

    function chordTransform(pChords) {
        // pChords.groups.forEach(e=>{
        //     e.endAngle = e.startAngle * 1.1;
        // })
        console.log(pChords);
        pChords.forEach(e => e.source.path = names[e.source.index])

        return pChords;
    }

    calculateData();

    const testSlider = d3.select("#ui")
        .append("input")
        .attr("type", "range")
        .attr("id", "levelSliderChords")
        .attr("value", level)
        .attr("min", "1")
        .attr("max", "10")
        .attr("step", "1")
        .on("change", redraw);

    function redraw() {
        console.log(event.target.value);

        level = Math.round(event.target.value);

        calculateData();

    }

    function calculateData() {

        // let filteredData;
        // let allDepends;
        // let uniqueFiles;
        // let names;
        // let index;
        // let colors;
        // let matrix;
        // let chords;


        const filteredData = data.filter(d => ((d.dirLevel <= level && d.isDirectory === false) || (d.dirLevel === level && d.isDirectory === true)) && d.outgoing.length > 0);
        // console.log(filteredData);

        const allDepends = [];
        for (const d of filteredData) {
            const source = d.path;

            for (const target of d.outgoing) {


                if (d.isDirectory === true) {
                    allDepends.push([source, target.path, target.value]);
                } else {
                    allDepends.push([source, target, 1]);
                }

            }
        }

        // console.log(allDepends);

        // const newData = d3.rollup(allDepends,(D)=>D.length, (d)=>d[0], (d)=>d[1]);

        // console.log(newData);

        const uniqueFiles = new Set;
        // data.map(d => cutoff(d.path, level)).forEach(e => uniqueFiles.add(e));
        filteredData.map(d => d.path).forEach(e => uniqueFiles.add(e));

        // console.log(uniqueFiles);

        const names = d3.sort(uniqueFiles);

        const index = new Map(names.map((name, i) => [name, i]));
        // console.log(index);


        const matrix = Array.from(index, () => new Array(names.length).fill(0));
        // console.log(matrix);

        // let numberOfConnects = 0;
        // for(const n of names){
        //     const nIndex = index.get(n)
        //
        //     for(const e of names){
        //         const eIndex = index.get(e);
        //
        //         if(typeof newData.get(n) !== "undefined"){
        //             if(typeof newData.get(n).get(e) !== "undefined"){
        //                 matrix[nIndex][eIndex] = newData.get(n).get(e);
        //                 console.log("From: "+n+" To: "+e+" Value: "+newData.get(n).get(e));
        //             }
        //
        //         }
        //     }
        // }

        for (const e of allDepends) {
            matrix[index.get(e[0])][index.get(e[1])] += e[2];
        }

        // console.log(matrix);
        // console.log(numberOfConnects);

        // names = sharedStart(names);


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

        const chords = chord(matrix);
        const colors = d3.quantize(d3.interpolateSinebow, names.length);


        displayGraph(chords, chords, colors, names, filteredData)
    }


    function displayGraph(pData, chords, colors, names, filteredData) {
        console.log(pData);

        groupArcs.selectAll("path")
            // .data(chords.groups)
            .data(pData.groups, function (d) {
                return d;
            })
            .join("path")
            .attr("fill", d => colors[d.index]) //outercircle
            .attr("d", arc)
            .append("title")
            .text(d => `${names[d.index]}
${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

        // group.append("text")
        //     .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
        //     .attr("dy", "0.35em")
        //     .attr("transform", d => `
        //     rotate(${(d.angle * 180 / Math.PI - 90)})
        //     translate(${chordOuterRadius + 5})
        //     ${d.angle > Math.PI ? "rotate(180)" : ""}
        //   `)
        //     .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        //     .text(d => names[d.index]);

        chordObject
            .attr("fill-opacity", 0.75)
            .selectAll("path")
            .data(pData, function (d) {
                return d;
            })
            // .data(chords)
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("fill", d => colors[d.target.index]) //ribbons
            .attr("d", ribbon)
            // .attr("fake", d => console.log(d))
            .append("title")
            .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`);

        // return internalSvg.node();
    }
    return internalSvg.attr("viewBox", autoBox).node();
}