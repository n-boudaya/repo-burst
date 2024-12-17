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

    const windowHeight = window.innerHeight;

    const sunburstSVG = d3__namespace
        .select("body")
        .append("div")
        .attr("id", "zoomableSunburstComponent")
        .append("svg")
        .attr('width', windowHeight)
        .attr('height', windowHeight);

    //https://stackoverflow.com/a/51113326
    Promise.all([
        d3__namespace.json("data_and_processing\\index.json"),
    ]).then(function (files) {
        let currentTimeStep = 0;

        refreshChart(files[0][0].hierarchy, files[0][0].dependency);


        d3__namespace.select("#timeStepSlider").on("change", changeTimestep);
        d3__namespace.select("#timeStepInput").on("change", changeTimestep);
        d3__namespace.select("#timeStepSlider").property("max", files[0].length);
        d3__namespace.select("#timeStepInput").property("max", files[0].length);
        d3__namespace.select("#timeStepName").html(files[0][0].hierarchy);

        function changeTimestep(event) {
            console.log(event);

            currentTimeStep = event.target.value;

            d3__namespace.select("#timeStepSlider").property("value", currentTimeStep);
            d3__namespace.select("#timeStepInput").property("value", currentTimeStep);
            d3__namespace.select("#timeStepName").html(files[0][currentTimeStep-1].hierarchy);

            refreshChart(files[0][currentTimeStep-1].hierarchy, files[0][currentTimeStep-1].dependency);
        }
    }).catch(function (err) {
        console.log(err);
    });

    function refreshChart(hierarchy, dependency) {
        Promise.all([
            d3__namespace.json(hierarchy),
            d3__namespace.json(dependency),
        ]).then(function (files) {
            sunburstSVG.node().replaceChildren(zoomableSunburst(files[0], files[1]));
            // console.log(sunburstSVG);
        }).catch(function (err) {
            console.log(err);
        });
    }

    let startLvl = 0;
    let stopLvl = startLvl + 3;

    let sliderStartLvl = startLvl;
    let sliderStopLvl = stopLvl;

    let visibleLevels = stopLvl - startLvl + 1;

    function zoomableSunburst(hierarchyData, dependencyData) {

    // console.log(data);

    // Specify the chart’s dimensions.
        const sunburstSize = 8000;
        const radius = 500;
        const innerCircleRadius = 2000;
        const outerCircleWidth = 2000;

        let hierarchy;
        let root;

        let hierarchyDepth;
        const levelPadding = 10;

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

            if (isInnerRadius) {
                return result;
            } else {
                return (((visibleLevels - (yValue - startLvl)) * (outerCircleWidth / visibleLevels)) - padding) + innerCircleRadius;
            }
        }

    // Converts the input json data to a hierarchical data structure.
    // Then calculates a partition layout out of that.
    // The coordinates of that partition layout can directly be converted to the measurements of elements in the sunburst.
    // Each element in the partition layout has the coordinates x0, x1, y0, y1
    // The x coordinates contain the starting and end angles for elements in the partition, the y coordinates contain the hierarchy levels of the related file.
        function calculateSunburstData(hierarchyData) {
            hierarchy = d3__namespace.hierarchy(hierarchyData)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            hierarchyDepth = d3__namespace.max(hierarchy.leaves().map(d => d.depth));

            // console.log("Hierarchy depth:"+hierarchyDepth);

            root = d3__namespace.partition()
                .size([2 * Math.PI, hierarchy.height + 1])
                (hierarchy);
            root.each(d => d.current = d);
            root.each(d => d.hasChildren = hasChildren(d));
        }

        function hasChildren(d) {
            if (typeof d.data.children !== "undefined") {
                return d.data.children.length !== 0;
            } else {
                return false;
            }
        }

        function refreshStartStopSliders() {
            d3__namespace
                .select("#startLevelSlider")
                .property("value", startLvl)
                .property("max", hierarchyDepth);

            d3__namespace
                .select("#stopLevelSlider")
                .property("value", stopLvl)
                .property("max", hierarchyDepth);
        }

        d3__namespace.select("#applyLevels").on("click", callArcs);

        function callArcs() {
            root.each(d => d.current = d);

            if (sliderStartLvl > sliderStopLvl) {
                startLvl = Math.round(sliderStopLvl);
                stopLvl = Math.round(sliderStartLvl);
            } else {
                startLvl = Math.round(sliderStartLvl);
                stopLvl = Math.round(sliderStopLvl);
            }

            sliderStartLvl = startLvl;
            sliderStopLvl = stopLvl;


            visibleLevels = stopLvl - startLvl + 1;

            refreshStartStopSliders();

            const shortArcData = root.descendants().slice(1).filter(d => d.y0 <= stopLvl);
            const longArcData = root.descendants().slice(1).filter(d => (d.y0 <= stopLvl) && !d.children);
            // console.log(visibleLevels);

            // console.log(shortArcData);
            // console.log(longArcData);

            drawArcs(shortArcData, longArcData);
        }


        d3__namespace
            .select("#startLevelSlider")
            .on("change", adjustStart);

        function adjustStart(event) {
            console.log("Start Level Adjusted:" + event.target.value);

            d3__namespace.select("#startLvlCurrLvl").html(event.target.value);

            sliderStartLvl = event.target.value;

            callArcs();
        }

        d3__namespace
            .select("#stopLevelSlider")
            .on("change", adjustStop);

        function adjustStop(event) {
            console.log("Stop Level Adjusted:" + event.target.value);

            d3__namespace.select("#stopLvlCurrLvl").html(event.target.value);

            sliderStopLvl = event.target.value;

            callArcs();
        }


        //https://stackoverflow.com/a/51585981
        let zoomBehaviour = d3__namespace.zoom()
            .scaleExtent([1, 10])
            .on("zoom", changeZoom);

        const wholeGraphSVG = d3__namespace
            .create("svg")
            .call(zoomBehaviour);

        wholeGraphSVG
            .append("rect")
            .attr("class", "background")
            .attr("width", windowHeight)
            .attr("height", windowHeight)
            .attr("opacity", "0");

        function changeZoom() {
            const zoomTransform = d3__namespace.zoomTransform(wholeGraphSVG.node());
            wholeGraphSVG.attr("transform", zoomTransform);
        }

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


        let innerMostElements = new Map();

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
                .attr("d", d => longArc(d.current)).append("title")
                .text(d => `
            ${d.data.path}\n
            ${format(d.value)}\n
            Depth: ${d.depth}
            `);

            // Append the arcs.
            shortArcPath.selectAll("path")
                .data(shortData, function (d) {
                    return d;
                })
                .join("path")
                .attr("fill", d => d3__namespace.interpolateWarm(d.current.x0 / (2 * Math.PI)))
                .attr("fill-opacity", d => arcVisible(d) ? (d.children ? 1 : 0.3) : 0.1)
                .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
                .attr("d", d => sunburstArc(d.current))
                .append("title")
                .text(d => `
            ${d.data.path}\n
            ${format(d.value)}\n
            Depth: ${d.depth}
            `);


            // console.log(shortArcPath);

            shortArcPath.selectAll("path").filter(d => d.children)
                .style("cursor", "pointer")
                .on("click", clicked);

            innerMostElements = new Map();

            // longArcPath.selectAll("path").attr("fill", "red").attr("fill-opacity", "1.0").attr("fake",d=>innerMostElements.set(d.data.path, d));
            longArcPath.selectAll("path").attr("fake", d => innerMostElements.set(d.data.path, d));
            // shortArcPath.selectAll("path").filter(d => d.current.y0 == stopLvl).attr("fill", "red").attr("fill-opacity", "1.0").attr("fake",d=>innerMostElements.set(d.data.path, d));
            shortArcPath.selectAll("path").filter(d => d.current.y0 == stopLvl).attr("fake", d => innerMostElements.set(d.data.path, d));

            // console.log("innerMostElements:");
            // console.log(innerMostElements);


            label
                .selectAll("text")
                .data(shortData.filter(d => labelVisible(d.current)))
                .join("text")
                .attr("dy", "0.35em")
                .attr("font-size", d => labelSize(d))
                .attr("font-family", "monospace")
                // .attr("dy", "10.00em")
                // .attr("fill-opacity", d=>labelVisible(d.current)?"1":"0")
                .attr("transform", d => labelTransform(d.current))
                .text(d => d.data.name);

            // console.log(svg);
            // console.log(startLvl);

            // return internalSvg.node();
            redraw();
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
                return d.data.path.endsWith(searchText);
            })
                .sort((a, b) => a.depth - b.depth)
                // .attr("fill", (d, i) => {
                //     if (i === 0) {
                //         return "black";
                //     } else {
                //         return "red";
                //     }
                // })
                .attr("stroke", "black")
                .attr("stroke-width", "1em");

            chordObject.selectAll("path").filter(function (d) {
                return d.source.path === searchText;
            })
                .attr("stroke", "red")
                .attr("stroke-width", "1em");

            chordObject.selectAll("path").filter(function (d) {
                return d.target.path === searchText;
            })
                .attr("stroke", "blue")
                .attr("stroke-width", "1em");
        }

        // Handle zoom on click.
        function clicked(event, p) {
            console.log(p);
            console.log(event);


            //https://stackoverflow.com/a/69036892
            if (event.ctrlKey) {
                d3__namespace.select(this).attr('stroke', 'black').attr('stroke-width', '5');
            } else {
                startLvl = p.depth;
                stopLvl = startLvl + 2;

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

                // console.log(startLvl);
                // console.log(stopLvl);
                // console.log(shortArcData.map(d => d.current));

                drawArcs(shortArcData, longArcData);
            }
        }

        function arcVisible(d) {
            // return d.y1 <= visibleLevels+1 && d.y0 >= 1 && d.x1 > d.x0;

            return d.y0 >= startLvl && d.y0 <= stopLvl;
        }

        function labelVisible(d) {
            return d.y0 >= startLvl && d.y0 <= stopLvl && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.005;
        }

        function labelSize(d) {
            const interval = d.current.x1 - d.current.x0;

            const intervalDegrees = interval * (180 / Math.PI);

            const radius = calculateRadius(d.y1, false, 0);

            const arcLength = 2 * Math.PI * radius * (intervalDegrees / 360);

            let output;

            if (interval > 0.01) {
                output = (outerCircleWidth / visibleLevels) / d.data.name.toString().length;

                if (arcLength < output) {
                    output = arcLength;
                }
            } else {
                output = 1000 * interval;
            }

            return output;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = ((visibleLevels - (d.y0 - startLvl) - 0.5) * (outerCircleWidth / visibleLevels)) + innerCircleRadius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

        //______________________________________________________________________________________________

        const chordPlotSize = 10000;
        const chordInnerRadius = chordPlotSize * 0.5 - 200;
        const chordOuterRadius = chordPlotSize * 0.5;


        let level = stopLvl;

        const chordSVG = wholeGraphSVG
            .append("svg")
            .attr("viewBox", [-chordPlotSize / 2, -chordPlotSize / 2, chordPlotSize, chordPlotSize])
            .attr("transform", "scale (0.5 0.5) translate(" + windowHeight / 2 + " " + windowHeight / 2 + ")")
            .attr("class", "chord diagram");

        chordSVG.append("g").attr("class", "chordBorderArcs");
        const chordObject = chordSVG.append("g").attr("class", "chords");

        const chordGen = d3__namespace.chordDirected()
            // .padAngle(10 / chordInnerRadius)
            .padAngle(0)
            .sortSubgroups(d3__namespace.descending)
            .sortChords(d3__namespace.descending);

        d3__namespace.arc()
            // .padAngle(1 / chordInnerRadius)
            .padAngle(0)
            .innerRadius(chordInnerRadius)
            .outerRadius(chordOuterRadius);

        const ribbonGen = d3__namespace.ribbonArrow()
            .radius(chordOuterRadius)
            .padAngle(1 / chordInnerRadius)
            .headRadius(chordInnerRadius / 50);

        function redraw() {
            level = stopLvl;

            calculateChordData(innerMostElements);
        }

        function calculateChordData(fileList) {

            const currentLevelChordData = dependencyData.filter(d => ((d.dirLevel <= level && d.isDirectory === false) || (d.dirLevel === level && d.isDirectory === true)));

            const allDepends = [];
            for (const d of currentLevelChordData) {
                const source = d.path;

                for (const target of d.outgoing) {
                    if (d.isDirectory === true) {
                        allDepends.push([source, target.path, target.value]);
                    } else {
                        // console.log(d);

                        allDepends.push([source, target, 1]);
                    }
                }
            }


            const uniqueFiles = new Set;

            allDepends.forEach(e => {
                uniqueFiles.add(e[0]);
                uniqueFiles.add(e[1]);
            });

            const names = d3__namespace.sort(uniqueFiles);

            const indices = new Map(names.map((name, i) => [name, i]));

            const matrix = Array.from(indices, () => new Array(names.length).fill(0));

            for (const e of allDepends) {
                indices.get(e[0]);
                indices.get(e[1]);

                // if(typeof x === "undefined"){
                //     console.log("x undefined! Path:" +e[0]);
                // }
                // else if(typeof y === "undefined"){
                //     console.log("y undefined! Path:" +e[1]);
                // }

                matrix[indices.get(e[0])][indices.get(e[1])] += Math.max(e[2], 1);
            }

            function chordTransform(pChords) {
                pChords.groups.forEach(e => {
                    const currentPath = names[e.index];

                    e.path = currentPath;

                    const currSunburstArc = fileList.get(currentPath);

                    if (typeof currSunburstArc !== "undefined") {
                        e.oldStartAngle = e.startAngle;
                        e.oldEndAngle = e.endAngle;

                        e.startAngle = currSunburstArc.current.x0;
                        e.endAngle = currSunburstArc.current.x1;
                    } else {
                        e.startAngle = 0;
                        e.endAngle = 0;

                        // console.log(e.path.toString() + " not found.")
                    }
                });
                // console.log(pChords.groups);

                pChords.forEach(e => {
                    e.source.path = names[e.source.index];
                    e.target.path = names[e.target.index];

                    const sourceGroup = pChords.groups.find(g => g.path === e.source.path);
                    const targetGroup = pChords.groups.find(g => g.path === e.target.path);

                    const sourceSunburstArc = fileList.get(e.source.path);
                    const targetSunburstArc = fileList.get(e.target.path);

                    if (typeof targetSunburstArc !== "undefined" && typeof sourceSunburstArc !== "undefined") {

                        const currentData = currentLevelChordData.find(m => m.path === e.source.path);

                        console.log("dirLevel: " + currentData.dirLevel + " depth: " + sourceSunburstArc.depth);

                        // console.log(targetColor);
                        function newAngle(oldAngle, currentGroup) {
                            const start = currentGroup.startAngle;
                            const end = currentGroup.endAngle;
                            const oldStart = currentGroup.oldStartAngle;
                            const oldEnd = currentGroup.oldEndAngle;

                            // console.log(
                            //     "Current group: "+currentGroup.path+
                            //     // "\nScaling factor: "+scalingFactor+
                            //     // "\noffset: "+offset+
                            //     "\nstart: "+start+
                            //     "\nend: "+end+
                            //     "\noldStart: "+oldStart+
                            //     "\noldEnd: "+oldEnd+
                            //     "\noldAngle: "+oldAngle+
                            //     "\nnewAngle: "+(start + (((end-start)/(oldEnd-oldStart))*(oldAngle-oldStart))));

                            //https://math.stackexchange.com/a/914843
                            return (start + (((end - start) / (oldEnd - oldStart)) * (oldAngle - oldStart)));
                        }

                        e.source.startAngle = newAngle(e.source.startAngle, sourceGroup);
                        e.source.endAngle = newAngle(e.source.endAngle, sourceGroup);
                        e.target.startAngle = newAngle(e.target.startAngle, targetGroup);
                        e.target.endAngle = newAngle(e.target.endAngle, targetGroup);
                    }
                    else {
                        // console.log(e.target.path.toString() + " not found.")

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

            displayGraph(chordTransform(chordGen(matrix)));
        }


        function displayGraph(pData) {

    //         chordBorderArcs.selectAll("path")
    //             // .data(chords.groups)
    //             .data(pData.groups, function (d) {
    //                 return d;
    //             })
    //             .join("path")
    //             .attr("fill", "none") //outercircle
    //             .attr("d", chordBorderArcGen)
    //             .append("title")
    //             .text(d => `${names[d.index]}
    // ${d3.sum(pData, c => (c.source.index === d.index) * c.source.value)} outgoing →\n
    // ${d3.sum(pData, c => (c.target.index === d.index) * c.source.value)} incoming ←`);

            chordObject
                .attr("fill-opacity", 0.75)
                .selectAll("path")
                .data(pData.filter(d => chordValid(d)), function (d) {
                    return d;
                })
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("fill", d => d3__namespace.interpolateWarm(d.target.startAngle / (2 * Math.PI))) //ribbons
                .attr("stroke", d => d3__namespace.interpolateWarm(d.target.startAngle / (2 * Math.PI)))
                .attr("stroke-width", "0.5em")
                .attr("stroke-opacity", d => (chordVisible(d) ? "0" : "0.3"))
                .attr("d", ribbonGen)
                // .attr("fake", d=>console.log(d))
                .insert("title", ":first-child")
                .text(d =>
                    `Chord info:\n
                ${d.source.path} →\n
                ${d.target.path}\n
                ${d.source.startAngle}\n                
                ${d.source.endAngle}\n                
                ${d.target.startAngle}\n                
                ${d.target.endAngle}\n                
                Value: ${d.source.value}\n`);
        }

        function chordVisible(chord) {
            const sourceInterval = Math.abs(chord.source.endAngle - chord.source.startAngle);
            const targetInterval = Math.abs(chord.target.endAngle - chord.target.startAngle);

            const interval = Math.min(sourceInterval, targetInterval);

            if ((interval * (180 / Math.PI)) > 1) {
                return true;
            } else {
                return false;
            }
        }

        function chordValid(chord) {

            const maxValue = 359.999*(Math.PI/180);

            if((chord.source.startAngle === 0 && chord.source.endAngle === 0)||
                (chord.target.startAngle === 0 && chord.target.endAngle === 0)||
                (chord.source.startAngle >=maxValue && chord.source.endAngle >=maxValue)||
                (chord.target.startAngle >=maxValue && chord.target.endAngle >=maxValue)){

                return false;
            }
            else {
                return true;
            }
        }

        //______________________________________________________________________________________________

        refreshStartStopSliders();
        calculateSunburstData(hierarchyData);
        callArcs();
        return wholeGraphSVG.node();
    }

})(d3);
//# sourceMappingURL=bundle.js.map
