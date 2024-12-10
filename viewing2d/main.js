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
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let vertexData = [];
    vertexData = setSquareVertices([-0.5,-0.5],1.0,1.0);
    
    function randomColor() {
        return [Math.random(), Math.random(), Math.random()];
    }
    
    let colorData = [];
    let faceColor = randomColor();
    colorData = setSquareColor(faceColor);
       
    let theta = 0.0;
    let tx = 0.0;
    let tx_step = 0.01;
    let ty = 0.0;
    let ty_step = 0.01;
    let w = 1.0;
    let w_step = 0.01;
    let matrix = m4.identity();
    function drawSquare(){
        gl.clear(gl.COLOR_BUFFER_BIT);
  
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
        if(w>=2.0 || w<=0.5)
          w_step = -w_step;
        w += w_step;
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
        matrix = set2dViewingMatrix([0.0,0.0],0.0);
        viewingMatrix = set2dViewingMatrix([0.0,0.0],0.0);
        clippingWindowMatrix = set2dClippingWindow(-w,w,-w,w);
        matrix = m4.multiply(viewingMatrix,clippingWindowMatrix);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
        gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
        theta += 2.0;
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
        matrix = set2dViewingMatrix([0.0,0.0],theta);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
        gl.viewport(0, 0, canvas.width/2, canvas.height/2);
        if(tx>=1.0 || tx<=-1.0)
          tx_step = -tx_step;
        tx += tx_step;
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
        matrix = set2dViewingMatrix([tx,0.0],0.0);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
        gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
        if(ty>=1.0 || ty<=-1.0)
          ty_step = -ty_step;
        ty += ty_step;
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
        matrix = set2dViewingMatrix([0.0,ty],0.0);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  
        requestAnimationFrame(drawSquare);
    }
    
    drawSquare();
}
  
function setSquareVertices(P,width,height){
    let x1 = P[0];
    let y1 = P[1];
    let x2 = x1 + width;
    let y2 = y1 + height;
    let vertexData = [];
    vertexData = [
        x1, y1, 0.0,
        x2, y1, 0.0,
        x1, y2, 0.0,  
        x1, y2, 0.0,
        x2, y1, 0.0,
        x2, y2, 0.0,
    ]

    return vertexData;
}
  
function setSquareColor(color){
    let colorData = [];
    for (let vertex = 0; vertex < 6; vertex++) {
        colorData.push(...color);
    }
    return colorData;
}
  
function set2dViewingMatrix(P0, angle){
    let m = m4.identity();
    m = m4.zRotate(m,degToRad(-angle));
    m = m4.translate(m,-P0[0],-P0[1],0.0);
    return m;
}
  
function set2dClippingWindow(xw_min,xw_max,yw_min,yw_max){
    let m = m4.identity();
    m = m4.translate(m,-1.0,-1.0,0.0);
    let sx = 2/(xw_max-xw_min);
    let sy = 2/(yw_max-yw_min);
    m = m4.scale(m,sx,sy,1.0);
    m = m4.translate(m,-xw_min,-yw_min,0.0);
    return m;
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

    transpose: function(m){
        return [
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
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
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
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
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
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