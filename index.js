import * as d3 from 'd3';
import {createUI} from "./scripts/createUI.js";
import {markDifference} from "./scripts/markDifference.js";
import {drawGraph} from "./scripts/drawGraph.js";
import {barGraph} from "./scripts/timeStepChart.js";

const windowHeight = Math.min(window.innerHeight*(3/4), window.innerWidth/2);

//contains the left graph
const mainGraphSVG = d3
    .select("body")
    .append("div")
    .attr("class","column")
    .attr("id", "mainGraph")
    .append("svg")
    .attr("xmlns","http://www.w3.org/2000/svg")
    .attr('width', windowHeight)
    .attr('height', windowHeight);

//contains the right graph
const secondaryGraphSVG = d3
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
    d3.json("data\\index.json"),
    d3.csv("data\\changes.txt"),
]).then(function (files) {

    let firstBarchart;

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

        d3.select(uiElement.get("timeStepField")).property("value", timeStep);
        d3.select(uiElement.get("timeStepName")).html(files[0][timeStep-1].hierarchy);

        const start = d3.select(uiElement.get("startLevelSlider")).property("value");
        const stop = d3.select(uiElement.get("stopLevelSlider")).property("value");

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

        callBarChart(uiElement.get("timeStepDivName"),0);

        console.log(d3.select(uiElement.get("timeStepDivName")).select("#barChart").select("#selectables"));

        d3.select(uiElement.get("timeStepDivName")).select("#barChart").select("#selectables").on("click", changeFnctChart);
        d3.select(uiElement.get("maxStartValue")).html(files[0].length);
        d3.select(uiElement.get("maxStopValue")).html(files[0].length);
        d3.select(uiElement.get("timeStepName")).html(files[0][0].hierarchy);
    }


    d3.select("#reset").on("click", setup);

    setup();

}).catch(function (err) {
    console.log(err);
});

function refreshChart(hierarchy, dependency, svgElement, uiElement, start, stop) {
    Promise.all([
        d3.json(hierarchy),
        d3.json(dependency),
    ]).then(function (files) {
        svgElement.node().replaceChildren(drawGraph(files[0], files[1], uiElement, start, stop, windowHeight));
        // console.log(sunburstSVG);
    }).catch(function (err) {
        console.log(err);
    });
}

d3.select("#showDiff").on("click", markDifference);