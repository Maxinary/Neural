function bounds(arr){
  var bounds = [arr[0], arr[0]]
  for(var i in arr){
    if(arr[i] !== undefined){
      if(arr[i] < bounds[0]){
        bounds[0] = arr[i];
      }
      if(arr[i] > bounds[1]){
        bounds[1] = arr[i];
      }
    }
  }
  return bounds;
}

function map(x, minIn, maxIn, minOut, maxOut){
  return (x-minIn)/(maxIn-minIn) * (maxOut-minOut) + minOut
}

function graph(arr, ctx, x, y, w, h){
  var bound = bounds(arr);
  bound[0] = Math.floor(bound[0]);
  bound[1] = Math.ceil(bound[1]);
  var fontSize = 16;
  
  var newx = x+(""+bound[0]).length*fontSize;
  var newh = h-fontSize;
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "5px";
  //draw axes
  ctx.beginPath();
  ctx.moveTo(newx, y);
  ctx.lineTo(newx,y+newh);
  ctx.lineTo(x+w,y+newh);
  ctx.stroke();
  
  //label axes
  ctx.font="16px Monospace";
  ctx.fillText(bound[1], x, y+fontSize);
  ctx.fillText(bound[0], x, y+newh);
  ctx.fillText(0, newx, y+h);
  ctx.fillText(arr.length, x+w-(""+arr.length).length*fontSize, y+h);
  
  ctx.beginPath();
  ctx.moveTo(map(0, 0, arr.length, newx, x+w), map(arr[0], bound[0], bound[1], y+newh, y))
  for(var i in arr){
    if(arr[i] === undefined)  break;
    var tx = map(i, 0, arr.length, newx, x+w);
    var ty = map(arr[i], bound[0], bound[1], y+newh, y);
    
    ctx.fillRect(tx-2,ty-2,5,5);
    ctx.lineTo(tx, ty)
  }
  ctx.stroke();
}