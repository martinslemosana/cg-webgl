function main(){
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  
    if (!gl) {
        throw new Error('WebGL not supported');
    }
  
    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  
    var program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
  
    const positionBuffer = gl.createBuffer();
  
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);
    const colorUniformLocation = gl.getUniformLocation(program, `color`);
  
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
  
    let positionVector = [];
  
    let ty_right_bar = 0.0;
    let ty_left_bar = 0.0;
    function keyDown(event){
      switch(event.key){
        case "ArrowUp":
          ty_right_bar+=0.1;
          break;
        case "ArrowDown":
          ty_right_bar-=0.1;
          break;
        case "w":
          ty_left_bar+=0.1;
          break;
        case "s":
          ty_left_bar-=0.1;
          break;
      }
    }
  
    let tx_ball = 0.0;
    let ty_ball = 0.0;
    let tx_ball_step = 0.005;
    let ty_ball_step = 0.007;
  
    let n = 30;
    let radius = 0.05;
  
    let matrix = [];
    let colorVector = [];
  
    function drawCircle(tx_ball,ty_ball){
      colorVector = [1.0,0.0,0.0];
      gl.uniform3fv(colorUniformLocation,colorVector);
  
      positionVector = circleVertices(radius,n);
      gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
      
      matrix = m4.identity();
      matrix = m4.translate(matrix,tx_ball,ty_ball,0.0);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      
      gl.drawArrays(gl.TRIANGLE_FAN, 0, n+2);
    }
    
    function drawBar(tx_bar,ty_bar){
      colorVector = [0.0,0.0,0.0];
      gl.uniform3fv(colorUniformLocation,colorVector);
      
      positionVector = barVertices(-0.025, -0.1, 0.05, 0.2);
      gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
      
      matrix = m4.identity();
      matrix = m4.translate(matrix,tx_bar,ty_bar,0.0);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  
    function drawCentralLine(){
      colorVector = [0.0,0.0,0.0];
      gl.uniform3fv(colorUniformLocation,colorVector);
  
      positionVector = [
        0.0, 1.0,
        0.0,-1.0,
      ];
      gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
  
      matrix = m4.identity();
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
  
      gl.drawArrays(gl.LINES, 0, 2);
    }
  
    function drawScene(){
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      if(tx_ball > 0.95 || tx_ball < -0.95)
        tx_ball_step = -tx_ball_step;
      tx_ball += tx_ball_step;
      if(ty_ball > 1.0 || ty_ball < -1.0)
        ty_ball_step = -ty_ball_step;
      ty_ball += ty_ball_step;
  
      if((tx_ball>=0.95 && (ty_ball<ty_right_bar-0.15 || ty_ball>ty_right_bar+0.15))){
        console.log('perdeu!')
        tx_ball = 0.0;
        ty_ball = 0.0;
      }
  
      if((tx_ball<=-0.95 && (ty_ball<ty_left_bar-0.15 || ty_ball>ty_left_bar+0.15))){
        console.log('perdeu!')
        tx_ball = 0.0;
        ty_ball = 0.0;
      }
  
      drawCircle(tx_ball,ty_ball);
      drawBar(0.975,ty_right_bar);
      drawBar(-0.975,ty_left_bar);
      drawCentralLine();
  
      requestAnimationFrame(drawScene);
    }
  
    drawScene();
  }
  
  
  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
  
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
  
  function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
  
  function circleVertices(radius,n){
    let vertexData = [0.0, 0.0];
    
    for(let i=0;i<n;i++)
        vertexData.push(...[radius*Math.cos(i*(2*Math.PI)/n),radius*Math.sin(i*(2*Math.PI)/n)]);
    
    vertexData.push(...[radius*Math.cos(0*(2*Math.PI)/n),radius*Math.sin(0*(2*Math.PI)/n)]);
    
    return vertexData;
  }
  
  function barVertices(x, y, width, height){
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    
    let vertexData = [
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ];
    
    return vertexData;
  }
  
  var m4 = {
    identity: function() {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    },
  
    multiply: function(a, b) {
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },
  
    translation: function(tx, ty, tz) {
      return [
          1,  0,  0,  0,
          0,  1,  0,  0,
          0,  0,  1,  0,
          tx, ty, tz, 1,
      ];
    },
  
    xRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
  
      return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    yRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
  
      return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
    },
  
    zRotation: function(angleInRadians) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
  
      return [
          c, s, 0, 0,
        -s, c, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
      ];
    },
  
    scaling: function(sx, sy, sz) {
      return [
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ];
    },
  
    translate: function(m, tx, ty, tz) {
      return m4.multiply(m, m4.translation(tx, ty, tz));
    },
  
    xRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.xRotation(angleInRadians));
    },
  
    yRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.yRotation(angleInRadians));
    },
  
    zRotate: function(m, angleInRadians) {
      return m4.multiply(m, m4.zRotation(angleInRadians));
    },
  
    scale: function(m, sx, sy, sz) {
      return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
  
  };
  
  function radToDeg(r) {
  return r * 180 / Math.PI;
  }
  
  function degToRad(d) {
  return d * Math.PI / 180;
  }
  
  main();