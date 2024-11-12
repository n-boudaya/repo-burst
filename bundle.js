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

    d3__namespace.json("dependencies_2024-11-11-16-18-27.json").then(function (data) {

        const svg = d3__namespace.select("body").append("svg").attr('width', window.innerHeight).attr('height', window.innerHeight);

        svg.node().appendChild(computeMatrix(data));

    });

    function computeMatrix(data){
        // console.log(data);

        const names = d3__namespace.sort(data.map(d=>d.path));
        // console.log(names);

        const index = new Map(names.map((name, i) => [name, i]));
        // console.log(index);

        const matrix = Array.from(index, () => new Array(names.length).fill(0));

        for(const d of data){
            const source = d.path;

            const onlyOutgoings = d3__namespace.map(d3__namespace.filter(d.outgoing, (d) => d.external === false), (d) => d.file);

            console.log(onlyOutgoings);

            for(const target of onlyOutgoings){
                matrix[index.get(source)][index.get(target)] += 1;
            }
        }

         console.log(matrix);

    }

})(d3);
//# sourceMappingURL=bundle.js.map
