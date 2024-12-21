import * as d3 from "d3";



export function markDifference(){
    const mainSelection = d3.select("#mainGraph").selectAll("#shortArcs").selectAll("path").filter(
        function(d){
            // console.log(d);
            return d.isVisible === true;
        });
    const secondarySelection = d3.select("#secondaryGraph").selectAll("#shortArcs").selectAll("path").filter(
        function(d){
            return d.isVisible === true;
        });


    // console.log(mainSelection._groups[0]);

    const mainArr = [];
    const secondaryArr = [];

    mainSelection._groups[0].values().forEach(e=>mainArr.push(e));
    secondarySelection._groups[0].values().forEach(e=>secondaryArr.push(e));
    // console.log(mainArr.map(e=>e.getAttribute('path')));
    // console.log(mainSelection.groups.map(e=>d3.select(e).attr("path")));


    const onlyInMain = d3.difference(mainArr.map(e=>e.getAttribute('path')), secondaryArr.map(e=>e.getAttribute('path')));
    const onlyInSecondary = d3.difference(secondaryArr.map(e=>e.getAttribute('path')), mainArr.map(e=>e.getAttribute('path')));

    const mainFiltered = mainSelection.filter(function(d){
        return onlyInMain.has(d.data.path);
    });

    const mainChords = d3.select("#mainGraph").selectAll("#chords").selectAll("path").filter(function(d){
        return onlyInMain.has(d.source.path)||onlyInMain.has(d.target.path);
    });

    mainFiltered
        .attr("stroke","blue")
        .attr("stroke-width","2em")
        .attr("stroke-opacity","1");

    mainChords
        .attr("stroke","blue")
        .attr("stroke-width","2em")
        .attr("stroke-opacity","1");

    const secondaryFiltered = secondarySelection.filter(function(d){
        return onlyInSecondary.has(d.data.path);
    });

    const secondaryChords = d3.select("#secondaryGraph").selectAll("#chords").selectAll("path").filter(function(d){
        return onlyInSecondary.has(d.source.path)||onlyInSecondary.has(d.target.path);
    });

    secondaryFiltered
        .attr("stroke","blue")
        .attr("stroke-width","2em")
        .attr("stroke-opacity","1");

    secondaryChords
        .attr("stroke","blue")
        .attr("stroke-width","2em")
        .attr("stroke-opacity","1");

    console.log(onlyInMain);
    console.log(onlyInSecondary);
    // selection.attr("fill", "black");

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