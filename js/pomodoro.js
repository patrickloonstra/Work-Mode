var clockRadius = 250;
var clockColors = ['blue','red','green'];
var invertColors = false;
var isRunning = onBreak = settingChange = counterClockwise = false; // initialize booleans
var update; // this will be variable that updates DOM
var frac=0;
var wav = 'http://soundbible.com/grab.php?id=2154&type=mp3'; // sound file
var audio = new Audio(wav);
  // initialize canvas settings:
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute('width', clockRadius);
canvas.setAttribute('height', clockRadius);

  // functions
function drawBorder(){
  ctx.beginPath();
  ctx.arc(clockRadius/2,clockRadius/2,clockRadius/2-3,0,2*Math.PI,counterClockwise);
  ctx.lineWidth=5;
  ctx.strokeStyle=clockColors[0];
  ctx.stroke();
}
function drawArc() {
  var beginArc = -Math.PI/2;
  var endArc = -Math.PI/2 + frac*2*Math.PI;
  ctx.beginPath();
  ctx.arc(clockRadius/2,clockRadius/2,clockRadius/2-8,beginArc,endArc,counterClockwise);
  ctx.lineWidth=5;
  if (onBreak) {
    ctx.strokeStyle=clockColors[2];
  }
  else {
    ctx.strokeStyle=clockColors[1];
  }
  ctx.stroke();
}
function startClock() {
  function refresh() {
    var start = convertTime($(".time").html());
    if (settingChange) {
      ctx.clearRect(0,0,clockRadius,clockRadius);
      drawBorder();
    }
    drawArc();
    if (start-1 < 1) {
      changeSession();
    }
    else {
      var now = convertToTime(start - 1);
      frac = 1-((start - 1) / beginTime);
      $('.time').html(now);
      return now;
    }
  }
  if (!isRunning) {
    var btime = convertTime($('#brnum').html());
    var stime = convertTime($('#snum').html());
    var beginTime,now,atBeginning;
    if (onBreak) {
      $('.current-session').html('Break');
      now = btime;
      atBeginning = (now === convertTime($("#brnum").html() + ':00'));
      if (atBeginning) {
        beginTime = now;
      }
      else {
        beginTime = convertTime($("#brnum").html() + ':00');
      }
    }
    else {
      $('.current-session').html('Session');
      now = stime;
      atBeginning = (now === convertTime($("#snum").html() + ':00'));
      if (atBeginning) {
        beginTime = now;
      }
      else {
        beginTime = convertTime($("#snum").html() + ':00');
      }
    }
    update = window.setInterval(refresh, 1000);
    isRunning = true;
  }
}
function stopClock() {
  window.clearInterval(update);
  isRunning = false;
}
function resetClock() {
  stopClock();
  var output;
  if (onBreak) {
    output = $('#brnum').html();
  }
  else {
    output = $('#snum').html();
  }
  $('.time').html(output);
  ctx.clearRect(0,0,clockRadius,clockRadius);
  frac = 0;
  drawBorder();
  drawArc();
}
function changeSession() {
  audio.play();
  if (onBreak) {
    onBreak = false;
    if (invertColors) {
      $('html').css({'filter': 'invert(0%)'});
    }
  }
  else {
    onBreak = true;
    if (invertColors) {
      $('html').css({'filter': 'invert(100%)'});
    }
  }
  resetClock();
  startClock();
  drawBorder();
}
function convertTime(time) {
  if (isNaN(time)) {
    time = time.split(':');
    var min = time[0];
    var sec = time[1];
    return 60*Number(min)+Number(sec);
  }
  else {
    return Number(time)*60;
  }
}
function convertToTime(sec) {
  var min = Math.floor(sec / 60);
  var secRem = sec - min*60;
  if (secRem < 10) {
    secRem = '0' + secRem;
  }
  return min + ':' + secRem;
}

  // click events:
$('.settings button').on('click',function(){
  if (!isRunning) {
  var breakLength = convertTime($('#brnum').html()+':00');
  var sessionLength = convertTime($('#snum').html()+':00');
  var operation = $(this).attr('value');
  var parent = $(this).parent();
  var end;
  if (parent.hasClass('break-length')) {
    switch(operation) {
      case '-':
        breakLength -= 60;
        break;
      case '+':
        breakLength += 60;
        break;
                    }
    if (breakLength < 60) {
      breakLength = 60;
    }
    breakLength = convertToTime(breakLength);
    end = breakLength.length;
    breakLength = breakLength.substr(0,end-3); // remove :00
    if (onBreak) {
      $('.time').html(breakLength);
      settingChange = true;
    }
    $('#brnum').html(breakLength);
  }
  else if (parent.hasClass('session-length')) {
    switch(operation) {
      case '-':
        sessionLength -= 60;
        break;
      case '+':
        sessionLength += 60;
        break;
                    }
    if (sessionLength < 60) {
      sessionLength = 60;
    }
    sessionLength = convertToTime(sessionLength);
    end = sessionLength.length;
    sessionLength = sessionLength.substr(0,end-3); // remove :00
    if (!onBreak) {
      $('.time').html(sessionLength);
      settingChange = true;
    }
    $('#snum').html(sessionLength);
  }
  }
});
$('.clock').on('click',function(){
  if (isRunning) {
    stopClock();
  }
  else {
    startClock();
  }
});
$('.panel #start').on('click',startClock);
$('.panel #stop').on('click',stopClock);
$('.panel #reset').on('click',resetClock);

  // init:
drawBorder();
