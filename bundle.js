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

    d3__namespace.json("hierarchy_2024-11-18-11-19-10.json").then(function (data) {

        const svg = d3__namespace.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

        svg.node().appendChild(zoomableSunburst(data, 3));
        // svg.node().appendChild(SunburstZoom(data));

    });

    // function autoBox() {
    //     document.body.appendChild(this);
    //     const {x, y, width, height} = this.getBBox();
    //     document.body.removeChild(this);
    //     return [x, y, width, height];
    // }

    function zoomableSunburst(data, startVisibleLevels)
    {
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
        // let endLvl = visibleLevels;
        // const radius = 100;
        const levelPadding = 10;
        let visibleLevels = stopLvl-startLvl+1;

        // Compute the layout.
        const hierarchy = d3__namespace.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        let root = d3__namespace.partition()
            .size([2 * Math.PI, hierarchy.height + 1])
            (hierarchy);
        root.each(d => d.current = d);
        root.each(d=>d.hasChildren = hasChildren(d));
        // console.log(root);


        // const maxLevel = d3.max(root.leaves(), (d) => d.y0);

        // console.log(maxLevel);

        // Create the arc generator.
        const arc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
            .padRadius(radius * 1.5)
            // .cornerRadius(100)
            .innerRadius(d => calculateRadius(d.y0, true, levelPadding))
            .outerRadius(d => calculateRadius(d.y0, false, levelPadding));
            // .innerRadius(d => ((visibleLevels - (d.y0-startLvl) +1) * radius)+offset)
            // .outerRadius(d => (((visibleLevels - (d.y0-startLvl) +2) * radius) - levelPadding)+offset);

        function calculateRadius(yValue, isInnerRadius, padding){
            const result = ((visibleLevels - (yValue-startLvl) - 1) * (outerCircleWidth/visibleLevels))+innerCircleRadius;

            // console.log("visibleLevels: "+visibleLevels+" d.y0: "+yValue+" startLvl: "+startLvl+" outerCircleWidth: "+outerCircleWidth+" innerCircleRadius: "+innerCircleRadius+ " result: "+result);

            if(isInnerRadius){
                return result;
            }
            else {
                return (((visibleLevels - (yValue-startLvl)) * (outerCircleWidth/visibleLevels)) - padding)+innerCircleRadius;
            }
        }

        const longArc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
            .padRadius(radius * 1.5)
            .innerRadius(innerCircleRadius)
            // .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.min((calculateRadius(d.y0+1, false, 0)),innerCircleRadius+outerCircleWidth-levelPadding));
            // .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - levelPadding))



        d3__namespace.select("#applyLevels").on("click",callArcs);

        function callArcs(){
            if(sliderStartLvl===sliderStopLvl){
                startLvl = sliderStartLvl;
                stopLvl = sliderStartLvl;
            }
            else if(sliderStartLvl>sliderStopLvl){
                startLvl = sliderStopLvl;
                stopLvl = sliderStartLvl;
            }
            else {
                startLvl=sliderStartLvl;
                stopLvl=sliderStopLvl;
            }

            visibleLevels = stopLvl-startLvl+1;


            // const da = root.descendants().slice(1).filter(d=>d.depth >= startLvl && d.depth <= stopLvl);
            const shortArcData = root.descendants().slice(1).filter(d=>d.depth <= stopLvl && d.depth >= startLvl);
            const longArcData = root.descendants().slice(1).filter(d=>(d.depth <= stopLvl)&&!d.children);
            // console.log(visibleLevels);

            // console.log(shortArcData);
            // console.log(longArcData);
            drawArcs(shortArcData,longArcData);
        }

        d3__namespace.select("#startLevelInput").on("input",adjustStart);

        function adjustStart(event){
            // console.log("Start Level Adjusted:" + event.target.value);

            sliderStartLvl = event.target.value;
        }

        d3__namespace.select("#stopLevelInput").on("input",adjustStop);

        function adjustStop(event){
            // console.log("Stop Level Adjusted:" + event.target.value);

            sliderStopLvl = event.target.value;
        }

        const svg = d3__namespace.select('#graph').append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, width]).attr("y", 100);

        const longArcPath = svg.append("g").attr("class", "group1");
        const shortArcPath = svg.append("g").attr("class", "group2");


        function drawArcs(shortData, longData){
            longArcPath.selectAll("path")
                .data(longData, function(d) {return d;})
                .join("path")
                .attr("fill", "black")
                .attr("fill-opacity", 0.05)
                // .attr('stroke', 'black')
                // .attr('stroke-width', '1')
                // .attr("stroke-opacity", 0.2)
                // .attr("fake",d=>console.log(d))
                .attr("d", d => longArc(d.current));


            // Append the arcs.
            shortArcPath.selectAll("path")
                .data(shortData, function(d) {return d;})
                .join("path")
                // .attr("fill", d=>d3.interpolateTurbo(d.x0/(2 * Math.PI)))
                .attr("fill", d=>d3__namespace.interpolateWarm(d.x0/(2 * Math.PI)))
                // .attr("fake",d=>console.log((visibleLevels - (d.y0-startLvl) +1) * radius))
                // .attr("fake",d=>d.x0/(2 * Math.PI))
                .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 1 : 0.3) : 0.1)
                // .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
                .attr("d", d => arc(d.current));
                // .attr("path", d=>d.data.path);

            // path.filter(d => d.children)
            //     .style("cursor", "pointer")
            //     .on("click", clicked);

            // longArcPath.raise();
            console.log(svg);
            console.log(startLvl);
            return svg.node();
        }

        let searchText = "";

        d3__namespace.select("#fileSearchText").on("input",changeFileSearchText);

        function changeFileSearchText(){
            // console.log(event.target.value);

            searchText = event.target.value;
        }

        d3__namespace.select("#fileSearchButton").on("click",fileSearch);

        function fileSearch(){

            shortArcPath.selectAll("path").filter(function(d) {
                return d.data.path.startsWith(searchText);
            })
                .sort((a,b)=>a.depth - b.depth)
                .attr("fill", (d,i)=>{
                    if(i===0){
                        return "black";
                    }
                    else {
                        return "red";
                    }
                });

        }

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
                else {
                    return true;
                }
            }
            else {
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
            // return d.y1 <= visibleLevels+1 && d.y0 >= 1 && d.x1 > d.x0;

            return d.depth >= startLvl && d.depth <= stopLvl;
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

})(d3);
//# sourceMappingURL=bundle.js.map
