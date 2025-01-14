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
    
    const positionLocation = gl.getAttribLocation(program, `aPosition`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    const normalBuffer = gl.createBuffer();
    
    const normalLocation = gl.getAttribLocation(program, `aNormal`);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    
    const colorBuffer = gl.createBuffer();
    
    const colorLocation = gl.getAttribLocation(program, `aColor`);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    
    const modelViewingProjectionMatrixUniformLocation = gl.getUniformLocation(program, `uModelViewingProjectionMatrix`);
    var lightPositionLocation = gl.getUniformLocation(program, `uLightPosition`);
    const modelMatrixUniformLocation = gl.getUniformLocation(program, `uModelMatrix`);
    gl.uniform3fv(lightPositionLocation, [0.0, 0.0, 3.0]);
    var viewPositionLocation = gl.getUniformLocation(program, `uViewPosition`);
    var shininessLocation = gl.getUniformLocation(program, `uShininess`);
    gl.uniform1f(shininessLocation, 100.0);
   
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    let vertexData = setCubeVertices();
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    
    let normalData = setCubeNormals();
    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    
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
    let viewingProjectionMatrix = [];
   
    gl.uniform3fv(viewPositionLocation, P0);
    
    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown",keyDown,false);
    
    function keyDown(event){
        switch(event.key){
            case "1":
                let orthographicMatrix = ortographicProjection(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
                viewingProjectionMatrix = m4.identity();
                viewingProjectionMatrix = m4.multiply(viewingProjectionMatrix,orthographicMatrix);
                viewingProjectionMatrix = m4.multiply(viewingProjectionMatrix,viewingMatrix);
                break;
            case "2": 
                let perspectiveMatrix = perspectiveProjection(xw_min,xw_max,yw_min,yw_max,z_near,z_far);
                viewingProjectionMatrix = m4.identity();
                viewingProjectionMatrix = m4.multiply(viewingProjectionMatrix,perspectiveMatrix);
                viewingProjectionMatrix = m4.multiply(viewingProjectionMatrix,viewingMatrix);
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
        let modelViewingProjectionMatrix = m4.identity();
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,viewingProjectionMatrix);
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,modelMatrix);
        gl.uniformMatrix4fv(modelViewingProjectionMatrixUniformLocation, false, modelViewingProjectionMatrix);
        var inverseModelMatrix = m4.inverse(modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(inverseModelMatrix);
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, inverseTransposeModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        
        modelMatrix = m4.identity();
        modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
        modelMatrix = m4.translate(modelMatrix,0.0,0.0,-1.0);
        modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
        modelViewingProjectionMatrix = m4.identity();
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,viewingProjectionMatrix);
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,modelMatrix);
        gl.uniformMatrix4fv(modelViewingProjectionMatrixUniformLocation, false, modelViewingProjectionMatrix);
        var inverseModelMatrix = m4.inverse(modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(inverseModelMatrix);
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, inverseTransposeModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        
        modelMatrix = m4.identity();
        modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
        modelMatrix = m4.translate(modelMatrix,1.0,0.0,0.0);
        modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
        modelViewingProjectionMatrix = m4.identity();
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,viewingProjectionMatrix);
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,modelMatrix);
        gl.uniformMatrix4fv(modelViewingProjectionMatrixUniformLocation, false, modelViewingProjectionMatrix);
        var inverseModelMatrix = m4.inverse(modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(inverseModelMatrix);
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, inverseTransposeModelMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
        
        modelMatrix = m4.identity();
        modelMatrix = m4.yRotate(modelMatrix,degToRad(theta));
        modelMatrix = m4.translate(modelMatrix,-1.0,0.0,0.0);
        modelMatrix = m4.scale(modelMatrix,0.5,0.5,0.5);
        modelViewingProjectionMatrix = m4.identity();
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,viewingProjectionMatrix);
        modelViewingProjectionMatrix = m4.multiply(modelViewingProjectionMatrix,modelMatrix);
        gl.uniformMatrix4fv(modelViewingProjectionMatrixUniformLocation, false, modelViewingProjectionMatrix);
        var inverseModelMatrix = m4.inverse(modelMatrix);
        var inverseTransposeModelMatrix = m4.transpose(inverseModelMatrix);
        gl.uniformMatrix4fv(modelMatrixUniformLocation, false, inverseTransposeModelMatrix);
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
    const colorData = [
        // Front
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Back
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Right
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,

        // Top
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,

        // Bottom
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
    ];
    return colorData;
}
    
function setCubeNormals(){
    const normalData = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
    ];
    return normalData;
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
        u[0], v[0], n[0], 0,
        u[1], v[1], n[1], 0,
        u[2], v[2], n[2], 0,
        0, 0, 0, 1,
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
    
    normalize: function(v, dst) {
        dst = dst || new MatType(3);
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            dst[0] = v[0] / length;
            dst[1] = v[1] / length;
            dst[2] = v[2] / length;
        }
        return dst;
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
   
    transpose: function(m, dst) {
        dst = dst || new Float32Array(16);
    
        dst[ 0] = m[0];
        dst[ 1] = m[4];
        dst[ 2] = m[8];
        dst[ 3] = m[12];
        dst[ 4] = m[1];
        dst[ 5] = m[5];
        dst[ 6] = m[9];
        dst[ 7] = m[13];
        dst[ 8] = m[2];
        dst[ 9] = m[6];
        dst[10] = m[10];
        dst[11] = m[14];
        dst[12] = m[3];
        dst[13] = m[7];
        dst[14] = m[11];
        dst[15] = m[15];
    
        return dst;
    },
   
    inverse: function(m, dst) {
        dst = dst || new Float32Array(16);
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;
    
        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
    
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
    
        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;
        dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
        dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
        dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
        dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
        dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
        dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
        dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
        dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
        dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
        dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
        dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
        dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));
    
        return dst;
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