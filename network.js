//mimics class
function Rectifier(fn, deriv){
  fn.derivative = deriv;
  return fn;
}

class Layer extends Matrix{
  constructor(mat, rectifier){
    super(mat);//last array is biases
    
    if(rectifier === undefined){
      rectifier = Layer.rectifier.linear;
    }
    this.rectifier = rectifier;
  }
  
  evaluate(vector){
    //copy
    var copyvec = vector.slice();
    copyvec.push(1);//adding the bias
    var out = super.evaluate(copyvec);
    return [out, out.map(this.rectifier)];
  }
  
  apply(fn){
    var n = super.apply(fn);
    n.rectifier = this.rectifier;
    return n;
  }
  
  add(mat){
    var n = super.add(mat);
    n.rectifier = this.rectifier;
    return n;
  }
}

Layer.rectifier = {};

var sigmoid = (x => 1/(1+Math.exp(-x)));
Layer.rectifier.sigmoid = Rectifier(sigmoid, (x => sigmoid(x)*(1-sigmoid(x))));

Layer.rectifier.relu = Rectifier(x => x<0?Math.exp(x):x+1, x => x<0?Math.exp(x):1);

Layer.rectifier.linear = Rectifier(x => x, x => 1);

class Network{
  constructor(layerSizes, layerRectifiers, initialLearningRate){//assumes sequential layers
    this.layerSizes = layerSizes;
    this.layers = [];
    for(var i=1; i<layerSizes.length; i++){
      this.layers[i-1] = new Layer(matrix(layerSizes[i-1]+1,layerSizes[i], (x,y) => Math.random()*2-1), layerRectifiers[i-1]);
    }
    
    this.initialLearningRate = initialLearningRate;
    this.learningRate = initialLearningRate;
    this.prevError = undefined;
  }
  
  run(input){
    if(input.length != this.layerSizes[0]){
      throw "Dimension Mismatch"
    }
    var activations = new Array(this.layers.length+1);
    var outputs = new Array(this.layers.length+1);
    //evaluate sequentially (I know this is restrictive we'll change it later
    //                       to dynamically create a topological order of the
    //                       directed graph (with dummy nodes for recurrence?))
    
    activations[0] = new Array(input.length).fill(0);
    outputs[0] = input;
    for(var i=0; i<this.layers.length; i++){
      //this is i+1 because row 0 is input and subsequent rows are based on values
      var evaled = this.layers[i].evaluate(outputs[i]);
      activations[i+1] = evaled[0];
      outputs[i+1] = evaled[1];
    }
    
    return {"output":outputs, "activation":activations};
  }
  
  runClean(input){
    var r = this.run(input);
    return r["output"][r["output"].length-1];
  }
  
  learn(inputs, expecteds){//backpropogation
    //run
    
    var error = Array(expecteds[0].length).fill(0);
    
    var updates = this.layers.map(function(val, i){return new Layer(matrix(val.length, val[0].length, (x,y) => 0), val.rectifier)});
    
    var aggregateError = 0;
    for(var testNum in inputs){//do this many iterations of updating
      var input = inputs[testNum];
      var expected = expecteds[testNum];
      
      var runs = this.run(input);
      var activation = runs["activation"];
      var output = runs["output"];
      
      var dummythis = this;
      var dEdV = expected.map(function(val, i){return dummythis.layers[dummythis.layers.length-1].rectifier.derivative(activation[activation.length-1][i])*(output[output.length-1][i]-val);});

      var error = dEdV.reduce(function(sum, add){return sum+add*add/(2*dEdV.length);}, 0);
      aggregateError += error/inputs.length;
      
      for(var layer=this.layers.length-1; layer>=0; layer--){
        var newdEdV = new Array(this.layers[layer].length-1).fill(0);
        for(var j=0; j<this.layers[layer][0].length; j++){
          for(var i=0; i<this.layers[layer].length-1; i++){
            //update dEdV
            newdEdV[i] += this.layers[layer].rectifier.derivative(activation[layer][i])*dEdV[j]*this.layers[layer][i][j];//tested always a number
            //update weights
            //move at -dE/dM
            updates[layer][i][j] -= this.learningRate*dEdV[j]*output[layer][i];
            
          }
          //do the biases
          updates[layer][this.layers[layer].length-1][j] -= this.learningRate*dEdV[j];
        }
        dEdV = newdEdV.slice(0);
      }
    }
    
    //update layers
    this.layers = this.layers.map(function(val, i){return val.add(updates[i].apply((x,i,j)=>(x/inputs.length)))});
    
    if(this.prevError !== undefined){
      this.learningRate /= (aggregateError/this.prevError - 1) / 2 + 1;
    }
//      this.learningRate /= 1.0443;
//    }else{
//      this.learningRate *= 1.0443;
//    }
    this.prevError = aggregateError;
    
    return aggregateError;
  }
  
  draw(ctx, x, y, size, xpad, ypad){
    //draw lines
    for(var i in this.layers){
      for(var j in this.layers[i]){
        for(var k in this.layers[i][j]){
          ctx.lineWidth = this.layers[i][j][k]*size/32;
          ctx.strokeStyle = this.layers[i][j][k]<0?"#990000":"#006600";
          context.beginPath();
          context.moveTo(parseInt(i*(2+xpad)*size+size) + x, parseInt(j*(2+ypad)*size+size) + y);
          context.lineTo(parseInt((parseInt(i)+1)*(2+xpad)*size+size) + x, parseInt(k*(2+ypad)*size+size) + y);
          context.stroke();
        }
      }
    }
    
    //draw circles
    ctx.lineWidth = size/16;
    ctx.strokeStyle = "black";
    for(var i in this.layerSizes){
      ctx.fillStyle = "white";
      for(var j=0; j<this.layerSizes[i]; j++){
        ctx.beginPath();
        ctx.arc(parseInt(i*(2+xpad)*size+size) + x, parseInt(j*(2+ypad)*size+size) + y, size, size, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      if(i != this.layerSizes.length-1){
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(parseInt(i*(2+xpad)*size+size) + x, parseInt((this.layerSizes[i])*(2+ypad)*size+size) + y, size, size, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}