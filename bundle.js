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

    d3__namespace.json("fileprocout.json").then(function (data) {

        const svg = d3__namespace.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

        svg.node().appendChild(SunburstSimple(data, 1, 1000 / 2));

    });

    function autoBox() {
        document.body.appendChild(this);
        const {x, y, width, height} = this.getBBox();
        document.body.removeChild(this);
        return [x, y, width, height];
    }

    function SunburstSimple(data, cutoff, radius) {
        // Prepare the layout.
        const partition = data => d3__namespace.partition()
            .size([2 * Math.PI, radius])
            (d3__namespace.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value));


        const root = partition(data);

        const level = root.descendants().filter(d => d.depth > cutoff).reduce((total, value) => {
            if (total < value.depth) {
                total = value.depth;
            }
            return total;
        }, 0);

        console.log("Level:" + level);



        // Specify the chart’s colors.
        const color = d3__namespace.scaleOrdinal(d3__namespace.quantize(d3__namespace.interpolateRainbow, root.descendants().filter(d => d.depth > cutoff && d.depth < cutoff+2).length + 1));


        const innerR = d =>((radius*2)/10)*(level+1)-d.y0;
        const outerR = d =>((radius*2)/10)*(level+2)-d.y0;

        const arc = d3__namespace.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius / 2)
            .innerRadius(d => innerR(d))
            .outerRadius(d => outerR(d) - 1);

        // Create the SVG container.
        const svg = d3__namespace.create("svg");

        // Add an arc for each element, with a title for tooltips.
        const format = d3__namespace.format(",d");
        svg.append("g")
            .attr("fill-opacity", 0.6)
            .selectAll("path")
            .data(root.descendants().filter(d => d.depth > cutoff))
            .join("path")
            .attr("fill", d => {
                while (d.depth > cutoff+1) d = d.parent;
                console.log(d.data.name);
                return color(d.data.name);
            })
            .attr("d", arc)
            .append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

        // Add a label for each element.
        svg.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .selectAll("text")
            .data(root.descendants().filter(d => d.depth > cutoff && ((outerR(d)-innerR(d)) * (d.x1-d.x0))>5))
            .join("text")
            .attr("transform", function (d) {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = ((innerR(d)) + (outerR(d))) / 2;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
            })
            .attr("dy", "0.1em")
            .text(d => d.data.name);

        return svg.attr("viewBox", autoBox).node();
    }

})(d3);
//# sourceMappingURL=bundle.js.map
