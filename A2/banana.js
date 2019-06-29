"use strict";

var canvas;
var gl;

var NEAR = -1;
var FAR = 3.0;

// supposed to be in lookAt's eye?
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;

var FOVY = 60.0;  // Field-of-view in Y direction angle (in degrees)
var ASPECT = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye = vec3(0, 0, 10);
let numAttribPerElement;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const stomp = (p, c) => p.concat(c);
const indices = get_faces().reduce(stomp).map((v) => {
    return v - 1;
});

var vertices = get_vertices().map((v, i) => {
    return vec4(v, 1.0);
});

// TRY: manual indexing
// vertices = indices.map((v, i) => {
//     // console.log(vertices[v - 1]);
//     return vertices[v];
// });

var colors = [
];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    ASPECT = canvas.width / canvas.height;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    // gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    const numPositionElements = 4;
    const numColorElements = 0;
    numAttribPerElement = numPositionElements + numColorElements;

    gl.vertexAttribPointer(
        vPosition, // Attribute location
        numPositionElements, // number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        numAttribPerElement * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0
    );

    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW);

    // var vColor = gl.getAttribLocation( program, "vColor");
    // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColor);

    render();
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(FOVY, ASPECT, NEAR, FAR);

    // changing eye doesn't do anything
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    window.mvm = modelViewMatrix;
    window.pvm = projectionMatrix;

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // gl.drawArrays( gl.TRIANGLES, 0, vertices.length );
    
    gl.drawElements( gl.TRIANGLES, indices.length , gl.UNSIGNED_SHORT, 0 );
    
    // TRY: manual indexing
    // gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    // requestAnimFrame(render);
    // window.requestAnimFrame(render);
}
