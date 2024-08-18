(function (d3$1) {
  'use strict';

  const width = window.innerWidth;
  const height = width;
  const n = 50;
  const arcwidth = width * 0.019;
  const padding = width * 0.02;

  const colors = [
    '#007ac9',
    '#01a110',
    '#fed302',
    '#562f9e',
    '#d1151e',
    '#ff7902',
  ];

  console.log("Entered index.js");

  //create svg canvas
  const svg = d3$1.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  //function to create rectangular mask
  // w is width, h is height
  const generateRectMask = (maskId, x, y, w, h) => {
    const mask = svg.append('mask').attr('id', `${maskId}`);

    mask
      .append('rect')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight)
      .attr('fill', 'black');

    mask
      .append('rect')
      .attr('width', w)
      .attr('height', h)
      .attr('x', x)
      .attr('y', y)
      .attr('fill', 'white');
  };

  //Top left mask
  generateRectMask(
    'tL',
    padding,
    padding,
    width / 2 - 1.5 * padding,
    height / 2 - 1.5 * padding,
  );

  //Bottom left mask
  generateRectMask(
    'bL',
    padding,
    height / 2 + 0.5 * padding,
    width / 2 - 1.5 * padding,
    height / 2 - 1.5 * padding,
  );

  //Right mask
  generateRectMask(
    'r',
    width / 2 + 0.5 * padding,
    padding,
    width / 2 - 1.5 * padding,
    height - 2 * padding,
  );

  //Creates black background
  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'black');

  //Saves past colors to avoid repitition
  let pastColors = [];

  //Renders rainbow colored rings
  //x and y = origin
  //maskid = applied mask
  const renderRings = (
    x,
    y,
    startAngle,
    endAngle,
    maskid,
  ) => {
    const rings = svg.append('g');

    rings
      .selectAll('path')
      .data(d3$1.range(n))
      .join('path')
      .attr("id", function(d,i) { return i; })
      .attr(
        'd',
        d3
          .arc()
          .innerRadius((d) => d * arcwidth)
          .outerRadius((d) => d * arcwidth + arcwidth)
          .startAngle(startAngle)
          .endAngle(endAngle),
      )
      .attr('transform', `translate(${x},${y})`)
      .attr('fill', (c) => {
        let rand;
        do rand = Math.floor(Math.random() * colors.length);
        while (
          pastColors.find((element) => element == rand) !=
          undefined
        );

        if (pastColors.length > 3) {
          pastColors.shift();
        }

        pastColors.push(rand);

        return colors[rand];
      })
      .attr('stroke', 'white')
      .attr('stroke-width', '0')
      .on("mouseover", function(d,i) {d3.select(this).attr('stroke-width', '10');} );
    if (maskid != 'none') {
      rings.attr('mask', `url(#${maskid})`);
    }
  };

  renderRings(padding, padding, Math.PI / 2, Math.PI, 'tL');

  renderRings(
    width / 2 - 0.5 * padding,
    height - padding,
    Math.PI * 1.5,
    Math.PI * 2,
    'bL',
  );
  renderRings(
    width / 2 + 0.5 * padding,
    height / 2,
    0,
    Math.PI,
    'r',
  );

})(d3);
//# sourceMappingURL=bundle.js.map
