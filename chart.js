 var minRadius = 2;
          var maxRadius = 25;
          var scale = d3.scale.linear()
                              .domain([1, 2000])
                              .range([minRadius,maxRadius]);
          

          var margin = {top: 20, right: 10, bottom: 20, left: 380},
              width = 1560 - margin.right - margin.left,
              height = 1000 - margin.top - margin.bottom;

          var i = 0,
              duration = 750,
              root;

          var tree = d3.layout.tree()
              .size([height, width]);

          var diagonal = d3.svg.diagonal()
              .projection(function(d) { return [d.y, d.x]; }); // converts start and end point so we are going left to right instead of up and down

          var svg = d3.select("#charts")
              .append("svg")
              .attr("width", width + margin.right + margin.left)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


          var data = d3.json("africa_flare.json", function(error, data) {
            if (error) throw error;

            root = data;
            root.x0 = height / 2;
            root.y0 = 0;

            function collapse(d) {
              if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
              }
            }

            root.children.forEach(collapse);
            update(root);
          });

          var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
              if (d.departure === undefined) {
                return "<strong> <span style='color:#a6cee3'>" + d.name 
              } else if (d.departure ===1 ) {
              return "<strong> <span style='color:#a6cee3'>" + d.name + ":<span style='color:#E80614'> " + d.departure + "</span> conversion</strong>";
              } else { 
                return "<strong> <span style='color:#a6cee3'>" + d.name + ":<span style='color:#E80614'> " + d.departure + "</span> arrivals</strong>";}
              });


          d3.select(self.frameElement).style("height", "800px");

          function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 275; });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });


            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", click)
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide);

            nodeEnter.append("circle")
                .attr("r", 2)

            nodeEnter.append("text")
                .attr("x", function(d) { return d.children || d._children ? -15 : 20; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .attr("class", "text")
                .text(function(d) { return d.name; })
                .style("fill-opacity", 1);

            node.call(tip)

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", function(d) { 
                  if (d.departure == undefined)
                    return 5
                  else if (d.departure > 800000)
                    return 20
                  else if (d.departure > 500000)
                    return 15
                  else if (d.departure > 100000)
                    return 12
                  else if (d.departure > 50000)
                    return 10
                  else if (d.departure > 5000)
                    return 8
                  else
                    return scale(Math.sqrt(+d.departure)) 
                })
                .style("fill", function(d) { return d._children ? "fff" : "#0025A9"; });


            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                  var o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                  var o = {x: source.x, y: source.y};
                  return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });
          }

          // Toggle children on click.
          function click(d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
          }