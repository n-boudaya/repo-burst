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

    const sunburstSVG = d3__namespace
        .select("body")
        .append("div")
        .attr("id", "zoomableSunburstComponent")
        .append("svg")
        .attr('width', window.innerHeight)
        .attr('height', window.innerHeight);

    d3__namespace
        .select("body")
        .append("div")
        .attr("id", "chordComponent")
        .append("svg")
        .attr('width', window.innerHeight)
        .attr('height', window.innerHeight);

    //https://stackoverflow.com/a/51113326
    Promise.all([
        d3__namespace.json("hierarchy_2024-11-18-11-19-10.json"),
        d3__namespace.json("dependencies_2024-12-14-11-54-30.json"),
    ]).then(function(files) {
        sunburstSVG.node().appendChild(zoomableSunburst(files[0], files[1], 3));
        // chordSVG.node().appendChild(chord_dependency(files[1], 4));
    }).catch(function(err) {
        console.log(err);
    });

    // function autoBox() {
    //     document.body.appendChild(this);
    //     const {x, y, width, height} = this.getBBox();
    //     document.body.removeChild(this);
    //     return [x, y, width, height];
    // }

    function zoomableSunburst(hierarchyData, dependencyData, startVisibleLevels) {
        // console.log(data);

        // Specify the chart’s dimensions.
        const sunburstSize = 8000;
        const radius = 500;
        const innerCircleRadius = 2000;
        const outerCircleWidth = 2000;

        let startLvl = 0;
        let stopLvl = startLvl + startVisibleLevels;

        let sliderStartLvl = startLvl;
        let sliderStopLvl = stopLvl;

        const levelPadding = 10;
        let visibleLevels = stopLvl - startLvl + 1;

        let hierarchy;
        let root;


        // Converts the input json data to a hierarchical data structure.
        // Then calculates a partition layout out of that.
        // The coordinates of that partition layout can directly be converted to the measurements of elements in the sunburst.
        // Each element in the partition layout has the coordinates x0, x1, y0, y1
        // The x coordinates contain the starting and end angles for elements in the partition, the y coordinates contain the hierarchy levels of the related file.
        function calculateSunburstData(hierarchyData){
            hierarchy = d3__namespace.hierarchy(hierarchyData)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);
            root = d3__namespace.partition()
                .size([2 * Math.PI, hierarchy.height + 1])
                (hierarchy);
            root.each(d => d.current = d);
            root.each(d => d.hasChildren = hasChildren(d));
        }

        calculateSunburstData(hierarchyData);

        // Create the arc generator for the normal files and folders of the sunburst.
        // Is used to convert each element of the partition layout to an arc in the sunburst.
        const sunburstArc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            // padAngle needs to scale in reference to the size of the element.
            // If this wasn't done, very small elements would completely disappear.
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
            .padRadius(radius * 1.5)
            .innerRadius(d => calculateRadius(d.y0, true, levelPadding))
            .outerRadius(d => calculateRadius(d.y0, false, levelPadding));

        // Create the arc generator for the elongated elements that connect leafs of the hierarchy that are above the innermost hierarchy level to the chord diagram.
        const longArc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
            .padRadius(radius * 1.5)
            .innerRadius(innerCircleRadius)
            .outerRadius(d => Math.min((calculateRadius(d.y0 + 1, false, 0)), innerCircleRadius + outerCircleWidth - levelPadding));

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



        d3__namespace.select("#applyLevels").on("click", callArcs);

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
            drawArcs(shortArcData, longArcData);
        }

        d3__namespace.select("#startLevelInput").on("change", adjustStart);

        function adjustStart(event) {
            console.log("Start Level Adjusted:" + event.target.value);

            sliderStartLvl = event.target.value;

            callArcs();
        }

        d3__namespace.select("#stopLevelInput").on("change", adjustStop);

        function adjustStop(event) {
            console.log("Stop Level Adjusted:" + event.target.value);

            sliderStopLvl = event.target.value;

            callArcs();
        }

        const wholeGraphSVG = d3__namespace.create("svg");

        const sunburstSVG = wholeGraphSVG
            .append("svg")
            .attr("viewBox", [-sunburstSize / 2, -sunburstSize / 2, sunburstSize, sunburstSize])
            .attr("class", "sunburst");

        const longArcPath = sunburstSVG.append("g").attr("class", "group1");
        const shortArcPath = sunburstSVG.append("g").attr("class", "group2");
        const label = sunburstSVG.append("g")
            .attr("class", "group3")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none");


        const format = d3__namespace.format(",d");


        let innerMostElements;

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
                .attr("fill", d => d3__namespace.interpolateWarm(d.x0 / (2 * Math.PI)))
                .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 1 : 0.3) : 0.1)
                .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
                .attr("d", d => sunburstArc(d.current))
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

            innerMostElements=new Map();

            longArcPath.selectAll("path").attr("fill", "red").attr("fill-opacity", "1.0").attr("fake",d=>innerMostElements.set(d.data.path, d));
            shortArcPath.selectAll("path").filter(d => d.current.y0 == stopLvl).attr("fill", "red").attr("fill-opacity", "1.0").attr("fake",d=>innerMostElements.set(d.data.path, d));

            console.log(innerMostElements);


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

            // return internalSvg.node();
        }

        let searchText = "";

        d3__namespace.select("#fileSearchText").on("input", changeFileSearchText);

        function changeFileSearchText() {
            // console.log(event.target.value);

            searchText = event.target.value;
        }

        d3__namespace.select("#fileSearchButton").on("click", fileSearch);

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

        d3__namespace.select("#ui").append("button").attr("id", "testButton").html("Test Button").on("click", testFunction);

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

            drawArcs(shortArcData, longArcData);

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
        //______________________________________________________________________________________________

        const chordPlotSize = 10000;
        const chordInnerRadius = chordPlotSize * 0.5 - 90;
        const chordOuterRadius = chordInnerRadius + 100;

        let level = 4;

        const chordSVG = wholeGraphSVG
            .append("svg")
            .attr("viewBox", [-chordPlotSize / 2, -chordPlotSize / 2, chordPlotSize, chordPlotSize])
            .attr("transform", "scale (0.4 0.4) translate (1000 1000)")
            .attr("class","chord diagram");

        const chordBorderArcs = chordSVG.append("g").attr("class", "chordBorderArcs");
        const chordObject = chordSVG.append("g").attr("class", "chords");

        const chordGen = d3__namespace.chordDirected()
            // .padAngle(10 / chordInnerRadius)
            .padAngle(0)
            .sortSubgroups(d3__namespace.descending)
            .sortChords(d3__namespace.descending);

        const chordBorderArcGen = d3__namespace.arc()
            // .padAngle(1 / chordInnerRadius)
            .padAngle(0)
            .innerRadius(chordInnerRadius)
            .outerRadius(chordOuterRadius);

        const ribbonGen = d3__namespace.ribbonArrow()
            .radius(chordInnerRadius - 1)
            // .sourceRadius(innerRadius -1)
            // .headRadius(innerRadius - 1)
            .padAngle(1 / chordInnerRadius)
            .headRadius(chordInnerRadius / 10);

        calculateChordData(false);

        d3__namespace.select("#ui")
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

            calculateChordData(false);

        }

        d3__namespace.select("#ui")
            .append("button")
            .html("transform")
            .attr("id", "transformButton")
            .on("click", callChords);

        function callChords(){
            calculateChordData(true, innerMostElements);
        }

        function calculateChordData(isTransformed, fileList) {

            const currentLevelChordData = dependencyData.filter(d => ((d.dirLevel <= level && d.isDirectory === false) || (d.dirLevel === level && d.isDirectory === true)) && d.outgoing.length > 0);

            const allDepends = [];
            for (const d of currentLevelChordData) {
                const source = d.path;

                for (const target of d.outgoing) {
                    if (d.isDirectory === true) {
                        allDepends.push([source, target.path, target.value]);
                    } else {
                        allDepends.push([source, target, 1]);
                    }
                }
            }

            const uniqueFiles = new Set;
            currentLevelChordData.map(d => d.path).forEach(e => uniqueFiles.add(e));
            const names = d3__namespace.sort(uniqueFiles);

            const indices = new Map(names.map((name, i) => [name, i]));

            const matrix = Array.from(indices, () => new Array(names.length).fill(0));
            for (const e of allDepends) {
                matrix[indices.get(e[0])][indices.get(e[1])] += e[2];
            }

            function chordTransform(pChords) {
                pChords.groups.forEach(e=>{
                    const currentPath = names[e.index];

                    e.path = currentPath;

                    const currSunburstArc =fileList.get(currentPath);

                    if(typeof currSunburstArc !== "undefined"){
                        e.oldStartAngle = e.startAngle;
                        e.oldEndAngle = e.endAngle;

                        e.startAngle = currSunburstArc.current.x0;
                        e.endAngle = currSunburstArc.current.x1;
                    }
                    else {
                        console.log(e.path.toString() + " not found.");
                    }


                    // console.log(fileList.get(currentPath));
                });
                console.log(pChords.groups);

                pChords.forEach(e=>{
                    e.source.path = names[e.source.index];
                    e.target.path = names[e.target.index];

                    const targetSunburstArc = fileList.get(e.target.path);

                    if(typeof targetSunburstArc !== "undefined"){

                        function newAngle(oldAngle, currentGroup){
                            const start = currentGroup.startAngle;
                            const end = currentGroup.endAngle;
                            const oldStart = currentGroup.oldStartAngle;
                            const oldEnd = currentGroup.oldEndAngle;

                            const scalingFactor = Math.abs(end - start) / Math.abs(oldEnd - oldStart);
                            const offset = start - oldStart;

                            console.log("Scaling factor: "+scalingFactor+" offset: "+offset);

                            return ((oldAngle * scalingFactor) + offset);
                        }

                        e.source.startAngle = newAngle(e.source.startAngle, pChords.groups.find(g => g.path === e.source.path));
                        e.source.endAngle = newAngle(e.source.endAngle, pChords.groups.find(g => g.path === e.source.path));
                        e.target.startAngle = newAngle(e.target.startAngle, pChords.groups.find(g => g.path === e.target.path));
                        e.target.endAngle = newAngle(e.target.endAngle, pChords.groups.find(g => g.path === e.target.path));
                    }
                    else {
                        console.log(e.target.path.toString() + " not found.");

                        e.source.value = 0;
                        e.source.startAngle = 0;
                        e.source.endAngle = 0;
                        e.target.value = 0;
                        e.target.startAngle = 0;
                        e.target.endAngle = 0;
                    }


                });


                return pChords;
            }

            let chordData;

            if(isTransformed){
                chordData = chordTransform(chordGen(matrix));
            }
            else {
                chordData = chordGen(matrix);
            }

            console.log(chordData);

            displayGraph(chordData,  names);
        }


        function displayGraph(pData, names, filteredData) {
            // console.log(pData);

            const colors = d3__namespace.quantize(d3__namespace.interpolateSinebow, names.length);

            chordBorderArcs.selectAll("path")
                // .data(chords.groups)
                .data(pData.groups, function (d) {
                    return d;
                })
                .join("path")
                .attr("fill", d => colors[d.index]) //outercircle
                .attr("d", chordBorderArcGen)
                .append("title")
                .text(d => `${names[d.index]}
${d3__namespace.sum(pData, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3__namespace.sum(pData, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

            chordObject
                .attr("fill-opacity", 0.75)
                .selectAll("path")
                .data(pData, function (d) {
                    return d;
                })
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("fill", d => colors[d.target.index]) //ribbons
                .attr("d", ribbonGen)
                .append("title")
                .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`);
        }

        //______________________________________________________________________________________________


        return wholeGraphSVG.node();
    }

})(d3);
//# sourceMappingURL=bundle.js.map
