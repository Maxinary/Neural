class Matrix extends Array{
  constructor(matrix){
    super();
    for(var i in matrix){
      this[i] = matrix[i];
    }
  }
  
  evaluate(vector){
    if(vector.length == this.length){
      var out = new Array(this[0].length).fill(0);
      for(var i in this){
        for(var j in this[i]){
          out[j] += this[i][j]*vector[i];
        }
      }
      
      return out;
    }else{
      throw "Dimension Mismatch: "+vector+" is length "+vector.length+" not "+this.length;
    }
  }
  
  apply(fn){
    return this.map(function(val, i){return val.map(function(x, j){return fn(x, i, j);});});
  }
  
  add(mat){
    return this.map(function(val, i){return val.map(function(x, j){return x+mat[i][j];});});
  }
}

function matrix(x,y,fn){
  var mx = [];
  for(var i=0; i<x; i++){
    var arr = [];
    for(var j=0; j<y; j++){
      arr.push(fn(i, j));
    }
    mx.push(arr);
  }
  return mx;
}

Matrix.zero = function(x, y){
  return new Matrix(matrix(x, y, function(i, j){return 0;}));
}

Matrix.random = function(x, y){
  return new Matrix(matrix(x, y, function(i, j){return Math.random();}));
}

Matrix.identity = function(x, y){
  return new Matrix(matrix(x, y, function(i, j){return i==j?1:0;}));
}