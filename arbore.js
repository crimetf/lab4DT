var treeData = { 'name': 'A0', 'children': [ { 'name': 'Level 1: A0R', 'children': [ { 'name': 'Level 2: A0RR', 'children': [ { 'name': 'Level 3: A0RRR', 'children': [ { 'name': 'Level 4: A0RRRR', 'children': [ { 'name': 'Level 5: A0RRRRR = V' }, { 'name': 'Level 5: A0RRRRL = S' } ] }, { 'name': 'Level 4: A0RRRL', 'children': [ { 'name': 'Level 5: A0RRRLR = L' }, { 'name': 'Level 5: A0RRRLL = H' } ] } ] }, { 'name': 'Level 3: A0RRL', 'children': [ { 'name': 'Level 4: A0RRLR', 'children': [ { 'name': 'Level 5: A0RRLRR = B' }, { 'name': 'Level 5: A0RRLRL = .' } ] }, { 'name': 'Level 4: A0RRLL = N' } ] } ] }, { 'name': 'Level 2: A0RL', 'children': [ { 'name': 'Level 3: A0RLR', 'children': [ { 'name': 'Level 4: A0RLRR = I' }, { 'name': 'Level 4: A0RLRL = A' } ] }, { 'name': 'Level 3: A0RLL = R' } ] } ] }, { 'name': 'Level 1: A0L', 'children': [ { 'name': 'Level 2: A0LR', 'children': [ { 'name': 'Level 3: A0LRR = T' }, { 'name': 'Level 3: A0LRL = E' } ] }, { 'name': 'Level 2: A0LL = spatiu' } ] } ] }; 

function on_button() {
  const text=document.getElementById('ms').value;
  let v = [];
  Array.from(text).forEach((e, i) => {
      if (v[e]) {
          v[e] = v[e] + 1;
      } else
          v[e] = 1;
  });
  var keys = Object.keys(v).sort().reverse().sort((a, b) => {
      return v[a] - v[b];
  }).reverse();
  let sorted = [];
  keys.forEach((e, i) => {
      sorted[e] = v[e];
  });
  var treeData = construct(sorted, 0, keys.length, 'O', 'A', 0);
  draw_rest(treeData);
}

function construct(sorted, l, r, flag, name, level) {
    let node = {};
    keys = Object.keys(sorted);

    if (level == 0) {
        node['name'] = 'A0';
    } else {
        node['name'] = 'Level ' + level + ': ' +
            name.slice(name.indexOf(':') == -1 ? 0 : name.indexOf(':') + 2)
                + flag;
    }

    if (r - l == 1) {
        node['name'] = node['name'] + ' = ' + keys[l];
        return node;
    } 
    let sum = 0;
    for (let i = l; i < r; i++) {
        sum += sorted[keys[i]];
    }
    let ssum = 0;
    let index;
    for (let i = l; i < r; i++) {
        if (ssum + sorted[keys[i]] < sum/2) {
            ssum += sorted[keys[i]];
        } else {
            if (sum/2 - ssum < ssum + sorted[keys[i]] - sum/2) {
                index = i;
                break;
            }
            index = i + 1;
            break
        }
    }

    node['children'] =
        [construct(sorted, l, index, 'L', node['name'], level + 1),
        construct(sorted, index, r, 'R', node['name'], level + 1)];

    return node;
}

function draw_rest(treeData) {
  let margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 3060 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

	
  let svg = d3.select('body').append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate('
            + margin.left + ',' + margin.top + ')');

  let i = 0,
      duration = 750,
      root;
	  
  let treemap = d3.tree().size([height, width]);
  root = d3.hierarchy(treeData, function(d) { return d.children; });
  root.x0 = height / 2;
  root.y0 = 0;
  root.children.forEach(collapse);
  update(root);

  function collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }  

  function update(source) {
    let treeData = treemap(root);
    let nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);
    nodes.forEach(function(d){ d.y = d.depth * 180});
    let node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });
    var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
    })
      .on('click', click);
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style('fill', function(d) {
            return d._children ? 'lightsteelblue' : '#fff';
        });
    nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr('text-anchor', function(d) {
            return d.children || d._children ? 'end' : 'start';
        })
        .text(function(d) { return d.data.name; });
		
    let nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition()
      .duration(duration)
      .attr('transform', function(d) { 
          return 'translate(' + d.y + ',' + d.x + ')';
      });
    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style('fill', function(d) {
          return d._children ? 'lightsteelblue' : '#fff';
      })
      .attr('cursor', 'pointer');
	  
    let nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', function(d) {
          return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();
    nodeExit.select('circle')
      .attr('r', 1e-6);
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);
	  
    let link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });
	  
    let linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function(d){
        let o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });
	  
    let linkUpdate = linkEnter.merge(link);
    linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });
	  
    let linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        let o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
      });
	  
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }
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
  }
}
