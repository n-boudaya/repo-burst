import * as d3 from 'd3';


d3.json("hierarchy_2024-11-18-11-19-10.json").then(function (data) {

    const svg = d3.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

    svg.node().appendChild(zoomableSunburst(data, 3));
    // svg.node().appendChild(SunburstZoom(data));

});

function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}

function zoomableSunburst(data, startVisibleLevels)
{
    // console.log(data);

    // Specify the chart’s dimensions.
    const width = 10000;
    const height = width;
    const radius = 500;
    const innerCircleRadius = 2000;
    const outerCircleWidth = 1000;

    let startLvl = 0;
    let stopLvl = startLvl + startVisibleLevels;

    let sliderStartLvl = startLvl;
    let sliderStopLvl = stopLvl;
    // let endLvl = visibleLevels;
    // const radius = 100;
    const levelPadding = 10;
    let visibleLevels = stopLvl-startLvl+1;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    let root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
    root.each(d => d.current = d);
    root.each(d=>d.hasChildren = hasChildren(d));
    // console.log(root);


    const maxLevel = d3.max(root.leaves(), (d) => d.y0);

    // console.log(maxLevel);

    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
        .padRadius(radius * 1.5)
        // .cornerRadius(100)
        .innerRadius(d => calculateRadius(d.y0, true))
        .outerRadius(d => calculateRadius(d.y0, false));
        // .innerRadius(d => ((visibleLevels - (d.y0-startLvl) +1) * radius)+offset)
        // .outerRadius(d => (((visibleLevels - (d.y0-startLvl) +2) * radius) - levelPadding)+offset);

    function calculateRadius(yValue, isInnerRadius){
        const result = ((visibleLevels - (yValue-startLvl) - 1) * (outerCircleWidth/visibleLevels))+innerCircleRadius;

        console.log("visibleLevels: "+visibleLevels+" d.y0: "+yValue+" startLvl: "+startLvl+" outerCircleWidth: "+outerCircleWidth+" innerCircleRadius: "+innerCircleRadius+ " result: "+result);

        if(isInnerRadius){
            return result;
        }
        else{
            return (((visibleLevels - (yValue-startLvl)) * (outerCircleWidth/visibleLevels)) - levelPadding)+innerCircleRadius;
        }
    }

    // // Create the arc generator.
    // const longArc = d3.arc()
    //     .startAngle(d => d.x0)
    //     .endAngle(d => d.x1)
    //     .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    //     .padRadius(radius * 1.5)
    //     .innerRadius(d => {
    //         console.log(d);
    //         if(d.hasChildren){
    //             return (visibleLevels - d.y0 +1) * radius;
    //         }
    //         else{
    //             return radius;
    //         }
    //         })
    //     // .innerRadius(d => d.y0 * radius)
    //     .outerRadius(d => ((visibleLevels - d.y0 +2) * radius) - levelPadding);
    //     // .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - levelPadding))

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width]).attr("y", 100);
        // .style("font", "10px sans-serif");

    d3.select("#applyLevels").on("click",callArcs);

    function callArcs(){
        if(sliderStartLvl===sliderStopLvl){
            startLvl = sliderStartLvl;
            stopLvl = sliderStartLvl;
        }
        else if(sliderStartLvl>sliderStopLvl){
            startLvl = sliderStopLvl;
            stopLvl = sliderStartLvl;
        }
        else{
            startLvl=sliderStartLvl;
            stopLvl=sliderStopLvl;
        }

        visibleLevels = stopLvl-startLvl+1;


        const da = root.descendants().slice(1).filter(d=>d.depth >= startLvl && d.depth <= stopLvl);

        const colorNumbers = da.filter(m=>m.depth==startLvl).length;
        console.log(visibleLevels);

        console.log(da);
        drawArcs(da);
    }

    d3.select("#startLevelInput").on("input",adjustStart);

    function adjustStart(event){
        console.log("Start Level Adjusted:" + event.target.value);

        sliderStartLvl = event.target.value;
    }

    d3.select("#stopLevelInput").on("input",adjustStop);

    function adjustStop(event){
        console.log("Stop Level Adjusted:" + event.target.value);

        sliderStopLvl = event.target.value;
    }


    function drawArcs(pData, numOfCol){
        // Append the arcs.
        svg.selectAll("path")
            // .data(root.descendants().slice(1).filter(d=>d.depth>=startLvl&&d.depth<=startLvl+visibleLevels-1))
            .data(pData)
            .join("path")
            // .attr("fill", d=>d3.interpolateTurbo(d.x0/(2 * Math.PI)))
            .attr("fill", d=>d3.interpolatePlasma(d.x0/(2 * Math.PI)))
            // .attr("fake",d=>console.log((visibleLevels - (d.y0-startLvl) +1) * radius))
            // .attr("fake",d=>d.x0/(2 * Math.PI))
            .attr("fill-opacity", d => d.children ? 1 : 0.2)
            // .attr("fill-opacity", "0.3")
            // .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => arc(d.current));

        // console.log(svg);
        // console.log(startLvl);
        return svg.node();
    }
    // const longArcPath = svg.append("g")
    //     .selectAll("path")
    //     .data(root.descendants().slice(1).filter(d=>!d.hasChildren))
    //     // .data(root.descendants().slice(1))
    //     .join("path")
    //     // .attr("fill", d =>
    //     // {
    //     //     if(!arcSmall(d)){
    //     //         while (d.depth > 1) d = d.parent;
    //     //         return color(d.data.name);
    //     //     }
    //     //     else{
    //     //         return "#f00";
    //     //     }
    //     //
    //     // })
    //     .attr("fill", "none")
    //     .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
    //     .attr('stroke', 'black')
    //     .attr('stroke-width', '5')
    //     .attr("stroke-opacity", d => arcVisible(d.current) ? 1 : 0)
    //     .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
    //     .attr("d", d => longArc(d.current));


    // console.log(root.descendants().slice(1));

    // Make them clickable if they have children.
    // path.filter(d => d.children)
    //     .style("cursor", "pointer")
    //     .on("click", clicked);
    //
    //
    // const format = d3.format(",d");
    // path.append("title")
    //     .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
    //
    // const label = svg.append("g")
    //     .attr("pointer-events", "none")
    //     .attr("text-anchor", "middle")
    //     .style("user-select", "none")
    //     .selectAll("text")
    //     .data(root.descendants().slice(1))
    //     // .data(root.descendants())
    //     .join("text")
    //     .attr("dy", "0.35em")
    //     .attr("font-size", d=>(radius)/d.data.name.toString().length)
    //     .attr("font-family", "monospace")
    //     // .attr("dy", "10.00em")
    //     .attr("fill-opacity", d => +labelVisible(d.current))
    //     .attr("transform", d => labelTransform(d.current))
    //     .text(d => d.data.name);
    //
    // const parent = svg.append("circle")
    //     .datum(root)
    //     // .attr("fake", d=> console.log(d))
    //     .attr("r", radius)
    //     .attr("fill", "none")
    //     .attr("pointer-events", "all")
    //     .on("click", clicked);
    //
    //
    function hasChildren(d){
        if(typeof d.data.children !== "undefined"){
            if(d.data.children.length === 0){
                return false;
            }
            else{
                return true;
            }
        }
        else{
            return false;
        }
    }

    // // Handle zoom on click.
    // function clicked(event, p) {
    //     // console.log(p);
    //     // console.log(event);
    //
    //     //https://stackoverflow.com/a/69036892
    //     if (event.ctrlKey) {
    //         d3.select(this).attr('stroke', 'black').attr('stroke-width', '5');
    //     } else {
    //
    //         startLvl = p.depth;
    //         parent.datum(p.parent || root);
    //
    //         root.each(d => d.target = {
    //             x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
    //             x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
    //             y0: Math.max(0, d.y0 - p.depth),
    //             y1: Math.max(0, d.y1 - p.depth),
    //             hasChildren: d.hasChildren,
    //             name: d.data.name
    //         });
    //
    //         const t = svg.transition().duration(1);
    //
    //         path.data(root.descendants().slice(1).filter(d=>d.depth>=startLvl&&d.depth<=startLvl+visibleLevels-1));
    //
    //         // Transition the data on all arcs, even the ones that aren’t visible,
    //         // so that if this transition is interrupted, entering arcs will start
    //         // the next transition from the desired position.
    //         path.transition(t)
    //             .tween("data", d => {
    //                 const i = d3.interpolate(d.current, d.target);
    //                 return t => d.current = i(t);
    //             })
    //             .filter(function (d) {
    //                 return +this.getAttribute("fill-opacity") || arcVisible(d.target);
    //             })
    //             .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
    //             .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
    //             .attrTween("d", d => () => arc(d.current));
    //
    //         label.filter(function (d) {
    //             return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    //         }).transition(t)
    //             .attr("fill-opacity", d => +labelVisible(d.target))
    //             .attrTween("transform", d => () => labelTransform(d.current));
    //     }
    // }

    function arcVisible(d) {
        return d.y1 <= visibleLevels+1 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= visibleLevels+1 && d.y0 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function arcSmall(d){
        return ((d.x1-d.x0)<0.005);
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (visibleLevels - d.y0 +1.5) * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    // function resetBorders(){
    //     console.log("RESET");
    //     // d3.selectAll("path").filter(function(){
    //     //     return d3.select(this).attr("stroke-width") === "5";
    //     // });
    //
    //     console.log(d3.hierarchy(data).find(d=>d.data.path === "J:\\repo-burst\\data_and_processing\\raw_data\\svelte-main\\packages"));
    //
    //     const newHierarchy = d3.hierarchy(data);
    //     newHierarchy.find(d=>d.data.path === "J:\\repo-burst\\data_and_processing\\raw_data\\svelte-main\\packages").children = null;
    //     // const foundPackages = newHierarchy.find(d=>d.data.path === "J:\\repo-burst\\data_and_processing\\raw_data\\svelte-main\\packages").children = null;
    //     // foundPackages.children = null;
    //     console.log(newHierarchy.find(d=>d.data.path === "J:\\repo-burst\\data_and_processing\\raw_data\\svelte-main\\packages"));
    //
    //     root = d3.partition()
    //         .size([2 * Math.PI, hierarchy.height + 1])
    //         (hierarchy);
    //     root.each(d => d.current = d);
    //     console.log(root);
    //
    //     update(root);
    //
    // }
    //
    // function slider(event){
    //     console.log(event.target.value);
    //
    //     currVisibleLevels = event.target.value;
    // }
    //
    // d3.select("#resetbutton").on("click",resetBorders);
    //
    // d3.select("#visibleLevels").on("input",slider);

    return svg.node();
}