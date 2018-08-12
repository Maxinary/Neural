var realMatrix = new Matrix([[3,4,3],[4,12,5]]);
var canvas = document.getElementById("draw");
var context = canvas.getContext("2d");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

var n = new Network([2,3], [Layer.rectifier.linear], 0.01);

var itercount = 0;
var maxiter = 2048;
var batchsize = 512;

var errorlog = new Array(maxiter).fill(undefined);

var learn = function(){
  var ins = [];
  for(var i=0; i<batchsize; i++){ins.push(new Array(Math.random()*16-8, Math.random()*16-8));}
  
  var outs = new Array(ins.length);
  for(var i=0;i<outs.length;i++){outs[i] = realMatrix.evaluate(ins[i]);outs[i][1]+=2;}

//  console.log("Logarithmic total error after learning session "+itercount+": "+Math.log10(n.learn(ins, outs)));

  errorlog[itercount] = Math.log10(n.learn(ins, outs));

  context.clearRect(0,0,canvas.width,canvas.height);
  n.draw(context, 0, 0, 20, 1, 1);
  
  graph(errorlog,context,250,0,600,400)
  
  itercount++;
  if(itercount >= maxiter){
    clearInterval(learn);
  }
  if(itercount<maxiter){
  requestAnimationFrame(learn);
  }
}

learn();