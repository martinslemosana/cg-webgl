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
    
    const matrix = mat4.create();
    mat4.scale(matrix, matrix, [0.25, 0.25, 1.0]);
    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
  
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let positionVector = [
        -0.5,-0.5,
        -0.5, 0.5,
         0.5,-0.5,
        -0.5, 0.5,
         0.5,-0.5,
         0.5, 0.5,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVector), gl.STATIC_DRAW);
    
    let colorVector = [Math.random(),Math.random(),Math.random()];
    gl.uniform3fv(colorUniformLocation,colorVector);
  
    let theta = 0.0;
    let tx = 0.0;
    let ty = 0.0;
    let tx_step = 0.01;
    let ty_step = 0.02;
  
    function drawSquare(){
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      theta += 2.0;
      if(tx > 1.0 || tx < -1.0)
        tx_step = -tx_step;
      tx += tx_step;
      if(ty > 1.0 || ty < -1.0)
        ty_step = -ty_step;
      ty += ty_step;
  
      mat4.identity(matrix);
      mat4.translate(matrix, matrix, [tx, ty, 0.0]);
      mat4.rotateZ(matrix, matrix, degToRad(theta));
      mat4.scale(matrix, matrix, [0.25, 0.25, 1.0]);
      gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
  
      requestAnimationFrame(drawSquare);
    }
  
    drawSquare();
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
  
function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}
  
main();