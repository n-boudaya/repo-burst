import * as d3 from 'd3';


d3.json("hierarchy_2024-11-18-11-19-10.json").then(function (data) {

    const svg = d3.select("body").append("div").attr("id", "zoomableSunburstComponent").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

    svg.node().appendChild(zoomableSunburst(data, 3));
    // svg.node().appendChild(SunburstZoom(data));

});

// function autoBox() {
//     document.body.appendChild(this);
//     const {x, y, width, height} = this.getBBox();
//     document.body.removeChild(this);
//     return [x, y, width, height];
// }

function zoomableSunburst(data, startVisibleLevels) {
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
    const hierarchy = d3.hierarchy(data)
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

    const svg = d3.select("body").append("div").append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width]).attr("y", 100);

    const longArcPath = svg.append("g").attr("class", "group1");
    const shortArcPath = svg.append("g").attr("class", "group2");
    const label = svg.append("g")
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
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

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
        return svg.node();
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

    return svg.node();
}