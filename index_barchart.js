import * as d3 from 'd3';

const windowHeight = Math.min(window.innerHeight*(3/4), window.innerWidth/2);

// const mainGraphSVG = d3
//     .select("body")
//     .append("div")
//     .attr("class","column")
//     .attr("id", "mainGraph")
//     .append("svg")
//     .attr('width', windowHeight)
//     .attr('height', windowHeight);


//https://stackoverflow.com/a/51113326
Promise.all([
    d3.csv("data_and_processing\\changes.txt"),
]).then(function (files) {

    for(let i=0; i < files[0].length; i++){
        files[0][i].index = i;

        files[0][i].changes = parseInt(files[0][i].changes);
        files[0][i].insertions = parseInt(files[0][i].insertions);
        files[0][i].deletions = parseInt(files[0][i].deletions);
    }

    barGraph(files[0]);
}).catch(function (err) {
    console.log(err);
});

function test(d){
    const testvar = barGraph(d).draw
}


//https://observablehq.com/@d3/zoomable-bar-chart
function barGraph (data){
    console.log(data);

    // Specify the chart’s dimensions.
    const width = 928;
    const height = 500;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;

    // Create the horizontal scale and its axis generator.
    const x = d3.scaleBand()
        .domain(Array.from(data.keys())) //https://stackoverflow.com/a/33352604
        .range([marginLeft, width - marginRight])
        .padding(0);

    const xAxis = d3.axisBottom(x).tickValues([]);

    // Create the vertical scale.
    const yInsertions = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.insertions; })])
        .range([(height - marginBottom)/2, marginTop]);

    const yDeletions = d3.scaleLinear()
        .domain([0, d3.min(data, function(d) { return -d.deletions; })])
        .range([(height - marginBottom)/2, height - marginBottom]);

    // console.log(y(600));
    // console.log(y(-100));

    // Create the SVG container and call the zoom behavior.
    const svg = d3.select("body")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;")
        .call(zoom);

    // Append the bars.
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

    svg.append("g")
        .attr("class", "selectables")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("fill", "white")
        .attr("opacity","0.01")
        .attr("x", d => x(d.index))
        .attr("height", height)
        .attr("width", x.bandwidth())
        .on("click",clicked)
        .on("mouseover",hovered)
        .append("title")
        .text(d =>
            `Timestep: ${d.index+1}\n
            (+)${d.insertions} insertions\n
            (-)${d.deletions} deletions\n            
            ${d.changes} files changed`
        )
        .raise();

    const seekHead = svg.append("g")
        .attr("class","seekHead")
        .attr("opacity", "0.75")
        .lower();

    let currentIndex = [];
    function drawSeekHead(index){
       seekHead
            .selectAll("rect")
            .data(index)
            .join("rect")
            .attr("fill", "black")
            .attr("stroke","black")
            .attr("stroke-width","0.01em")
            .attr("fake",d=>console.log(d))
            .attr("x", d => x(d))
            .attr("y", -100)
            .attr("height", height+200)
            .attr("width", x.bandwidth());
    }

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
            .attr("fake",d=>console.log(d))
            .attr("x", d => x(d))
            .attr("y", -100)
            .attr("height", height+200)
            .attr("width", x.bandwidth());
    }

    function clicked(event){
        console.log(event)
        currentIndex = [event.target.__data__.index];
        console.log(currentIndex);

        drawSeekHead(currentIndex);
    }

    function hovered(event){
        console.log(event)
        hoverIndex = [event.target.__data__.index];
        console.log(hoverIndex);

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
        .call(d3.axisLeft(yInsertions))
        .call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("class", "y-Deletions")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yDeletions))
        .call(g => g.select(".domain").remove());

    function zoom(svg) {
        const extent = [[marginLeft, marginTop], [width - marginRight, height - marginTop]];

        svg.call(d3.zoom()
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
