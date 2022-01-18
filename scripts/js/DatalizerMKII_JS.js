/*------ Parse Config File------------------------------------------------- */

var verificationHeaderArray = [];
var scienceQuestionArray = [];

//This function excecutes when the configuration file is chosen
function readConfFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var fileContentArray = this.result.split(/\r\n|\n/);
    console.log(fileContentArray);

    var headerLine = grabVerHeader(fileContentArray);

    console.log(headerLine);
    if (headerLine == null)         //Testing to see if a verification header was returneed by grabVerHeader
    {
      return { 
        error: true,
        message: 'No valid verification header'
      }
    }

    verificationHeaderArray = headerLine;     // setting the global version of the headerLine

    console.log("Before");
    var body = getConfBody(fileContentArray);
    if(body == null)
    {
      window.alert("Error: Config Syntax Error");
      return;
    }
    scienceQuestionArray = body;           //setting the global science Question Array
    populateScienceQuestionDropdown();
  };
  reader.readAsText(file);
}

//This function populates the Science question dropdown from the global science question array
function populateScienceQuestionDropdown()
{
  var selectScienceQuestion = document.getElementById("selectScienceQuestion");

  //looping through the global science question array setting each position 0 of the 2d array to populate the dropdown
  for(var i = 0; i < scienceQuestionArray.length; i++) {
    var opt = scienceQuestionArray[i][0];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectScienceQuestion.appendChild(el);
  }

}

//function gets the verification header
function grabVerHeader(fileContentArray)
{
  var headerLine = fileContentArray[0];
  console.log(headerLine);
  if(headerLine.startsWith("%") && headerLine.endsWith("%")){
    console.log(headerLine);
    var validHLine = headerLine.substring(
      headerLine.indexOf("%") + 1, 
      headerLine.lastIndexOf("%")
    );
    console.log(validHLine);
    var newHeaderArray = validHLine.split(',');
    return newHeaderArray;
  }
  else{
    console.log("Error: No valid verification header");
    window.alert("Error: No valid verification header");
    return null;
  }

}

function getConfBody(fileContentArray)
{
  var data2DArray = [];                    //holds the main 2d Array
  console.log(fileContentArray.length - 1);
  var fileBodyString = fileContentArray[0];

  for(let i = 1; i <= fileContentArray.length - 1; i++)      //Looping through the file and putting everything into one singular string
  {
    fileBodyString = fileBodyString + fileContentArray[i];
  }
  console.log(fileBodyString);

  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;

  var stopLoop = true;
  var lastPosition = 0;

  console.log(fileBodyString.length - 1);
  //loop searches for the < at the start of a science question. Then makes calls to functions to populate the science question array.
  while(stopLoop)
  {
      switch(close) {
        case false:
          var percentPosition = fileBodyString.indexOf("<",lastPosition);
          console.log(percentPosition);
          if(percentPosition == -1)  //"<" not found
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < fileBodyString.length -1) // testing if the percent position overruns the length of the string
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            startPercentPos = percentPosition;
            console.log("Start: "+ startPercentPos);
            close = true; //"< found"
          }
          break;
        case true:
          var percentPosition = fileBodyString.indexOf(">",lastPosition);
          console.log(percentPosition);
          if(percentPosition == -1)  //">" not found
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < fileBodyString.length -1) // testing if the percent position overruns the length of the string
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            closePercentPos = percentPosition;
            console.log("Stop: "+ closePercentPos);
            var scienceQuestion = fileBodyString.substring(startPercentPos+1,closePercentPos); // holds the actual science question
            console.log(scienceQuestion);
            var graphArray = getGraphs(closePercentPos,fileBodyString); // holds the array of graphs
            if(graphArray == null) //returns null if an error was found
            {
              return null;
            }
            console.log(graphArray);
            var arrayLineItem = [];
            arrayLineItem.push(scienceQuestion);
            for(let i = 0; i < graphArray.length; i++) // loop pushes each header into the Science question array
            {
              arrayLineItem.push(graphArray[i]);
            }
            console.log(arrayLineItem);
            data2DArray.push(arrayLineItem);
            close = false;
          }
          break;
        default:
          return null;
      }
  }

  return data2DArray;
}

// this function is intended to specifically isolate "{}" in the file
function getGraphs(closeAngleBracketPos,fileBodyString)
{
  var graphString;
  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;


  var stopLoop = true;
  var lastPosition = closeAngleBracketPos;

  console.log(fileBodyString.length - 1);

  //loop searches for the { at the start of a graph list. then searches for the }. If found it passes the substring to getGraphArray
  while(stopLoop)
  {
    switch(close) {

      case false:
        var percentPosition = fileBodyString.indexOf("{",lastPosition);
        console.log(percentPosition);
        if(percentPosition == -1)
        {
          stopLoop = false;
        }
        else{

          if(percentPosition + 1 < fileBodyString.length -1)
          {
            lastPosition = percentPosition + 1;
          }
          else{
            stopLoop = false;
          }
          startPercentPos = percentPosition;
          console.log("Start I: "+ startPercentPos);
          close = true; //"{" found
        }
        break;

      case true:
        var percentPosition = fileBodyString.indexOf("}",lastPosition);
        console.log(percentPosition);
        if(percentPosition == -1)
        {
          stopLoop = false;
        }
        else{

          if(percentPosition + 1 < fileBodyString.length -1)
          {
            lastPosition = percentPosition + 1;
          }
          else{
            stopLoop = false;
          }
          closePercentPos = percentPosition;
          console.log("Stop I: "+ closePercentPos);
          if(startPercentPos+1 < closePercentPos){
          graphString = fileBodyString.substring(startPercentPos+1,closePercentPos); //getting the substring of the two {}
          console.log(graphString);
          } 
          else{
            graphString = null;
          }
          close = false;
          stopLoop = false;
        }
        break;

      default:
        return null;
    }
  }

  if(graphString != null)
  {
    var graphArray = getGraphArray(graphString);

    if(graphArray == null || graphArray === undefined || graphArray.length == 0)
    {
      return null;
    }

    return graphArray;
  }
  else{
    return null;
  }

}

function getGraphArray(graphString)
{
  var graphsArray = [];
  var startPercentPos = 0;
  var closePercentPos = 0;
  var close = false;
  var error = false;

  var stopLoop = true;
  var lastPosition = 0;

  //loop searches for the [ at the start of a graph key. then searches for the ]. If found it splits the substring and verifies that each item is a valid member of the verification header
  while(stopLoop)
  {
      switch(close) {
        case false:
          var percentPosition = graphString.indexOf("[",lastPosition);
          console.log(percentPosition);
          if(percentPosition == -1)
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < graphString.length -1)
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            startPercentPos = percentPosition;
            console.log("Start: "+ startPercentPos);
            close = true;
          }
          break;
        case true:
          var percentPosition = graphString.indexOf("]",lastPosition);

          console.log(percentPosition);
          if(percentPosition == -1)
          {
            stopLoop = false;
          }
          else{

            if(percentPosition + 1 < graphString.length -1)
            {
              lastPosition = percentPosition + 1;
            }
            else{
              stopLoop = false;
            }
            closePercentPos = percentPosition;
            console.log("Stop: "+ closePercentPos);

            if(startPercentPos + 1 < closePercentPos){

              var graphs = graphString.substring(startPercentPos+1,closePercentPos);

              console.log(graphs);

              var graphSub = graphs.split(',');

              if(verifyHeaderItem(graphSub[0]))   //verifying that the item is valid
              { 
                graphsArray.push(graphSub[0]);
              }
              else{
                stopLoop = true;
                error = true;
              }

              if(verifyHeaderItem(graphSub[1]))   //verifying that the item is valid
              { 
                graphsArray.push(graphSub[1]);
              }
              else{
                stopLoop = true;
                error = true;
              }
            } 
            else{
              stopLoop = true;
              error = true;
            }
            close = false;
          }
          break;
        default:
          return null;
      }
    
    
  }
  console.log("Array: " + graphsArray);

  if(error)
  {
    console.log("Entered");
    return null;

  }
  return graphsArray;

}

//this function verifies that the item is in the verification header
function verifyHeaderItem(item)
{
  for(let i = 0; i < verificationHeaderArray.length; i++){
    if(item.toLowerCase() == verificationHeaderArray[i].toLowerCase())
    {
      return true;
    }
  }
  console.log("ERROR");
  return false;
}

/*------ Plot Graph-------------------------------------------------------- */
var headerDataArray = [];
var bodyDataArray = [];

function readDataFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var fileContentArray = this.result.split(/\r\n|\n/);
    var headerLine = splitHeader(fileContentArray);
    console.log("in read --> " + headerLine);
    var headerSize = headerLine.length;
    console.log(headerSize);

    //parsing the body of the data
    var bodyArray = splitBody(headerSize, fileContentArray);
    console.log(bodyArray);

    //Setting global arrays
    headerDataArray = headerLine;
    bodyDataArray = bodyArray;

    populateDropdowns(headerLine);
  };
  reader.readAsText(file);
}

function splitHeader(fileContentArray)
{
  var headerLine = fileContentArray[0].split(',');
  console.log(headerLine);
  return headerLine;
}

function splitBody(headerSize,fileContentArray)
{
  var dataArray = [];
  var headerLine = fileContentArray[0].split(',');

  for(let i = 0; i < headerSize; i++)                         //Creating each array column of the multidimensional Array
  {
      dataArray.push([]);
  }
  console.log(dataArray);
  
  for(let j = 1; j < fileContentArray.length - 1; j++)            //First loop is looping through the file line by line
  {
    var parseLine = fileContentArray[j].split(',');

    for(let k = 0; k < headerSize; k++)                       //Looping through each line item, item by item
    {
      dataArray[k].push(parseLine[k]);
    }

  }

  return dataArray;
}

function populateDropdowns(headerArray)
{
  var selectX = document.getElementById("selectX");
  var selectY = document.getElementById("selectY");

  for(var i = 0; i < headerArray.length; i++) {
    var opt = headerArray[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectX.appendChild(el);
  }
  for(var i = 0; i < headerArray.length; i++) {
    var opt = headerArray[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    selectY.appendChild(el);
  }

}



//This function is called by the Plot button and is designed to allow the user to manually input a comparison to graph
function plotGraph()
{
  console.log(bodyDataArray);

  var xSelection = document.getElementById("selectX");
  var ySelection = document.getElementById("selectY");
  console.log("X = " +xSelection);
  console.log("Y = " +ySelection);
  var xPosition = xSelection.value;
  var yPosition = ySelection.value;
  console.log("X = " + xPosition);
  console.log("Y = " + yPosition);
  
  var xIndex = -1;
  var yIndex = -1;
  
  var count = 0;

  do //this loop finds the position of the label in the header array
  {
    if(xPosition == headerDataArray[count])
    {
      xIndex = count;
    }
    if(yPosition == headerDataArray[count])
    {
      yIndex = count;
    }
    count++;
  }while(count < headerDataArray.length)

  console.log("X = " + xIndex);
  console.log("Y = " + yIndex);

  if (xIndex == -1 || yIndex == -1)
  {
    console.log("Error: No data selected");
    window.alert("Error: No data selected");
  }
  else
  {
    plot(xIndex,yIndex);
  }

}


//This function is called by the Plot Science Question button and is designed to plot the science question
function plotScienceQuestion()
{
  console.log("SQ" + bodyDataArray);

  var sQSelection = document.getElementById("selectScienceQuestion");
  console.log("SQ = " +sQSelection);
  var sQPosition = sQSelection.value;
  console.log("SQ = " + sQPosition);

  
  var sQIndex = -1;
  
  var count = 0;

  do //this loop finds the array that holds the selected science question
  {
    if(sQPosition == scienceQuestionArray[count][0])   //Since the Science question is always held in position zero of the array Itterate through till the Question is found
    {
      sQIndex = count;
    }
    count++;
  }while(count < scienceQuestionArray.length)

  console.log("X = " + sQIndex);

  if (sQIndex == -1)
  {
    console.log("Error: No data selected");
    window.alert("Error: No data selected");
  }
  else
  {

    for(let i = 1; i <scienceQuestionArray[sQIndex].length; i = i+2)     //itterate through the array starting at position 1 skipping every even position as that is the y position of the pair
    {

      var xIndex = -1;
      var yIndex = -1;
      
      var count = 0;
    
      do   // find the header item in the header array
      {
        console.log(scienceQuestionArray[sQIndex][i]);
        console.log(scienceQuestionArray[sQIndex][i+1]);
        console.log(headerDataArray[count]);
        if(scienceQuestionArray[sQIndex][i] == headerDataArray[count])
        {
          xIndex = count;
        }
        if(scienceQuestionArray[sQIndex][i+1] == headerDataArray[count])
        {
          yIndex = count;
        }
        count++;
      }while(count < headerDataArray.length)

      if (xIndex == -1 || yIndex == -1)   //Header not found in the data set
      {
        console.log("Error: No Header found in the data set");
        window.alert("Error: No Header found in the data set");
      }
      else
      {
        plot(xIndex,yIndex);
      }

    }
  }

}

//this function is used to plot the x, y data it accepts as parameters. It is built with the ability to plot more than one singular graph
function plot(xIndex,yIndex)
{
  var titleTEXT = headerDataArray[xIndex]+" vs "+ headerDataArray[yIndex];
    var trace1 =
    {
        x: bodyDataArray[xIndex],
        y: bodyDataArray[yIndex],
        type: 'scatter'

    };

    var layout = {
      title: {
        text: titleTEXT,
        font: {
          family: 'Courier New, monospace',
          size: 24
        },
        xref: 'paper',
        x: 0.05,
      },
      xaxis: {
        title: {
          text: headerDataArray[xIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: headerDataArray[yIndex],
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    };

    console.log('Called');
    var data = [trace1];

///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality Start ///////////////////////////////////////////////
  // Finding total number of elements added
  var total_element = $(".element").length;
 
  // last <div> with element class id
  var lastid = $(".element:last").attr("id");
  var split_id = lastid.split("_");
  var nextindex = Number(split_id[1]) + 1;

  var max = 8; // Setting the maximum number of the graphs that the program will allow

  // Check total number elements
  if(total_element < max ){
   // Adding new div container after last occurance of element class
   $(".element:last").after("<div class='element' id='div_"+ nextindex +"'></div>");
 
   // Adding element to <div>
   $("#div_" + nextindex).append("<div class='pt-4'><button id='remove_" + nextindex + "' class='remove'>X</button>"+"<div class=' pt-1 w-75 'id='txt_"+ nextindex +"' style='height:500px;'></div> </div>");
 
  }

   // Remove element
 $('.container').on('click','.remove',function(){
 
  var id = this.id;
  var split_id = id.split("_");
  var deleteindex = split_id[1];

  // Remove <div> with id
  $("#div_" + deleteindex).remove();

 }); 


  Plotly.newPlot("txt_"+ nextindex +"", data,layout);
///////////////////////////////////////////////////////////////////////////////////////////// Multi Functionality End //////////////////////////////////////////////////
    
}

function clearGraphs()
{
  $('.container').html("<div class='element' id='div_1'></div><div id='txt_1' style='width:1200px;height:500px;'></div>");
}

function allScreenshot()
{
  var myPlot = document.getElementById('txt_2');
  myPlot.on('plotly_relayout', function(data){
    Plotly.toImage(data).then((dataURI) => {
      console.log(dataURI);
    });
  });
}

$('#btnExport').click(function(){
  //var title = $("<p>Image Here</p>");
  //$("#content").append(title);
    // Finding total number of elements added
    var total_element = $(".element").length;
 
    // last <div> with element class id
    var lastid = $(".element:last").attr("id");
    var split_id = lastid.split("_");
    var nextindex = Number(split_id[1]);
    console.log(nextindex);
    console.log(document.getElementById('imageFileType').value);
    if(nextindex < 2)
    {
      window.alert("Error: You have created no graphs.");
    }
    for(let i =2; i <= nextindex; i++)
    {
      var divGraph = $('#graph');
      Plotly.toImage('txt_'+ i, { format: document.getElementById('imageFileType').value, width: 1200, height: 500 }).then(function (dataURL) {
        console.log(dataURL);
        dataURLtoFile(dataURL, "File", i - 1);
      });
    }

});

function  dataURLtoFile(dataUrl, fileName, graphNumber){
     var arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
     while(n--){
        u8arr[n] = bstr.charCodeAt(n);
     }
     var bb = new File([u8arr], fileName, {type:mime});
     var a = document.createElement('a');
     a.download = 'graph '+graphNumber+'.' + document.getElementById('imageFileType').value;
     a.href = window.URL.createObjectURL(bb);
     a.click();

     return;

 }

/////////// Event Listeners ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.getElementById('file-input').addEventListener('change', readDataFile, false);  // Listener for the Data File input

document.getElementById('CONFIG_FILE').addEventListener('change', readConfFile, false);  // Listener for the Data File input