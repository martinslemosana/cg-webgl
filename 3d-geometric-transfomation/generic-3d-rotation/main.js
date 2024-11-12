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
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let vertexData = [];
    let P1 = [0.0,0.0,0.0];
    let P2 = [1.0,0.0,0.0];
    vertexData = setCubeVertices(P1,P2,0.25);
    
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
   
    let axesData = [
        -5.0, 0.0, 0.0,
        5.0, 0.0, 0.0,
        0.0, 5.0, 0.0,
        0.0,-5.0, 0.0,
        0.0, 0.0, 5.0,
        0.0, 0.0,-5.0
    ];
   
    let axesColors = [
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25,
        0.25, 0.25, 0.25
    ];
    
    let v = [P2[0]-P1[0],P2[1]-P1[1],P2[2]-P1[2]];
    let cubeDirectionAxis = [
        P1[0]-5*v[0], P1[1]-5*v[1], P1[2]-5*v[2],
        P1[0]+5*v[0], P1[1]+5*v[1], P1[2]+5*v[2],
    ];
   
    let cubeDirectionAxisColors = [
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
    ];
   
   
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
   
    let theta = 0.0;
    matrix = defineRotationMatrix(P1,P2,theta);
   
    function keyDown(event){
        switch(event.key){
            case "ArrowLeft":
            theta += 5;
            break;
            case "ArrowRight":
                theta -= 5;
                break;
        }
        matrix = m4.identity();
        matrix = m4.multiply(matrix,defineRotationMatrix(P1,P2,theta));
        drawCube();
    }
   
    const buttonElement = document.getElementById("ler_P1_P2");
    buttonElement.addEventListener("click", onClick);
   
    function onClick(event){
        let x1 = parseFloat(document.getElementById("x1").value);
        let y1 = parseFloat(document.getElementById("y1").value);
        let z1 = parseFloat(document.getElementById("z1").value);
        let x2 = parseFloat(document.getElementById("x2").value);
        let y2 = parseFloat(document.getElementById("y2").value);
        let z2 = parseFloat(document.getElementById("z2").value);
        P1 = [x1,y1,z1];
        P2 = [x2,y2,z2];
        vertexData = setCubeVertices(P1,P2,0.25);
        v = [P2[0]-P1[0],P2[1]-P1[1],P2[2]-P1[2]];
        cubeDirectionAxis = [
            P1[0]-5*v[0], P1[1]-5*v[1], P1[2]-5*v[2],
            P1[0]+5*v[0], P1[1]+5*v[1], P1[2]+5*v[2],
        ];
        drawCube();
    }
   
    function drawCube(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axesData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axesColors), gl.STATIC_DRAW);
        matrix = m4.identity();
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.LINES, 0, axesData.length / 3);

        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeDirectionAxis), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeDirectionAxisColors), gl.STATIC_DRAW);
        matrix = m4.identity();
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.LINES, 0, 2);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
        matrix = defineRotationMatrix(P1,P2,theta);
        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
    }
   
    drawCube();
}
   
function defineRotationMatrix(P1,P2,theta){
    let m = m4.identity();

    let N = [P2[0]-P1[0],P2[1]-P1[1],P2[2]-P1[2]];
    let n = unitVector(N);

    if(n[0]==0 && n[1]==0){
        return m4.zRotation(degToRad(theta));
    }
    if(n[0]==0 && n[2]==0){
        return m4.yRotation(degToRad(theta));
    }
    if(n[1]==0 && n[2]==0){
        return m4.xRotation(degToRad(theta));
    }

    let a = n[0];
    let b = n[1];
    let c = n[2];
    let d = Math.sqrt(Math.pow(b,2)+Math.pow(c,2));

    let T_p1_origin = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        -P1[0], -P1[1], -P1[2], 1.0
    ];

    let Rx_alpha = [
        1.0, 0.0, 0.0, 0.0,
        0.0, c/d, b/d, 0.0,
        0.0, -b/d, c/d, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    let Ry_beta = [
        d, 0.0, a, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -a, 0.0, d, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    let Rz_theta = m4.zRotation(degToRad(theta));

    let T_origin_p1 = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        P1[0], P1[1], P1[2], 1.0
    ];

    m = m4.multiply(m,T_origin_p1);
    m = m4.multiply(m,m4.transpose(Rx_alpha));
    m = m4.multiply(m,m4.transpose(Ry_beta));
    m = m4.multiply(m,Rz_theta);
    m = m4.multiply(m,Ry_beta);
    m = m4.multiply(m,Rx_alpha);
    m = m4.multiply(m,T_p1_origin);

    return m;
}
   
function setCubeVertices(P1,P2,size){
    let vertexData = [];
    vertexData = [
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
    vertexData = vertexData.map(function(x) { return x * size; });

    let N = [P2[0]-P1[0],P2[1]-P1[1],P2[2]-P1[2]];
    let n = unitVector(N);
    let V = [0.0,1.0,0.0];
    let u = crossProduct(n,V);
    u = unitVector(u);
    let v = crossProduct(u,n);

    let rotatedVertexData = [];
    for(let i=0;i<vertexData.length;i+=3){
        rotatedVertexData.push((n[0]*vertexData[i]) + (v[0]*vertexData[i+1]) + (u[0]*vertexData[i+2]) + P1[0]);
        rotatedVertexData.push((n[1]*vertexData[i]) + (v[1]*vertexData[i+1]) + (u[1]*vertexData[i+2]) + P1[1]);
        rotatedVertexData.push((n[2]*vertexData[i]) + (v[2]*vertexData[i+1]) + (u[2]*vertexData[i+2]) + P1[2]);
    }

    return rotatedVertexData;
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