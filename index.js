import * as d3 from 'd3';

d3.json("dependencies_2024-11-10-15-01-14.json").then(function (data) {

    const svg = d3.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

    svg.node().appendChild(singleDependencyChart(hierarchy(data)));

});

function autoBox() {
    document.body.appendChild(this);
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}

function singleDependencyChart(data) {
    const width = 954;
    const radius = width / 2;

    const colorin = "#00f";
    const colorout = "#f00";
    const colornone = "#ccc";

    const tree = d3.cluster()
        .size([2 * Math.PI, radius - 100]);
    const root = tree(bilink(d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.path, b.data.path))));

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", width)
        .attr("viewBox", [-width / 2, -width / 2, width, width])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const node = svg.append("g")
        .selectAll()
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.path)
        .each(function (d) {
            d.text = this;
        })
        .on("mouseover", overed)
        .on("mouseout", outed)
        .call(text => text.append("title").text(d => `${id(d)}
${d.outgoing.length} outgoing
${d.incoming.length} incoming`));

    const line = d3.lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x);

    const link = svg.append("g")
        .attr("stroke", colornone)
        .attr("fill", "none")
        .selectAll()
        .data(root.leaves().flatMap(leaf => leaf.outgoing))
        .join("path")
        .style("mix-blend-mode", "multiply")
        .attr("d", ([i, o]) => line(i.path(o)))
        .each(function (d) {
            d.path = this;
        });

    function overed(event, d) {
        link.style("mix-blend-mode", null);
        d3.select(this).attr("font-weight", "bold");
        d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
        d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
    }

    function outed(event, d) {
        link.style("mix-blend-mode", "multiply");
        d3.select(this).attr("font-weight", null);
        d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
        d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
    }

    return svg.node();
}

function hierarchy(data, delimiter = "\\") {

    let root;
    const map = new Map;
    data.forEach(function find(data) {
        const {path} = data;
        if (map.has(path)) return map.get(path);
        const i = path.lastIndexOf(delimiter);
        map.set(path, data);
        if (i >= 0) {
            find({path: path.substring(0, i), children: []}).children.push(data);
            data.path = path.substring(i + 1);
        } else {
            root = data;
        }
        return data;
    });

    return root;
}

function bilink(root) {

    const map = new Map(root.leaves().map(d => [id(d), d]));

    for (const d of root.leaves()) {
        d.incoming = [];
        d.outgoing = d3.map(d3.filter(d.data.dependencies, (d) => d.external === false), (d) => d.file).map(i => [d, map.get(i)]).filter((d) => typeof d[1] !== 'undefined');
    }

    for (const d of root.leaves()) {
        for (const o of d.outgoing) {
            o[1].incoming.push(o);
        }
    }

    return root;
}

function cleanNonConnected(root){

}

function id(node) {
    const output = `${node.parent ? id(node.parent) + "\\" : ""}${node.data.path}`;

    return output;
}
