//=============================================================================\\
//                        TwitchViewer.JS - viewing monitor                     \\
//                              made by nullcheats                               \\
//================================================================================\\

/*
These are the only variables we will be needing for this project
YaxisMax is the maximum number of views we would like to "display up to"
Temp = array to store our "Viewer count" results
update = array to store our "Timer count" results
streamer = Target to monitor
MonitoringTime = monitoring time in minutes
Log = blank 2D array to allow us to create a log output for "CSV"
*/
let YaxisMax = 80; // This is the maximum number  of views we plan to reach !
var Temp = []; // This is the "Y" axis (this is our view count)
let update = []; // This is the "X" axis (this is our time count)
let streamer; // Streamer name we would like to monitor
let MonitoringTime = 30; // Time in minutes 
let i = 0; // We use this to count up to "60" (1 min delays)
var Log = [
   ["Minute", "Views"],
];


/*
This function is ran on body load of the web page
The main purpose is to stop our "Timer" as it gets started automatically
This is not the best way but it works fine for our purposes
*/
const Start = () => {
   StopTimer();
}

/*
The "Run function is called from our "Start monitoring" button
Once clicked this function will check a name was entered into the "text box"
Once the name has been verified it will then invoke our next function "MonitorMethod"
Here we also start our timer again for 60,000 MS (60 seconds) so the function runs once a minute
As you can see we also "Close" our Modal here / popup and this is so the user can see the chart
*/
const Run = () => {
   if (document.getElementById("ChannelName").value) {
      streamer = document.getElementById("ChannelName").value;
      i = 0;
      MonitorMethod();
      TimerLoop = setInterval(MonitorViews, 60000);
      CloseModal();
   } else {
      console.log("Please enter a channel name !");
   }
}

/*
This is a basic function to return the average number of viewers
This simply takes our Array (Temp) and gets the average of the numbers within the array
*/
const AverageViewers = () => {
   const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
   return Math.round(average(Temp) * 100) / 100;
}

/*
Just like "AverageViewers" here we simply return the maximum viewers
As you can see here we also pass the array "Temp" to get the maximum number stored
*/
const MaxViewers = () => {
   return Math.max.apply(0, Temp);
}

/*
This function is simply setup to return the "Minumum" views we have logged
Just like Max views we simply pass the "Temp array" here and find the smallest number
*/
const MinViewers = () => {
   return Math.min.apply(0, Temp)
}

/*
Here is a very simple function to stop our "Timer" / "Interval"
We mainly use this on-start so we do not have a running timer with no purpose
*/
const StopTimer = () => {
   clearInterval(TimerLoop);
}

/*
This is our "Main method" that we use to grab the view counts and "store the values"
As you can see here we start by simply requesting the twitch API with the streamer as the target
Once we have made a request we then parse the JSON response and get the "CurrentViews" as an amount
This amount is then stored into "Update" and "Temp"
Temp array stores "Current view counter"
Update array stores "I" (our counter we declared)
Here we also update the text values of our HTML boxes for min,max & average views 
This function is ran via our "set interval" timer as you can see below
*/
const MonitorMethod = () => {
   fetch('https://api.twitch.tv/helix/streams?user_login=' + streamer, {
      headers: {
         'Content-Type': 'application/json',
         'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
   }).then(response => response.text()).then((parse) => {
      let JsonData = JSON.parse(parse);
      if (Object.keys(JsonData.data).length) {
         let CurrentViews = JsonData.data[0].viewer_count;
         console.log("Viewer count -> " + CurrentViews);
         update.push(i + "min");
         Temp.push(CurrentViews);
         myChart.update();
         Log.push([i, CurrentViews]);
         document.getElementById("AVGC").innerHTML = AverageViewers(); // break to function maybe
         document.getElementById("MAXC").innerHTML = MaxViewers();
         document.getElementById("MINC").innerHTML = MinViewers();
         document.getElementById("ONLINE").style.color = "#008000";
         document.getElementById("ONLINE").innerHTML = "online";
      } else {
         StopTimer();
         document.getElementById("ONLINE").style.color = "Red";
         document.getElementById("ONLINE").innerHTML = "offline";
         //alert("Channel is offline");
      }
   });
}


/*
This function is to simply loop from 0-monitoring time
This function is invoked when our "Timer" / "Set interval" is active
Each interval is 60,000MS (60 seconds) so each increment will be 1 minute between
MonitoringTime = 30 with 60,000 MS (delay) = 30 minutes
*/
const MonitorViews = () => {
   i++;
   if (i <= MonitoringTime) {
      myChart.update();
      MonitorMethod();
   } else if (i >= MonitoringTime) {
      alert("Finished monitoring channel !");
      StopTimer();
   }
}

/*
This is our "Timer"/"Set interval"
As you can see it invokes "MonitorViews" every 60 seconds
*/
var TimerLoop = setInterval(MonitorViews, 60000); // 60,000 MS (1 minute)

/*
This is our function to simply grab the value of our range slider from the web page
As you can see here we simply get the value and then append our "Minutes" label in the modal
This is also where we set the "MonitoringTime" based on the value provided (between 5 minutes & 60)
*/
var TimeModal = document.getElementById("TimeMonitor");
document.getElementById("TimeMonitor").addEventListener('input', function() {
   document.getElementById("Minutes").innerHTML = TimeModal.value + " minutes";
   MonitoringTime = TimeModal.value;
});

/* 
This is a very simple function that will close the 'Modal'
This uses the Id of the Modal and hides the "display"  by setting it to 'none'
*/
const CloseModal = () => {
   var Modal = document.getElementById("Modal");
   Modal.style.display = "none";
}

/* 
This is a very simple function that will open the 'Modal'
This sets the style property to 'block'
*/
const OpenModal = () => {
   var Modal = document.getElementById("Modal");
   Modal.style.display = "block";
}

/*
This is a function to simply show/hide the stats boxes on the main page as a toggle
As you can see this uses our "Container" box to hide/show everything at the same time
If the checkbox is checked in the modal the container will be set to "Visible"
Elese the checkbox will be set to "Hidden"
*/
document.getElementById("ShowStats").addEventListener('change', function() {
   if (this.checked) {
      document.getElementById("DBcontainer").style.visibility = 'visible';
   } else {
      console.log("Not checked");
      document.getElementById("DBcontainer").style.visibility = 'hidden';
   }
});

/*
Just like the "ShowStats" function this just simply hides/shows the "Export" button
As you can see we locate our "downloadCSV" id within the form and simply change the style
If the "Logout" checkbox is checked it will be visible else it will be hidden
*/
document.getElementById("LogOutput").addEventListener('change', function() {
   if (this.checked) {
      document.getElementById("downloadCSV").style.visibility = 'visible';
   } else {
      document.getElementById("downloadCSV").style.visibility = 'hidden';
   }
});

/*
https://stackoverflow.com/questions/18848860/javascript-array-to-csv
This function from stack overflow simply allows us to output our 2D array to CSV
When we defined the "Array" ->  "Log" we pre-populated an input for the row headers
Because this is the first array element this gets put as our headers in the CSV export
*/
document.getElementById("downloadCSV").addEventListener("click", function() {
   const csv = Log.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"` : String(item)).join(',')).join('\n');
   const data = encodeURI('data:text/csv;charset=utf-8,' + csv);
   const link = document.createElement('a');
   link.setAttribute('href', data);
   link.setAttribute('download', 'export.csv');
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
});

/*
As you can see here this is our "Chart" via Charts.JS
This is a very basic line chart that is setup with a nice "Purple colour" for each data point
Axis X = (increments of minutes passed)
Axis Y = Current live views for the channel
*/
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
   type: 'line',
   data: {
      labels: update,
      datasets: [{
         data: Temp,
         label: "Streamer",
         borderColor: "#3e95cd",
         fill: true,
         lineTension: 0.1,
         backgroundColor: "rgba(102, 51, 153, 0.4)",
         borderColor: "rgba(102, 51, 153, 1)",
         borderCapStyle: 'butt',
         borderDash: [],
         borderDashOffset: 0.0,
         borderJoinStyle: 'miter',
         pointBorderColor: "rgba(102, 51, 153, 1)",
         pointBackgroundColor: "#fff",
         pointBorderWidth: 1,
         pointHoverRadius: 5,
         pointHoverBackgroundColor: "rgba(102, 51, 153, 1)",
         pointHoverBorderColor: "rgba(220,220,220,1)",
         pointHoverBorderWidth: 2,
         pointRadius: 3,
         pointHitRadius: 10
      }],
   },
   options: {
      scales: {
         yAxes: [{
            ticks: {
               max: YaxisMax,
               min: 0
            },
            gridLines: {
               display: false
            },
            scaleLabel: {
               display: true,
               labelString: 'Views',
               fontColor: "#fffff",
            }
         }],
      }
   },
   scales: {
      xAxes: [{
         display: false,
         scaleLabel: {
            display: true,
            labelString: 'Update',
            fontColor: "#546372",
         },
         gridLines: {
            display: false
         }
      }]
   }
});