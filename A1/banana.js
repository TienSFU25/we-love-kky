"use strict";

var gl;
var points;
const NUM_ELEMENTS_PER_POSITION = 2;
let dx = 0.0;
let dxLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // And, add our initial point into our array of points
    points = [
        vec2( 0.3, -0.6 ),
        vec2( 0.5, -0.6 ),
        vec2( 0.3, -0.8 ),
        vec2( 0.5, -0.8 ),
        // vec2(1.0, 1.0)
    ];

    let morePoints = [
        // vec2(1.0, 1.0)
    ];

    points = flatten(points);
    morePoints = flatten(morePoints);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    // console.log(new Float32Array(flatten(points)));

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, points, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, morePoints.length * Float32Array.BYTES_PER_ELEMENT, morePoints);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, NUM_ELEMENTS_PER_POSITION, gl.FLOAT, false, NUM_ELEMENTS_PER_POSITION * Float32Array.BYTES_PER_ELEMENT, 0 );
    gl.enableVertexAttribArray( vPosition );
    dxLoc = gl.getUniformLocation( program, "dx" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length / NUM_ELEMENTS_PER_POSITION );
    // gl.drawArrays( gl.TRIANGLES, 0, points.length / NUM_ELEMENTS_PER_POSITION );
    dx += 0.001;
    gl.uniform1f( dxLoc, dx );

    window.requestAnimFrame(render);
}
