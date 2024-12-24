import * as d3 from 'd3';
import {createUI} from "./scripts/createUI.js";
import {markDifference} from "./scripts/markDifference.js";
import {drawGraph} from "./scripts/drawGraph.js";
import {barGraph} from "./scripts/timeStepChart.js";

const windowHeight = Math.min(window.innerHeight*(3/4), window.innerWidth/2);

const mainGraphSVG = d3
    .select("body")
    .append("div")
    .attr("class","column")
    .attr("id", "mainGraph")
    .append("svg")
    .attr('width', windowHeight)
    .attr('height', windowHeight);

const secondaryGraphSVG = d3
    .select("body")
    .append("div")
    .attr("class","column")
    .attr("id", "secondaryGraph")
    .append("svg")
    .attr('width', windowHeight)
    .attr('height', windowHeight);

//https://stackoverflow.com/a/51113326
Promise.all([
    d3.json("data_and_processing\\index.json"),
    d3.csv("data_and_processing\\changes.txt"),
]).then(function (files) {

    let firstBarchart;
    function callBarChart(div){
        // console.log(files);
        for(let i=0; i < files[1].length; i++){
            files[1][i].index = i+1;

            files[0][i].changes = parseInt(files[0][i].changes);
            files[0][i].insertions = parseInt(files[0][i].insertions);
            files[0][i].deletions = parseInt(files[0][i].deletions);
        }

        barGraph(files[1], div);
    }

    const mainUI = createUI("mainGraph", "mainUI");
    const secondaryUI = createUI("secondaryGraph", "secondaryUI");

    // function changeTimeStep(event, uiElement, svgElement){
    //     console.log(event);
    //
    //     const timeStep = event.target.value;
    //
    //     callBarChart(uiElement.get("timeStepDivName"),timeStep.toString());
    //     d3.select(uiElement.get("timeStepField")).property("value", timeStep);
    //     d3.select(uiElement.get("timeStepName")).html(files[0][timeStep-1].hierarchy);
    //
    //     const start = d3.select(uiElement.get("startLevelSlider")).property("value");
    //     const stop = d3.select(uiElement.get("stopLevelSlider")).property("value");
    //
    //     refreshChart(files[0][timeStep-1].hierarchy, files[0][timeStep-1].dependency, svgElement, uiElement, start, stop);
    // }

    function changeTimeStepChart(event, uiElement, svgElement){
        console.log(event);

        const timeStep = event.target.__data__.index;

        d3.select(uiElement.get("timeStepField")).property("value", timeStep);
        d3.select(uiElement.get("timeStepName")).html(files[0][timeStep-1].hierarchy);

        const start = d3.select(uiElement.get("startLevelSlider")).property("value");
        const stop = d3.select(uiElement.get("stopLevelSlider")).property("value");

        refreshChart(files[0][timeStep-1].hierarchy, files[0][timeStep-1].dependency, svgElement, uiElement, start, stop);
    }

    // function changeTimeStepMain(event) {
    //     changeTimeStep(event, mainUI, mainGraphSVG);
    // }
    //
    // function changeTimeStepSecond(event) {
    //     changeTimeStep(event, secondaryUI, secondaryGraphSVG);
    // }

    function changeTimeStepChartMain(event) {
        changeTimeStepChart(event, mainUI, mainGraphSVG);
    }

    function changeTimeStepChartSecond(event) {
        changeTimeStepChart(event, secondaryUI, secondaryGraphSVG);
    }

    function setup(){
        initialize(changeTimeStepChartMain, mainGraphSVG, mainUI);
        initialize(changeTimeStepChartSecond, secondaryGraphSVG, secondaryUI);
    }

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