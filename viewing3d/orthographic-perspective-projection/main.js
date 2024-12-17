function main(){
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  
    if (!gl) {
        throw new Error('WebGL not supported');
    }
  
    var vertexShaderSource = document.querySelector("#vertex-shader").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader").text;
  
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  
    var program = createProgram(gl, vertexShader, fragmentShader);
  
    gl.useProgram(program);
    
    gl.enable(gl.DEPTH_TEST);
  
    const positionBuffer = gl.createBuffer();
  
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  
    const colorBuffer = gl.createBuffer();
  
    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    
    const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);
  
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
  
    let vertexData = setCubeVertices();
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    
    let colorData = setCubeColors();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
  
    gl.viewport(0,0,500,500);
    P0 = [1.0,1.0,2.0];
    P_ref = [0.0,0.0,0.0];
    V = [0.0,1.0,0.0];
    let viewingMatrix = set3dViewingMatrix(P0,P_ref,V);
    xw_min = -1.0;
    xw_max = 1.0;
    yw_min = -1.0;
    yw_max = 1.0;
    z_near = -1.0;
    z_far = -20.0;
    let viewingProjctionMatrix = [];
  
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
  
    function keyDown(event){
      switch(event.key){
        case "1":
          let orthographicMatrix = ortographicProjection(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
          viewingProjctionMatrix = m4.identity();
          viewingProjctionMatrix = m4.multiply(viewingProjctionMatrix,orthographicMatrix);
          viewingProjctionMatrix = m4.multiply(viewingProjctionMatrix,viewingMatrix);
          break;
        case "2":      
          let perspectiveMatrix = perspectiveProjection(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
          viewingProjctionMatrix = m4.identity();
          viewingProjctionMatrix = m4.multiply(viewingProjctionMatrix,perspectiveMatrix);
          viewingProjctionMatrix = m4.multiply(viewingProjctionMatrix,viewingMatrix);
          break;
      }
    }
  
    let theta = 0.0;
  
    function drawCube(){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      theta += 1.0;
  
      let modelMatrix = m4.identity();
      modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
      modelMatrix = m4.translate(modelMatrix,0.0,0.0,1.0);
      modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
      let matrix = m4.identity();
      matrix = m4.multiply(matrix,viewingProjctionMatrix);
      matrix = m4.multiply(matrix,modelMatrix);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
      modelMatrix = m4.identity();
      modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
      modelMatrix = m4.translate(modelMatrix,0.0,0.0,-1.0);
      modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
      matrix = m4.identity();
      matrix = m4.multiply(matrix,viewingProjctionMatrix);
      matrix = m4.multiply(matrix,modelMatrix);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
      modelMatrix = m4.identity();
      modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
      modelMatrix = m4.translate(modelMatrix,1.0,0.0,0.0);
      modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
      matrix = m4.identity();
      matrix = m4.multiply(matrix,viewingProjctionMatrix);
      matrix = m4.multiply(matrix,modelMatrix);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
      modelMatrix = m4.identity();
      modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
      modelMatrix = m4.translate(modelMatrix,-1.0,0.0,0.0);
      modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
      matrix = m4.identity();
      matrix = m4.multiply(matrix,viewingProjctionMatrix);
      matrix = m4.multiply(matrix,modelMatrix);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
      requestAnimationFrame(drawCube);
    }
  
    drawCube();
  }
  
  function setCubeVertices(){
    const vertexData = [
      // Front
      0.5, 0.5, 0.5,
      0.5, -.5, 0.5,
      -.5, 0.5, 0.5,
      -.5, 0.5, 0.5,
      0.5, -.5, 0.5,
      -.5, -.5, 0.5,
  
      // Left
      -.5, 0.5, 0.5,
      -.5, -.5, 0.5,
      -.5, 0.5, -.5,
      -.5, 0.5, -.5,
      -.5, -.5, 0.5,
      -.5, -.5, -.5,
  
      // Back
      -.5, 0.5, -.5,
      -.5, -.5, -.5,
      0.5, 0.5, -.5,
      0.5, 0.5, -.5,
      -.5, -.5, -.5,
      0.5, -.5, -.5,
  
      // Right
      0.5, 0.5, -.5,
      0.5, -.5, -.5,
      0.5, 0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, -.5, 0.5,
      0.5, -.5, -.5,
  
      // Top
      0.5, 0.5, 0.5,
      0.5, 0.5, -.5,
      -.5, 0.5, 0.5,
      -.5, 0.5, 0.5,
      0.5, 0.5, -.5,
      -.5, 0.5, -.5,
  
      // Bottom
      0.5, -.5, 0.5,
      0.5, -.5, -.5,
      -.5, -.5, 0.5,
      -.5, -.5, 0.5,
      0.5, -.5, -.5,
      -.5, -.5, -.5,
    ];
    return vertexData;
  }
  
  function setCubeColors(){
    function randomColor() {
      return [Math.random(), Math.random(), Math.random()];
    }
  
    let colorData = [];
    for (let face = 0; face < 6; face++) {
      let faceColor = randomColor();
      for (let vertex = 0; vertex < 6; vertex++) {
          colorData.push(...faceColor);
      }
    }
    return colorData;
  }
  
  function set3dViewingMatrix(P0,P_ref,V){
    let matrix = [];
    let N = [
      P0[0] - P_ref[0],
      P0[1] - P_ref[1],
      P0[2] - P_ref[2],
    ];
    let n = unitVector(N);
    let u = unitVector(crossProduct(V,n));
    let v = crossProduct(n,u);
  
    let T = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -P0[0], -P0[1], -P0[2], 1,
    ];
    let R = [
      u[0], v[0], n[0],  0,
      u[1], v[1], n[1],  0,
      u[2], v[2], n[2],  0,
         0,    0,    0,  1,
    ];
  
    matrix = m4.multiply(R,T);
    return matrix;
  }
  
  function ortographicProjection(xw_min,xw_max,yw_min,yw_max,z_near,z_far){
    let matrix = [
      2/(xw_max-xw_min), 0, 0, 0,
      0, 2/(yw_max-yw_min), 0, 0,
      0, 0, -2/(z_near-z_far), 0,
      -(xw_max+xw_min)/(xw_max-xw_min), -(yw_max+yw_min)/(yw_max-yw_min), (z_near+z_far)/(z_near-z_far), 1,
    ];
    return matrix;
  }
  
  function perspectiveProjection(xw_min,xw_max,yw_min,yw_max,z_near,z_far){
    let matrix = [
      -(2*z_near)/(xw_max-xw_min), 0, 0, 0,
      0, -(2*z_near)/(yw_max-yw_min), 0, 0,
      (xw_max+xw_min)/(xw_max-xw_min), (yw_max+yw_min)/(yw_max-yw_min), (z_near+z_far)/(z_near-z_far), -1,
      0, 0, -1, 0,
    ];
    return matrix;
  }
  
  function crossProduct(v1,v2){
    let result = [
        v1[1]*v2[2] - v1[2]*v2[1],
        v1[2]*v2[0] - v1[0]*v2[2],
        v1[0]*v2[1] - v1[1]*v2[0]
    ];
    return result;
  }
  
  function unitVector(v){ 
    let result = [];
    let vModulus = vectorModulus(v);
    return v.map(function(x) { return x/vModulus; });
  }
  
  function vectorModulus(v){
    return Math.sqrt(Math.pow(v[0],2)+Math.pow(v[1],2)+Math.pow(v[2],2));
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