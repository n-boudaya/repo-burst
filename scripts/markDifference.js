import * as d3 from "d3";


//Gets called when pressing the "Display Differences" button at the top of the page
//Marks all elements of the sunbursts and chords that don't appear on the other side of the page
//Lists those results in selection boxes at the bottom of the page
export function markDifference(){

    //Selects the visible elements of the sunbursts
    const mainSelection = d3.select("#mainGraph").selectAll("#shortArcs").selectAll("path").filter(
        function(d){
            return d.isVisible === true;
        });
    const secondarySelection = d3.select("#secondaryGraph").selectAll("#shortArcs").selectAll("path").filter(
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
    const onlyInMain = d3.difference(mainArr.map(e=>e.getAttribute('path')), secondaryArr.map(e=>e.getAttribute('path')));
    const onlyInSecondary = d3.difference(secondaryArr.map(e=>e.getAttribute('path')), mainArr.map(e=>e.getAttribute('path')));

    //Saves all sunburst elements and chords that only appear in the left sunburst
    const mainFiltered = mainSelection.filter(function(d){
        return onlyInMain.has(d.data.path);
    });
    const mainChords = d3.select("#mainGraph").selectAll("#chords").selectAll("path").filter(function(d){
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

    const secondaryChords = d3.select("#secondaryGraph").selectAll("#chords").selectAll("path").filter(function(d){
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
    d3.select("#mainGraphDiffResults").remove();
    const mainGraphDiv = d3.select("#mainGraph").append("div").attr("id","mainGraphDiffResults");
    mainGraphDiv.append("p").html("These elements were only found in this graph:");
    const mainBox = mainGraphDiv.append("select");
    onlyInMain.forEach(e=>{
        mainBox.append("option").html(e);
    })

    d3.select("#secondaryGraphDiffResults").remove();
    const secondaryGraphDiv = d3.select("#secondaryGraph").append("div").attr("id","secondaryGraphDiffResults");
    secondaryGraphDiv.append("p").html("These elements were only found in this graph:");
    const secondaryBox = secondaryGraphDiv.append("select");
    onlyInSecondary.forEach(e=>{
        secondaryBox.append("option").html(e);
    })

}