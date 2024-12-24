import * as d3 from "d3";

function labelMaker(parent, forElement, text, id){
    const label = parent.append("label")
        .attr("for",forElement)
        .html(text);

    if(arguments.length === 4){
        label.attr("id", id);
    }
}

export function createUI(divName, uiDivName){
    const uiElementMap = new Map();

    function labelValueCombo(parent, forElement,referenceName,idText,firstLabel,secondLabel){
        const labelReference = idText+forElement;
        uiElementMap.set(referenceName,labelReference);

        if(arguments.length === 6){
            labelMaker(parent, forElement, firstLabel);
            labelMaker(parent, forElement, secondLabel, labelReference);
        }
        else{
            labelMaker(parent, forElement, firstLabel, labelReference);
        }
    }

    const searchDivName = "#"+uiDivName;

    d3.select(uiDivName).remove();

    const parentDiv = d3
        .select("#"+divName).append("div")
        .attr("id",uiDivName);

    const timeStepDivName = divName+"timeStepDiv";
    const timeStepDiv = d3
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
    const startLevelDiv = d3
        .select(searchDivName).append("div")
        .attr("id",startLevelDivName);

    const startLevelSlider = divName+"startLevelSlider";
    uiElementMap.set("startLevelSlider",startLevelSlider);
    labelMaker(startLevelDiv, startLevelSlider, "First level|");

    labelValueCombo(startLevelDiv, startLevelSlider,"currentStartValue","curr"," Current level:","0");
    labelValueCombo(startLevelDiv, startLevelSlider,"minStartValue","min"," Min level:","1");
    labelValueCombo(startLevelDiv, startLevelSlider,"maxStartValue","max"," Max level:","1");


    startLevelDiv.append("input")
        .attr("type","range")
        .attr("id",startLevelSlider)
        .attr("value",0)
        .attr("min",0)
        .attr("max",3)
        .attr("step",1);

    const stopLevelDivName = divName+"stopLevelDiv";
    const stopLevelDiv = d3
        .select(searchDivName).append("div")
        .attr("id",stopLevelDivName);

    const stopLevelSlider = divName+"stopLevelSlider";
    uiElementMap.set("stopLevelSlider",stopLevelSlider);
    labelMaker(stopLevelDiv, stopLevelSlider, "Last level|");

    labelValueCombo(stopLevelDiv, stopLevelSlider,"currentStopValue","curr"," Current level:","0");
    labelValueCombo(stopLevelDiv, stopLevelSlider,"minStopValue","min"," Min level:","1");
    labelValueCombo(stopLevelDiv, stopLevelSlider,"maxStopValue","max"," Max level:","1");

    stopLevelDiv.append("input")
        .attr("type","range")
        .attr("id",stopLevelSlider)
        .attr("value",0)
        .attr("min",0)
        .attr("max",3)
        .attr("step",1);

    const fileSearchName = divName+"fileSearchDiv";
    const fileSearchDivName = fileSearchName+"Div";
    const fileSearchDiv = d3
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
    const generalFunctionsDiv = d3
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


    uiElementMap.keys().forEach(e=>uiElementMap.set(e,"#"+uiElementMap.get(e)));
    console.log(uiElementMap);
    return(uiElementMap);
}