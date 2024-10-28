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
    const colorBuffer = gl.createBuffer();
  
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
    const colorLocation = gl.getAttribLocation(program, `color`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
  
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    canvas.addEventListener("mousedown",mouseClick,false);
  
    let positionVector = [0.0,0.0];
    function mouseClick(event){
      let x = event.clientX * (2/canvas.width) - 1;
      let y = 1 - event.clientY * (2/canvas.height);
      positionVector = [x,y];
      drawPoint();
    }
  
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
  
    let colorVector = [0.0,0.0,0.0];
    function keyDown(event){
      switch(event.key){
        case "0":
          colorVector = [0.0,0.0,0.0];
          break;
        case "1":
          colorVector = [1.0,0.0,0.0];
          break;
        case "2":
          colorVector = [0.0,1.0,0.0];
          break;
        case "3":
          colorVector = [0.0,0.0,1.0];
          break;
        case "4":
          colorVector = [1.0,1.0,0.0];
          break;
        case "5":
          colorVector = [0.0,1.0,1.0];
          break;
        case "6":
          colorVector = [1.0,0.0,1.0];
          break;
        case "7":
          colorVector = [1.0,0.5,0.5];
          break;
        case "8":
          colorVector = [0.5,1.0,0.5];
          break;
        case "9":
          colorVector = [0.5,0.5,1.0];
          break;
      }
      drawPoint();
    }
  
    function drawPoint(){
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorVector), gl.STATIC_DRAW);
      gl.drawArrays(gl.POINTS, 0, 1);
    }
  
    drawPoint();
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
  
  main();