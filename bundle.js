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

    //Helper function, solely used to create labels
    // parent - the div the label gets attached to
    // forElement - the element the label is for
    // text - text of the label
    // id - id of the label
    function labelMaker(parent, forElement, text, id){
        const label = parent.append("label")
            .attr("for",forElement)
            .html(text);

        if(arguments.length === 4){
            label.attr("id", id);
        }
    }

    //creates the necessary ui for the sunbursts
    function createUI(divName, uiDivName){
        const uiElementMap = new Map();

        //creates a set of two labels, used for labels like "Current level: 0"
        //The "0" might have to be modified, so two labels have to be created
        function labelValueCombo(parent, forElement,referenceName,idText,firstLabel,secondLabel){
            const labelReference = idText+forElement;
            uiElementMap.set(referenceName,labelReference);

            if(arguments.length === 6){
                labelMaker(parent, forElement, firstLabel);
                labelMaker(parent, forElement, secondLabel, labelReference);
            }
            else {
                labelMaker(parent, forElement, firstLabel, labelReference);
            }
        }

        const searchDivName = "#"+uiDivName;

        d3__namespace.select(uiDivName).remove();

        d3__namespace
            .select("#"+divName).append("div")
            .attr("id",uiDivName);

        const timeStepDivName = divName+"timeStepDiv";
        const timeStepDiv = d3__namespace
            .select(searchDivName).append("div")
            .attr("id",timeStepDivName);
        uiElementMap.set("timeStepDivName",timeStepDivName);

        // timeStepDiv.append("input")
        //     .attr("type","range")
        //     .attr("id",timeStepSlider)
        //     .attr("value",0)
        //     .attr("min",1)
        //     .attr("max",1)
        //     .attr("step",1);

        // const timeStepField = divName+"timeStepField";
        // uiElementMap.set("timeStepField",timeStepField);
        // timeStepDiv.append("input")
        //     .attr("type","number")
        //     .attr("id",timeStepField)
        //     .attr("value",0)
        //     .attr("min",1)
        //     .attr("max",10);

        const timeStepName = divName+"timeStepName";
        uiElementMap.set("timeStepName",timeStepName);
        timeStepDiv.append("p")
            .attr("id",timeStepName)
            .html("xxxx");


        const startLevelDivName = divName+"startLevelDiv";
        const startLevelDiv = d3__namespace
            .select(searchDivName).append("div")
            .attr("id",startLevelDivName);

        const startLevelSlider = divName+"startLevelSlider";
        uiElementMap.set("startLevelSlider",startLevelSlider);
        labelMaker(startLevelDiv, startLevelSlider, "First level|");

        labelValueCombo(startLevelDiv, startLevelSlider,"currentStartValue","curr"," Current level:","1");
        labelValueCombo(startLevelDiv, startLevelSlider,"minStartValue","min"," Min level:","1");
        labelValueCombo(startLevelDiv, startLevelSlider,"maxStartValue","max"," Max level:","1");


        startLevelDiv.append("input")
            .attr("type","range")
            .attr("id",startLevelSlider)
            .attr("value",1)
            .attr("min",1)
            .attr("max",1)
            .attr("step",1);

        const stopLevelDivName = divName+"stopLevelDiv";
        const stopLevelDiv = d3__namespace
            .select(searchDivName).append("div")
            .attr("id",stopLevelDivName);

        const stopLevelSlider = divName+"stopLevelSlider";
        uiElementMap.set("stopLevelSlider",stopLevelSlider);
        labelMaker(stopLevelDiv, stopLevelSlider, "Last level|");

        labelValueCombo(stopLevelDiv, stopLevelSlider,"currentStopValue","curr"," Current level:","1");
        labelValueCombo(stopLevelDiv, stopLevelSlider,"minStopValue","min"," Min level:","1");
        labelValueCombo(stopLevelDiv, stopLevelSlider,"maxStopValue","max"," Max level:","1");

        stopLevelDiv.append("input")
            .attr("type","range")
            .attr("id",stopLevelSlider)
            .attr("value",1)
            .attr("min",1)
            .attr("max",1)
            .attr("step",1);

        const fileSearchName = divName+"fileSearchDiv";
        const fileSearchDivName = fileSearchName+"Div";
        const fileSearchDiv = d3__namespace
            .select(searchDivName).append("div")
            .attr("id",fileSearchDivName);
        uiElementMap.set("fileSearchDiv",fileSearchDivName);


        const fileSearchText = fileSearchName+"Text";
        uiElementMap.set("fileSearchText",fileSearchText);
        labelMaker(fileSearchDiv, fileSearchText, "File search:");

        fileSearchDiv.append("input")
            .attr("type","text")
            .attr("name",fileSearchText)
            .attr("id",fileSearchText);
        const fileSearchButton = fileSearchName+"Button";
        uiElementMap.set("fileSearchButton",fileSearchButton);
        fileSearchDiv.append("button")
            .attr("id",fileSearchButton)
            .html("Search");
        const showResultsButton = divName+"showResultButton";
        uiElementMap.set("showResultsButton",showResultsButton);
        fileSearchDiv.append("button")
            .attr("id",showResultsButton)
            .html("Show results");

        const generalFunctionsDivName = divName+"generalFunctionsDiv";
        const generalFunctionsDiv = d3__namespace
            .select(searchDivName).append("div")
            .attr("id",generalFunctionsDivName);

        // const resetButton = divName+"resetButton";
        // uiElementMap.set("resetButton",resetButton);
        // generalFunctionsDiv.append("button")
        //     .attr("id",resetButton)
        //     .html("RESET");
        const goUpButton = divName+"goUpButton";
        uiElementMap.set("goUpButton",goUpButton);
        generalFunctionsDiv.append("button")
            .attr("id",goUpButton)
            .html("Go up one level");
        // const exitFilteredButton = divName+"exitFilteredButton";
        // uiElementMap.set("exitFilteredButton",exitFilteredButton);
        // generalFunctionsDiv.append("button")
        //     .attr("id",exitFilteredButton)
        //     .html("Exit filtered view");


        //Adds all the created elements to the uiElementsMap, so their IDs can be saved and accessed
        uiElementMap.keys().forEach(e=>uiElementMap.set(e,"#"+uiElementMap.get(e)));
        console.log(uiElementMap);
        return(uiElementMap);
    }

    //Gets called when pressing the "Display Differences" button at the top of the page
    //Marks all elements of the sunbursts and chords that don't appear on the other side of the page
    //Lists those results in selection boxes at the bottom of the page
    function markDifference(){

        //Selects the visible elements of the sunbursts
        const mainSelection = d3__namespace.select("#mainGraph").selectAll("#shortArcs").selectAll("path").filter(
            function(d){
                return d.isVisible === true;
            });
        const secondarySelection = d3__namespace.select("#secondaryGraph").selectAll("#shortArcs").selectAll("path").filter(
            function(d){
                return d.isVisible === true;
            });

        //These arrays get filled with all visible elements of the sunbursts
        const mainArr = [];
        const secondaryArr = [];
        mainSelection._groups[0].values().forEach(e=>mainArr.push(e));
        secondarySelection._groups[0].values().forEach(e=>secondaryArr.push(e));

        //Calculates the difference between the two sunburst graphs
        //onlyInMain contains all paths that only appear in the left sunburst
        //onlyInSecondary contains all paths that only appear in the right sunburst
        const onlyInMain = d3__namespace.difference(mainArr.map(e=>e.getAttribute('path')), secondaryArr.map(e=>e.getAttribute('path')));
        const onlyInSecondary = d3__namespace.difference(secondaryArr.map(e=>e.getAttribute('path')), mainArr.map(e=>e.getAttribute('path')));

        //Saves all sunburst elements and chords that only appear in the left sunburst
        const mainFiltered = mainSelection.filter(function(d){
            return onlyInMain.has(d.data.path);
        });
        const mainChords = d3__namespace.select("#mainGraph").selectAll("#chords").selectAll("path").filter(function(d){
            return onlyInMain.has(d.source.path)||onlyInMain.has(d.target.path);
        });

        //Draws blue outline around found sunbursts and chords
        mainFiltered
            .attr("stroke","blue")
            .attr("stroke-width","2em")
            .attr("stroke-opacity","1");
        mainChords
            .attr("stroke","blue")
            .attr("stroke-width","2em")
            .attr("stroke-opacity","1");

        //Saves all sunburst elements and chords that only appear in the right sunburst
        const secondaryFiltered = secondarySelection.filter(function(d){
            return onlyInSecondary.has(d.data.path);
        });

        const secondaryChords = d3__namespace.select("#secondaryGraph").selectAll("#chords").selectAll("path").filter(function(d){
            return onlyInSecondary.has(d.source.path)||onlyInSecondary.has(d.target.path);
        });

        //Draws red outline around found sunbursts and chords
        secondaryFiltered
            .attr("stroke","blue")
            .attr("stroke-width","2em")
            .attr("stroke-opacity","1");

        secondaryChords
            .attr("stroke","blue")
            .attr("stroke-width","2em")
            .attr("stroke-opacity","1");

        //Create boxes of results
        d3__namespace.select("#mainGraphDiffResults").remove();
        const mainGraphDiv = d3__namespace.select("#mainGraph").append("div").attr("id","mainGraphDiffResults");
        mainGraphDiv.append("p").html("These elements were only found in this graph:");
        const mainBox = mainGraphDiv.append("select");
        onlyInMain.forEach(e=>{
            mainBox.append("option").html(e);
        });

        d3__namespace.select("#secondaryGraphDiffResults").remove();
        const secondaryGraphDiv = d3__namespace.select("#secondaryGraph").append("div").attr("id","secondaryGraphDiffResults");
        secondaryGraphDiv.append("p").html("These elements were only found in this graph:");
        const secondaryBox = secondaryGraphDiv.append("select");
        onlyInSecondary.forEach(e=>{
            secondaryBox.append("option").html(e);
        });

    }

    //Draws one hybrid sunburst chord graph
    //uiElements - contains the names of uiElements that have to be accessed
    //start - the lowest displayed sunburst level
    //stop - the highest displayed sunburst level
    //size - the size of the chart
    function drawGraph(hierarchyData, dependencyData, uiElements, start, stop, size) {

        // Specify the chart’s internal dimensions.
        const sunburstSize = 8000;
        const innerCircleRadius = 2000;
        const outerCircleWidth = 2000;

        let hierarchy;
        let root;

        let hierarchyDepth;
        const levelPadding = 10;

        //Actually used start and stop levels
        let startLvl = start;
        let stopLvl = stop;

        //Only get used to keep track of UI changes
        let sliderStartLvl = startLvl;
        let sliderStopLvl = stopLvl;

        let visibleLevels = stopLvl - startLvl + 1;

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

            d3__namespace.select(uiElements.get("maxStartValue")).html(hierarchyDepth);
            d3__namespace.select(uiElements.get("maxStopValue")).html(hierarchyDepth);

            console.log("Hierarchy depth:"+hierarchyDepth);

            root = d3__namespace.partition()
                .size([2 * Math.PI, hierarchy.height + 1])
                (hierarchy);
            root.each(d => d.current = d);
            root.each(d => d.hasChildren = hasChildren(d));
        }

        //Specify UI interactions
        d3__namespace.select(uiElements.get("fileSearchText")).on("input", changeFileSearchText);
        d3__namespace.select(uiElements.get("fileSearchButton")).on("click", fileSearch);
        d3__namespace.select(uiElements.get("showResultsButton")).on("click", showSearchResult);
        d3__namespace.select(uiElements.get("goUpButton")).on("click", goUpOneLevel);
        d3__namespace.select(uiElements.get("startLevelSlider")).on("change", adjustStart);
        d3__namespace.select(uiElements.get("stopLevelSlider")).on("change", adjustStop);

    // Create the arc generator for the normal files and folders of the sunburst.
    // Is used to convert each element of the partition layout to an arc in the sunburst.
        const sunburstArc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            // padAngle needs to scale in reference to the size of the element.
            // If this wasn't done, very small elements would completely disappear.
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
            .padRadius(innerCircleRadius * 0.5)
            .innerRadius(d => calculateRadius(d.y0, true, levelPadding))
            .outerRadius(d => calculateRadius(d.y0, false, levelPadding));

    // Create the arc generator for the elongated elements that connect leafs of the hierarchy that are above the innermost hierarchy level to the chord diagram.
        const longArc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.01))
            .padRadius(innerCircleRadius * 0.5)
            .innerRadius(innerCircleRadius)
            .outerRadius(d => Math.min((calculateRadius(d.y0 + 1, false, 0)), innerCircleRadius + outerCircleWidth - levelPadding));

        //Calculates the inner or outer radius of an arc segment, according to its hierarchy level
        //Is so convoluted because the total size of the sunburst should stay constant
        function calculateRadius(yValue, isInnerRadius, padding) {
            const result = ((visibleLevels - (yValue - startLvl) - 1) * (outerCircleWidth / visibleLevels)) + innerCircleRadius;

            if (isInnerRadius) {
                return result;
            } else {
                return (((visibleLevels - (yValue - startLvl)) * (outerCircleWidth / visibleLevels)) - padding) + innerCircleRadius;
            }
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
                .select(uiElements.get("startLevelSlider"))
                .property("value", startLvl)
                .property("max", hierarchyDepth);

            d3__namespace
                .select(uiElements.get("stopLevelSlider"))
                .property("value", stopLvl)
                .property("max", hierarchyDepth);
        }

        //Redraws arcs with the current state of both the data and displayed levels
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


        function adjustStart(event) {
            console.log("Start Level Adjusted:" + event.target.value);

            d3__namespace.select(uiElements.get("currentStartValue")).html(event.target.value);

            sliderStartLvl = event.target.value;

            callArcs();
        }


        function adjustStop(event) {
            console.log("Stop Level Adjusted:" + event.target.value);

            d3__namespace.select(uiElements.get("currentStopValue")).html(event.target.value);

            sliderStopLvl = event.target.value;

            callArcs();
        }


        //https://stackoverflow.com/a/51585981
        let zoomBehaviour = d3__namespace.zoom()
            .scaleExtent([1, 10])
            .on("zoom", changeZoom);

        //svg element all of the graph will be attached to
        const wholeGraphSVG = d3__namespace
            .create("svg")
            .call(zoomBehaviour);

        wholeGraphSVG
            .append("rect")
            .attr("class", "background")
            .attr("width", size)
            .attr("height", size)
            .attr("opacity", "0");

        function changeZoom() {
            const zoomTransform = d3__namespace.zoomTransform(wholeGraphSVG.node());
            wholeGraphSVG.attr("transform", zoomTransform);
        }

        //svg element the sunburst will be attached to
        const sunburstSVG = wholeGraphSVG
            .append("svg")
            .attr("viewBox", [-sunburstSize / 2, -sunburstSize / 2, sunburstSize, sunburstSize]) //Arcs and partitions normally get drawn originating in 0,0, so viewbox has to be moved
            .attr("class", "sunburst");

        //longArcs get used to extend arcs that don't have children to the inner radius of the sunburst
        const longArcPath = sunburstSVG.append("g").attr("class", "group1");

        //shortArcs are the actual arc elements representing the data
        const shortArcPath = sunburstSVG.append("g").attr("class", "group2").attr("id", "shortArcs");
        const label = sunburstSVG.append("g")
            .attr("class", "group3")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none");


        const format = d3__namespace.format(",d");

        //Later gets used to decide which chords should be drawn
        let innerMostElements = new Map();

        //draws the arcs, gets called by callArcs with the data adjusted to only contain the levels that should be displayed
        function drawArcs(shortData, longData) {

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
                .attr("fill-opacity", d => arcTechnicallyVisible(d) ? (d.children ? 1 : 0.3) : 0.1)
                .attr("isVisible", d => {
                    const visible = arcVisible(d);
                    d.isVisible = visible;
                    return visible
                })
                .attr("pointer-events", d => arcTechnicallyVisible(d.current) ? "auto" : "none")
                .attr("path", d => d.data.path) //file path, not vector path
                .attr("d", d => sunburstArc(d.current))
                .append("title")
                .text(d => `
            ${d.data.path}\n
            Size: ${format(d.value)}\n
            Depth: ${d.depth}
            `);


            // console.log(shortArcPath);

            //makes all elements that have children clickable, so they can be zoomed in on
            shortArcPath.selectAll("path").filter(d => d.children)
                .style("cursor", "pointer")
                .on("click", clicked);

            innerMostElements = new Map();

            //adds all the innermost elements of the sunburst to the map, this includes the longArcs even though they don't reach the innerRadius,
            //since they always reference leaves
            //the fake attribute gets used to access all datums once and get their data. it is not used in any other way
            longArcPath.selectAll("path").attr("fake", d => innerMostElements.set(d.data.path, d));
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

        //contains the currently entered search text
        let searchText = "";

        //gets called when search text box gets used
        function changeFileSearchText() {
            // console.log(event.target.value);

            searchText = event.target.value;
        }


        let searchResults = new Set();

        //searches for all files and dependencies that have a path that ends wit the currently entered search text,
        // marks them black and adds them to searchResults
        function fileSearch() {
            searchResults = new Set();

            shortArcPath.selectAll("path")
                .attr("stroke", "none");

            shortArcPath.selectAll("path").filter(function (d) {
                if(!(typeof d === "undefined")&&!(typeof d.data.path === "undefined")){
                    return d.data.path.endsWith(searchText);
                }
            })
                .attr("stroke", "black")
                .attr("stroke-width", "2em")
                .attr("fake", d => searchResults.add(d));

            chordObject.selectAll("path")
                .attr("stroke", d => d3__namespace.interpolateWarm(d.target.startAngle / (2 * Math.PI)))
                .attr("stroke-width", "0.5em")
                .attr("stroke-opacity", d => (chordVisible(d) ? "0" : "0.3"));

            chordObject.selectAll("path").filter(function (d) {
                return d.source.path.endsWith(searchText);
            })
                // .attr("fake", d=>console.log(d))
                .attr("stroke", "black")
                .attr("stroke-width", "2em")
                .attr("stroke-opacity", "1");


            d3__namespace.select(uiElements.get("fileSearchDiv")).select("#searchResults").remove();
            const searchResultBox = d3__namespace
                .select(uiElements.get("fileSearchDiv"))
                .append("select")
                .attr("id", "searchResults");

            searchResults.forEach(e => {
                searchResultBox.append("option").html(e.data.path);
            });
        }

        //zooms in on the selected searchResult
        function showSearchResult() {
            const selectedPath = d3__namespace.select(uiElements.get("fileSearchDiv")).select("#searchResults").property("value");
            const selectedArc = shortArcPath.selectAll("path").filter(function (d) {
                return d.data.path === selectedPath;
            }).attr("fake", d => fileFocus(d));

            console.log(selectedArc);

            // fileFocus(selectedArc);
        }

        //contains the last subdirectory that was zoomed in on
        let currentlyClicked;

        // Handle zoom on click.
        function clicked(event, p) {
            console.log(p);
            console.log(event);


            //https://stackoverflow.com/a/69036892
            if (event.ctrlKey) {
                d3__namespace.select(this).attr('stroke', 'black').attr('stroke-width', '5');
            } else {
                fileFocus(p);
            }
        }

        //Zooms in on subdirectories by changing the levels and transforming all arcs, so that they appear as if the
        //focussed on file p is the new root of the hierarchy
        function fileFocus(p) {
            currentlyClicked = p;

            startLvl = p.depth;
            stopLvl = startLvl + 2;

            visibleLevels = stopLvl - startLvl + 1;

            //Transforms all arcs so that they are either invisible if they are not a child of p
            //or that they adhere to the new layout that assumes that p is the root
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

        //When focused on a file, focuses on its parent directory
        function goUpOneLevel() {
            fileFocus(currentlyClicked.parent);
        }

        //Checks if an arc is visible. Arcs that are transformed so that they can't be seen,
        // because the sunburst is zoomed in a file, also count as not visible
        function arcVisible(d) {
            const interval = 0.1;

            const allCloseToZero =
                closeToZeroDegrees(d.current.x0) && closeToZeroDegrees(d.current.x1) ||
                closeTo360Degrees(d.current.x0) && closeTo360Degrees(d.current.x1);

            function closeToZeroDegrees(angle) {
                const degrees = angle * (180 / Math.PI);

                if (degrees < interval) {
                    return true;
                }
            }

            function closeTo360Degrees(angle) {
                const degrees = angle * (180 / Math.PI);

                if (degrees > (360 - interval)) {
                    return true;
                }
            }

            return d.y0 >= startLvl && d.y0 <= stopLvl && !allCloseToZero;
        }

        //Arcs invisible due to zooming transformations get counted as visible
        function arcTechnicallyVisible(d) {
            return d.y0 >= startLvl && d.y0 <= stopLvl;
        }

        function labelVisible(d) {
            return d.y0 >= startLvl && d.y0 <= stopLvl && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.005;
        }

        //calculates the label size, taking into account the size of arc the label is in
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
        // chord visualization from here onward


        const chordPlotSize = 10000;
        const chordInnerRadius = chordPlotSize * 0.5 - 200;
        const chordOuterRadius = chordPlotSize * 0.5;


        let level = stopLvl;

        //svg element the chords get attached to
        const chordSVG = wholeGraphSVG
            .append("svg")
            .attr("viewBox", [-chordPlotSize / 2, -chordPlotSize / 2, chordPlotSize, chordPlotSize])
            .attr("transform", "scale (0.5 0.5) translate(" + size / 2 + " " + size / 2 + ")")
            .attr("class", "chord diagram");

        // const chordBorderArcs = chordSVG.append("g").attr("class", "chordBorderArcs");
        const chordObject = chordSVG.append("g").attr("class", "chords").attr("id", "chords");

        //the chord generator. this specifically generates the starting and ending areas the ribbons attach to
        const chordGen = d3__namespace.chordDirected()
            // .padAngle(10 / chordInnerRadius)
            .padAngle(0)
            .sortSubgroups(d3__namespace.descending)
            .sortChords(d3__namespace.descending);

        //the ribbon generator. this generates the svg elements that one would normally describe as chords
        const ribbonGen = d3__namespace.ribbonArrow()
            .radius(chordOuterRadius)
            .padAngle(1 / chordInnerRadius)
            .headRadius(chordInnerRadius / 50);

        //refreshes the chord viz
        function redraw() {
            level = stopLvl;

            calculateChordData(innerMostElements);
        }

        //calculates the matrix of dependency relationships from the data
        function calculateChordData(fileList) {

            //only load data that could get displayed
            const currentLevelChordData = dependencyData.filter(d => ((d.dirLevel <= level && d.isDirectory === false) || (d.dirLevel === level && d.isDirectory === true)));

            //contains all dependencies in the data in the format of [source,target,value]
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


            //contains all unique files that get referenced or reference another file
            const uniqueFiles = new Set;

            allDepends.forEach(e => {
                uniqueFiles.add(e[0]);
                uniqueFiles.add(e[1]);
            });

            const names = d3__namespace.sort(uniqueFiles);

            //array of indices for the names of the uniqueFiles
            const indices = new Map(names.map((name, i) => [name, i]));

            //matrix of relationships between files. x and y axis are both represent the files, the values in the matrix later
            //represents the values of the chords
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


            //transform the chords to match the layout of the sunburst, especially when zoomed in
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

                //All the chords get rearranged and distributed to their new place
                pChords.forEach(e => {
                    e.source.path = names[e.source.index];
                    e.target.path = names[e.target.index];

                    const sourceGroup = pChords.groups.find(g => g.path === e.source.path);
                    const targetGroup = pChords.groups.find(g => g.path === e.target.path);

                    const sourceSunburstArc = fileList.get(e.source.path);
                    const targetSunburstArc = fileList.get(e.target.path);

                    if (typeof targetSunburstArc !== "undefined" && typeof sourceSunburstArc !== "undefined") {

                        currentLevelChordData.find(m => m.path === e.source.path);

                        // console.log("dirLevel: " + currentData.dirLevel + " depth: " + sourceSunburstArc.depth);

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
                    } else {
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

        //draws the hords
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
                .data(pData.filter(d => chordValid(d)), function (d) {//does draw invisible chords
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
                Source: ${d.source.path} →\n
                Target: ${d.target.path}\n               
                Value: ${d.source.value}\n`);
        }

        //similar to arc visible, doesn't draw infinitely thin chords
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

        //decides if the chord should be invisible, due to transformation by the zooming function
        function chordValid(chord) {

            const maxValue = 359.999 * (Math.PI / 180);

            if ((chord.source.startAngle === 0 && chord.source.endAngle === 0) ||
                (chord.target.startAngle === 0 && chord.target.endAngle === 0) ||
                (chord.source.startAngle >= maxValue && chord.source.endAngle >= maxValue) ||
                (chord.target.startAngle >= maxValue && chord.target.endAngle >= maxValue)) {

                return false;
            } else {
                return true;
            }
        }

        //______________________________________________________________________________________________

        refreshStartStopSliders();
        calculateSunburstData(hierarchyData);
        callArcs();
        return wholeGraphSVG.node();
    }

    // const mainGraphSVG = d3
    //     .select("body")
    //     .append("div")
    //     .attr("class","column")
    //     .attr("id", "mainGraph")
    //     .append("svg")
    //     .attr('width', windowHeight)
    //     .attr('height', windowHeight);



    //https://observablehq.com/@d3/zoomable-bar-chart
    function barGraph (data, div){
        // console.log(data);

        // Specify the chart’s dimensions.
        const width = 1000;
        const height = 75;
        const marginTop = 5;
        const marginRight = 0;
        const marginBottom = 5;
        const marginLeft = 60;

        let indexArr = [];

        Array.from(data.keys()).forEach(e=>{
            indexArr[e] = e+1;        
        });


        // Create the horizontal scale and its axis generator.
        const x = d3__namespace.scaleBand()
            .domain(indexArr) //https://stackoverflow.com/a/33352604
            .range([marginLeft, width - marginRight])
            .padding(0);

        const xAxis = d3__namespace.axisBottom(x).tickValues([]);


        // Create the vertical scale.
        const yInsertions = d3__namespace.scaleLinear()
            .domain([0, d3__namespace.max(data, d => parseInt(d.insertions))]) //https://stackoverflow.com/a/30876582
            .range([(height - marginBottom)/2, marginTop]);

        const yDeletions = d3__namespace.scaleLinear()
            .domain([0, d3__namespace.min(data, d => -(parseInt(d.deletions)))])
            .range([(height - marginBottom)/2, height - marginBottom]);

            console.log("Minimum:"+d3__namespace.min(data, d => -(parseInt(d.deletions))));
            console.log("Maximum:"+d3__namespace.max(data, d => parseInt(d.insertions)));

        // console.log(y(600));
        // console.log(y(-100));

        d3__namespace.select(div).select("#barChart").remove();

        // Create the SVG container and call the zoom behavior.
        const svg = d3__namespace.select(div)
            .append("svg")
            .attr("id", "barChart")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto;")
            .call(zoom);

        // Append the bars.

        //Green insertions bars
        svg.append("g")
            .attr("class", "insertions")
            .attr("opacity", "0.75")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("fill", "green")
            .attr("x", d => x(d.index))
            .attr("y", d => yInsertions(d.insertions))
            .attr("height", d => yInsertions(0) - yInsertions(d.insertions))
            .attr("width", x.bandwidth());

        //Red deletions bars
        svg.append("g")
            .attr("class", "deletions")
            .attr("opacity", "0.75")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("fill", "red")
            .attr("x", d => x(d.index))
            .attr("y", yDeletions(0))
            .attr("height", d => yDeletions(0) - yDeletions(d.deletions))
            .attr("width", x.bandwidth());

        //These are invisible bars that overlay the whole time step bar chart
        //Their only purpose is to be interacted with, so that the user can also click on areas where no
        //insertions or deletions bar is, but still select that step
        svg.append("g")
            .attr("class", "selectables")
            .attr("id", "selectables")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("fill", "white")
            .attr("opacity","0.01") //can't be 0, since some browsers cull invisible objects
            .attr("x", d => x(d.index))
            .attr("height", height)
            .attr("width", x.bandwidth())
            .on("click",clicked)
            .on("mouseover",hovered)
            .append("title")
            .text(d =>
                `Timestep: ${d.index}\n
            (+)${d.insertions} insertions\n
            (-)${d.deletions} deletions\n            
            ${d.changes} files changed`
            )
            .raise();

        //Create the seekhead, is always placed at the selected time step
        const seekHead = svg.append("g")
            .attr("class","seekHead")
            .attr("opacity", "0.75")
            .lower();

        let currentIndex = [];

        //Draws the seekhead at the specified index
        function drawSeekHead(index){
            seekHead
                .selectAll("rect")
                .data(index)
                .join("rect")
                .attr("fill", "black")
                .attr("stroke","black")
                .attr("stroke-width","0.01em")
                // .attr("fake",d=>console.log(d))
                .attr("x", d => x(d))
                .attr("y", -100)
                .attr("height", height+200)
                .attr("width", x.bandwidth());
        }

        //Creates the hoverhead, follows the users cursor and highlights the time step the user is hovering over
        const hoverHead = svg.append("g")
            .attr("class","hoverHead")
            .attr("opacity", "0.25")
            .lower();

        let hoverIndex = [];
        function drawHoverHead(index){
            hoverHead
                .selectAll("rect")
                .data(index)
                .join("rect")
                .attr("fill", "black")
                .attr("stroke","black")
                .attr("stroke-width","0.01em")
                // .attr("fake",d=>console.log(d))
                .attr("x", d => x(d))
                .attr("y", -100)
                .attr("height", height+200)
                .attr("width", x.bandwidth());
        }

        function clicked(event){
            changeSeekHead(event.target.__data__.index);
        }

        function changeSeekHead(index){
            // console.log(event)
            currentIndex = [index];
            // console.log(currentIndex);

            drawSeekHead(currentIndex);
        }


        function hovered(event){
            // console.log(event)
            hoverIndex = [event.target.__data__.index];
            // console.log(hoverIndex);

            drawHoverHead(hoverIndex);
        }

        // Append the axes.
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-Insertions")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3__namespace.axisLeft(yInsertions).ticks(3))
            .call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("class", "y-Deletions")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3__namespace.axisLeft(yDeletions).ticks(3))
            .call(g => g.select(".domain").remove());

        function zoom(svg) {
            const extent = [[marginLeft, marginTop], [width - marginRight, height - marginTop]];

            svg.call(d3__namespace.zoom()
                .scaleExtent([1, 100])
                .translateExtent(extent)
                .extent(extent)
                .on("zoom", zoomed));

            function zoomed(event) {
                x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
                svg.selectAll(".insertions rect").attr("x", d => x(d.index)).attr("width", x.bandwidth());
                svg.selectAll(".deletions rect").attr("x", d => x(d.index)).attr("width", x.bandwidth());
                svg.selectAll(".selectables rect").attr("x", d => x(d.index)).attr("width", x.bandwidth());
                svg.selectAll(".seekHead rect").attr("x", d => x(d)).attr("width", x.bandwidth());
                svg.selectAll(".hoverHead rect").attr("x", d => x(d)).attr("width", x.bandwidth());
                svg.selectAll(".x-axis").call(xAxis);
            }
        }
    }

    const windowHeight = Math.min(window.innerHeight*(3/4), window.innerWidth/2);

    //contains the left graph
    const mainGraphSVG = d3__namespace
        .select("body")
        .append("div")
        .attr("class","column")
        .attr("id", "mainGraph")
        .append("svg")
        .attr("xmlns","http://www.w3.org/2000/svg")
        .attr('width', windowHeight)
        .attr('height', windowHeight);

    //contains the right graph
    const secondaryGraphSVG = d3__namespace
        .select("body")
        .append("div")
        .attr("class","column")
        .attr("id", "secondaryGraph")
        .append("svg")
        .attr("xmlns","http://www.w3.org/2000/svg")
        .attr('width', windowHeight)
        .attr('height', windowHeight);

    //https://stackoverflow.com/a/51113326
    Promise.all([
        d3__namespace.json("data\\index.json"),
        d3__namespace.csv("data\\changes.txt"),
    ]).then(function (files) {

        //calls a time step bar chart
        function callBarChart(div){

            //correctly casts all values of changes.txt
            for(let i=0; i < files[1].length; i++){
                files[1][i].index = i+1;

                //read values don't always get parsed correctly, this forces correct parsing
                files[1][i].changes = parseInt(files[1][i].changes);
                files[1][i].insertions = parseInt(files[1][i].insertions);
                files[1][i].deletions = parseInt(files[1][i].deletions);
            }

            barGraph(files[1], div);
        }

        //creates both left and right UI
        const mainUI = createUI("mainGraph", "mainUI");
        const secondaryUI = createUI("secondaryGraph", "secondaryUI");

        //changes the timestep after clicking on a new one on a time step bar chart
        function changeTimeStepChart(event, uiElement, svgElement){
            console.log(event);

            const timeStep = event.target.__data__.index;

            d3__namespace.select(uiElement.get("timeStepField")).property("value", timeStep);
            d3__namespace.select(uiElement.get("timeStepName")).html(files[0][timeStep-1].hierarchy);

            const start = d3__namespace.select(uiElement.get("startLevelSlider")).property("value");
            const stop = d3__namespace.select(uiElement.get("stopLevelSlider")).property("value");

            refreshChart(files[0][timeStep-1].hierarchy, files[0][timeStep-1].dependency, svgElement, uiElement, start, stop);
        }

        //both are necessary since event listeners don't call functions with parameters
        function changeTimeStepChartMain(event) {
            changeTimeStepChart(event, mainUI, mainGraphSVG);
        }

        function changeTimeStepChartSecond(event) {
            changeTimeStepChart(event, secondaryUI, secondaryGraphSVG);
        }

        //sets up all the visualizations
        function setup(){
            initialize(changeTimeStepChartMain, mainGraphSVG, mainUI);
            initialize(changeTimeStepChartSecond, secondaryGraphSVG, secondaryUI);
        }

        //initializes the whole page
        function initialize(changeFnctChart,svgElement, uiElement){

            refreshChart(files[0][0].hierarchy, files[0][0].dependency, svgElement, uiElement, 0, 3);

            // function testOut(){
            //     console.log("test")
            // }

            callBarChart(uiElement.get("timeStepDivName"));

            console.log(d3__namespace.select(uiElement.get("timeStepDivName")).select("#barChart").select("#selectables"));

            d3__namespace.select(uiElement.get("timeStepDivName")).select("#barChart").select("#selectables").on("click", changeFnctChart);
            d3__namespace.select(uiElement.get("maxStartValue")).html(files[0].length);
            d3__namespace.select(uiElement.get("maxStopValue")).html(files[0].length);
            d3__namespace.select(uiElement.get("timeStepName")).html(files[0][0].hierarchy);
        }


        d3__namespace.select("#reset").on("click", setup);

        setup();

    }).catch(function (err) {
        console.log(err);
    });

    function refreshChart(hierarchy, dependency, svgElement, uiElement, start, stop) {
        Promise.all([
            d3__namespace.json(hierarchy),
            d3__namespace.json(dependency),
        ]).then(function (files) {
            svgElement.node().replaceChildren(drawGraph(files[0], files[1], uiElement, start, stop, windowHeight));
            // console.log(sunburstSVG);
        }).catch(function (err) {
            console.log(err);
        });
    }

    d3__namespace.select("#showDiff").on("click", markDifference);

})(d3);
//# sourceMappingURL=bundle.js.map
