let rangeMin = 100;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangePrice = document.querySelectorAll(".range-price input");

const margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;
const radius = 6;

var jsonData = (function(){
  var json = null;
  var id = 0;
  var tempMap = new Map();
  $.ajax({
    'async': false,
    'global': false,  
    'url': "/DLdata.json",
    'dataType': "json",
    'success': function(data) {
      json = data;
    }
  });
  json.forEach(e => {
    id = id + 1;
    tempMap.set(id.toString(),e);
  })
  return tempMap;
})();

function CreateNetworkDataset(){
  let processedData = [];
  let authorNetwork = document.getElementById("authorNetwork").checked;
  let citeationNetwork = document.getElementById("citeationNetwork").checked;
  let choosenAuthor = document.getElementById("searchBar").value;
  
  let tempData = jsonData;
  let Networkdata = {nodes:[],edges:[]};
  let minValue = returnValue()[0];
  let maxValue = returnValue()[1];
  let usedCitaRange = false;

  if(minValue == 0 && maxValue == 1000)
  {
    tempData.forEach(e => {
      processedData.push(e);
    });
    usedCitaRange = false;
  }
  else
  {
    tempData.forEach(e => {
    
    if(choosenAuthor === e.author && e.citeCount >= minValue && e.citeCount <= maxValue)
      processedData.push(e);

    if(choosenAuthor === "" && e.citeCount >= minValue && e.citeCount <= maxValue)
      processedData.push(e);

     
    });
    usedCitaRange = true;
  }

  if(!processedData.length)
  {
    alert("There was no element within the citation range!");
  }

  if(authorNetwork === true && choosenAuthor !== "")
  {
    processedData.forEach(e => {
        if(choosenAuthor === e.author)
        {
          let hasAuthor = Networkdata.nodes.some(node => node["id"] === e.author);
          if(hasAuthor === false)
            Networkdata.nodes.push({id : e.author});

          if(usedCitaRange){
            e.coAuthor.forEach(coauthor => {
              tempData.forEach(data => {
                if(data.author === coauthor && data.citeCount >= minValue && data.citeCount <= maxValue)
                {
                  let hasAuthor = Networkdata.nodes.some(node => node["id"] === coauthor);
                  if(hasAuthor === false)
                    Networkdata.nodes.push({id :  coauthor});

                  Networkdata.edges.push({source : e.author, target : coauthor});
                };
              });
            });
          }else{
            e.coAuthor.forEach(coauthor => {
              let hasAuthor = Networkdata.nodes.some(node => node["id"] === coauthor);
              if(hasAuthor === false)
                Networkdata.nodes.push({id :  coauthor}); 
      
              Networkdata.edges.push({source : e.author, target : coauthor});
            });
          };
        };
      }); 
  }
  else if(citeationNetwork === true && choosenAuthor !== "")
  {
    processedData.forEach(e => {
      if(choosenAuthor === e.author)
      {
        let hasAuthor = Networkdata.nodes.some(node => node["id"] === e.author);
        if(hasAuthor === false)
          Networkdata.nodes.push({id : e.author});

        Object.entries(e.references).map(reference => {
          let hasReference = Networkdata.nodes.some(node => node["id"] === reference[0]);
          if(hasReference === false)
            Networkdata.nodes.push({id : reference[0]});

          Networkdata.edges.push({source : e.author, target : reference[0]});
        });
      };
    }); 
  }
  else
  {
    if(authorNetwork === true)
    {
      processedData.forEach(e => {
        let hasAuthor = Networkdata.nodes.some(node => node["id"] === e.author);
        if(hasAuthor === false)
          Networkdata.nodes.push({id : e.author});


          if(usedCitaRange){
            e.coAuthor.forEach(coauthor => {
              tempData.forEach(data => {
                if(data.author === coauthor && data.citeCount >= minValue && data.citeCount <= maxValue)
                {
                  let hasAuthor = Networkdata.nodes.some(node => node["id"] === coauthor);
                  if(hasAuthor === false)
                    Networkdata.nodes.push({id :  coauthor});

                  Networkdata.edges.push({source : e.author, target : coauthor});
                };
              });
            });
          }else{
            e.coAuthor.forEach(coauthor => {
              let hasAuthor = Networkdata.nodes.some(node => node["id"] === coauthor);
              if(hasAuthor === false)
                Networkdata.nodes.push({id :  coauthor}); 
      
              Networkdata.edges.push({source : e.author, target : coauthor});
            });
          };
      }); 
    }
    else if(citeationNetwork === true)
    {
      processedData.forEach(e => {
        let hasAuthor = Networkdata.nodes.some(node => node["id"] === e.author);
        if(hasAuthor === false)
          Networkdata.nodes.push({id : e.author});

        Object.entries(e.references).map(reference => {
          let hasReference = Networkdata.nodes.some(node => node["id"] === reference[0]);
          if(hasReference === false)
            Networkdata.nodes.push({id :  reference[0]});

          Networkdata.edges.push({source : e.author, target : reference[0]});
        }) 
      });
    };
  };
  return Networkdata;
};

function WorkedTogether(){
  let unprocessedData = jsonData;
  let workedTogether = [];

  let authorNetwork = document.getElementById("authorNetwork").checked;
  if(authorNetwork === true)
  {
    unprocessedData.forEach(e => {
      e.coAuthor.forEach(author => {
          workedTogether.push([e.author,author]);
        });
    });
  }
  else
  {
    unprocessedData.forEach(e => {
      Object.entries(e.references).map(reference => {
        workedTogether.push([e.author,reference[0]]);
      });
    });
  };
  return workedTogether;
};

function EdgeThickness(edges){
  var workedTogetherData = WorkedTogether();
  let amountWorkedTogether = 0;
  workedTogetherData.forEach(e =>{
    if((edges.source.id === e[0] || edges.source.id === e[1]) && (edges.target.id === e[0] || edges.target.id === e[1]))
      amountWorkedTogether = amountWorkedTogether + 1;
    });
    return amountWorkedTogether;
};

function releasedPaper(node){
  let unprocessedData = jsonData;
  let releasedPaper = new Map();
  
  unprocessedData.forEach(e => {
    releasedPaper.set(e.author, e.publishedArticle)  
  });

  var radius = releasedPaper.get(node.id);
  if(typeof(radius) === "undefined")
    return 5;
  if(radius <= 25)
    return 10;
  if(radius <= 50)
    return 15;
  if(radius <= 75)
    return 18;
  if(radius <= 100)
    return 20;

  return 25;
}

function GenerateNetwork(){
  var data = CreateNetworkDataset();

  var svg = d3.select("#networkContainer")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().on("zoom", function (event) {
        svg.attr("transform", event.transform);
     }))
     .append("g");

  var simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.edges).id(function(d) { return d.id; }).distance(50))         
    .force("charge", d3.forceManyBody().strength(-1000).theta(0.5).distanceMax(400))
    .force("collision",d3.forceCollide().radius(function(d){return (d.radius+10);}))
    .force("center", d3.forceCenter(width/2, height/2))
    .on("tick", ticked).alpha(0.1).restart();

  var edge = svg
      .selectAll("line")
      .data(data.edges)
      .enter().append("line")
        .attr("stroke-width", function(e){
          return EdgeThickness(e);
        })
        .style("stroke","#747157");
        
    edge.append("title")
        .text(function(d){
          return ("Papers publisched together: " + EdgeThickness(d).toString());
        });

    edge.on("mouseover", function(d){
          d3.select(this).style('stroke', 'red')})
        .on("mouseout", function(e){
          d3.select(this).style("stroke","#747157");
            });
            
  var node = svg
      .append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
        .call(d3.drag()
        .on("start",dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  
    node.append("circle")
        .attr("stroke", "#7c795d")
        .attr("stroke-width", 1.5)
        .attr("fill","#ebeae9")
        .attr("r", function(e){
          return releasedPaper(e);
        })
        .on("mouseover", function(d){
          d3.select(this).attr('fill', '#747157');
        })
        .on("mouseout", function(e){
          d3.select(this).attr('fill', "#ebeae9");
        });

    node.append("text")
        .attr("fill", "#353327")
        .attr("text-anchor", "middle")
        .attr("y", function(e){
          return -(releasedPaper(e));
        })
        .text(d => d.id);

    node.append("title")
        .text(d => {
          for (const [ key, value ] of Object.entries(GetPublishedArticle(d.id))) {
            return ("Papers publisched "+value.value.toString())
          } 
        });

    node.on("click",function(node){
        var papers = GetPapers(node.target.__data__.id)[0];
        var clickOnAuthor = GetPapers(node.target.__data__.id)[1]
        var completelist= document.getElementById("writtenPapers");
        completelist.innerHTML = "";
        console.log(node)

        if(clickOnAuthor){
          papers.forEach(e => {
            completelist.innerHTML += "<li>" + "<strong>" + e[0] +"</strong>" + "<p>" +  " <b>Citation: </b>" + e[1] + 
            ", <b>Co Authors: </b>" + e[2] + " <b>Doi: </b>" + "<a href=" + e[3]  + ">" + e[3] + "</a>" +"</p>"+ "</li>";
          });
        }
        else{
          console.log()
          papers.forEach(e => {
            completelist.innerHTML += "<li>" + "<strong>" + node.target.__data__.id +"</strong>" + "<p>" + "<b>Written by Authors: </b>"+ e[0] + "</p>"+ 
            "<p>" +  " <b>Referenced by: </b>" + e[1] + "</p>" + "<p>" + "<b>In paper: </b>"+e[2] + "</p>"+ "</li>";
          });
        };        
      });

      function GetPublishedArticle(author){
        let unprocessedData = jsonData;
        let publishedArticles = []
        unprocessedData.forEach(e => {
          if(e.author === author)
          {
            publishedArticles.push({key: e.author, value: e.publishedArticle})
          }
        });
        return publishedArticles
      };

    function GetPapers(author){
      let unprocessedData = jsonData;
      let papers = [];
      let clickOnAuthor = new Boolean(true);

      unprocessedData.forEach(e => {
        if(e.author === author)
        {
          papers.push([e.title,e.citeCount,e.coAuthor,e.doi]);
          clickOnAuthor = true
        }
        else
        {
          Object.entries(e.references).map(reference => {
            if(reference[0] === author)
            {
              papers.push([reference[1],e.author,e.title]);
              clickOnAuthor = false;
            };
          });
        };
      });
      return [papers,clickOnAuthor];
    };

    function ticked(){
      edge
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("transform", d => `translate(${d.x = Math.max(radius, Math.min((width*4) - radius, d.x))},
          ${d.y = Math.max(radius, Math.min((height*4) - radius, d.y))})`);
    };

    function dragstarted(event,d){
      if (!event.active) simulation.alphaTarget(0.1).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    function dragged(event,d){
        d.fx = event.x;
        d.fy = event.y;
    };
    
    function dragended(event,d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };
    document.getElementById("draw").hidden = true;
    document.getElementById("reDraw").hidden = false;
};

function redraw(){
  var svg = d3.select("#networkContainer");

  svg.selectAll("line").remove();
  svg.selectAll("g").remove();
  
  GenerateNetwork();
};

function loadSearchData(){
  let tempData = jsonData;
  let authorList = document.getElementById('authorList');
  let paperList = document.getElementById('paperList');
  let tempdict =  {author:[]};

  tempData.forEach(e => {
    let hasAuthor = tempdict.author.some(author => author["id"] === e.author);
      if(hasAuthor === false)
      {
        let author = document.createElement("a");
        author.innerText = e.author;
        author.classList.add("listItem");
        authorList.appendChild(author);
        tempdict.author.push({id : e.author});
      };
        let paper = document.createElement("a");
        paper.innerText = e.title;
        paper.classList.add("listItem");
        paperList.appendChild(paper);
  });
};

function paperSearch(){
  let listContainer = document.getElementById('paperList');
  let listItems = document.getElementsByClassName('listItem');
  let input = document.getElementById('searchBarPaper').value;
  input = input.toLowerCase(); 

  let noResults = true;
  for (i = 0; i < listItems.length; i++){ 
      if (!listItems[i].innerHTML.toLowerCase().includes(input) || input === ""){
          listItems[i].style.display="none";
          continue;
      }
      else{
          listItems[i].style.display="flex";
          noResults = false; 
      };
  };
  listContainer.style.display = noResults ? "none" : "block";
};

function changePaperValue(){
  let tempData = jsonData;
  let listContainer = document.getElementById('paperList');
  var completelist= document.getElementById("writtenPapers");

  listContainer.addEventListener("click", (e) => {
    document.getElementById('searchBarPaper').value = e.target.innerHTML
    listContainer.style.display="none"
    completelist.innerHTML = "";

    tempData.forEach(data => {
      if(data.title === e.target.innerHTML)
      {
        completelist.innerHTML += "<li>" + "<strong>" + "Author: " + "</strong>" + data.author +"<p>"+ 
        " <b>Title: </b>"+ data.title + "</p>"+"<p>" +  " <b>Citation: </b>" + data.citeCount + 
        ", <b>Co Authors: </b>" + data.coAuthor + " <b>Doi: </b>" + 
        "<a href=" + data.doi + ">" + data.doi + "</a>" + "</p>"+ "</li>";
      };
    });
  });
};

function authorSearch(){
  let listContainer = document.getElementById('authorList');
  let listItems = document.getElementsByClassName('listItem');
  let input = document.getElementById('searchBar').value;
  input = input.toLowerCase(); 

  let noResults = true;
  for (i = 0; i < listItems.length; i++){ 
      if (!listItems[i].innerHTML.toLowerCase().includes(input) || input === "") {
          listItems[i].style.display="none";
          continue;
      }
      else{
          listItems[i].style.display="flex";
          noResults = false;
      };
  };
  listContainer.style.display = noResults ? "none" : "block";
};

function changeAuthorValue(){
  let listContainer = document.getElementById('authorList');

  listContainer.addEventListener("click", (e) => {
    document.getElementById('searchBar').value = e.target.innerHTML;
    listContainer.style.display="none";
    });
};

function returnValue(){
  return [rangeInput[0].value,rangeInput[1].value];
};

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minRange = parseInt(rangeInput[0].value);
    let maxRange = parseInt(rangeInput[1].value);

    if (maxRange - minRange < rangeMin) 
    {
      if (e.target.className === "min") 
        rangeInput[0].value = maxRange - rangeMin;
      else 
        rangeInput[1].value = minRange + rangeMin;
    }
    else {
      rangePrice[0].value = minRange;
      rangePrice[1].value = maxRange;
      range.style.left = (minRange / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
    };
  });
});
