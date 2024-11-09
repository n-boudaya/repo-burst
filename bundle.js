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

    d3__namespace.json("dependencies_2024-11-09-12-16-10.json").then(function (data) {

        const svg = d3__namespace.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

        svg.node().appendChild(singleDependencyChart(hierarchy(data)));

    });

    function singleDependencyChart(data)
    {
        const width = 954;
        const radius = width / 2;

        const colorin = "#00f";
        const colorout = "#f00";
        const colornone = "#ccc";

        const tree = d3__namespace.cluster()
            .size([2 * Math.PI, radius - 100]);
        const root = tree(bilink(d3__namespace.hierarchy(data)
            .sort((a, b) => d3__namespace.ascending(a.height, b.height) || d3__namespace.ascending(a.data.path, b.data.path))));

        const svg = d3__namespace.create("svg")
            .attr("width", width)
            .attr("height", width)
            .attr("viewBox", [-width / 2, -width / 2, width, width])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        svg.append("g")
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
            .each(function(d) { d.text = this; })
            .on("mouseover", overed)
            .on("mouseout", outed)
            .call(text => text.append("title").text(d => `${id(d)}
${d.outgoing.length} outgoing
${d.incoming.length} incoming`));

        const line = d3__namespace.lineRadial()
            .curve(d3__namespace.curveBundle.beta(0.85))
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
            .each(function(d) { d.path = this; });

        function overed(event, d) {
            link.style("mix-blend-mode", null);
            d3__namespace.select(this).attr("font-weight", "bold");
            d3__namespace.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
            d3__namespace.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
            d3__namespace.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
            d3__namespace.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
        }

        function outed(event, d) {
            link.style("mix-blend-mode", "multiply");
            d3__namespace.select(this).attr("font-weight", null);
            d3__namespace.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
            d3__namespace.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
            d3__namespace.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
            d3__namespace.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
        }

        return svg.node();
    }

    function hierarchy(data, delimiter = "\\") {
        // console.log(data);

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

        // console.log(root);
        return root;
    }

    function bilink(root) {

        // for (const d of root.leaves()){
        //     // console.log(d3.map(d.data.dependencies, (d)=> d.file));
        //     // console.log(d3.filter(d.data.dependencies, (d)=>d.external===false));
        //
        //     console.log(d3.map(d3.filter(d.data.dependencies, (d)=>d.external===false), (d)=> d.file));
        //
        // }
        // for (const d of root.leaves()){
        //     console.log(d);
        //     console.log(id(d));
        // }

        const map = new Map(root.leaves().map(d => [id(d), d]));
        console.log(map);

        for (const d of root.leaves()){
            console.log(d3__namespace.map(d3__namespace.filter(d.data.dependencies, (d)=>d.external===false), (d)=> d.file));
        }
        for (const d of root.leaves()){
            d.incoming = [];
            d.outgoing = d3__namespace.map(d3__namespace.filter(d.data.dependencies, (d)=>d.external===false), (d)=> d.file).map(i => [d, map.get(i)]);
        }
        // for (const d of root.leaves()) for (const o of d.outgoing) console.log(o);
        for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
        return root;
    }

    function id(node) {
        const output = `${node.parent ? id(node.parent) + "\\" : ""}${node.data.path}`;

        // console.log(node);
        // console.log(output);

        return output;
    }

})(d3);
//# sourceMappingURL=bundle.js.map
