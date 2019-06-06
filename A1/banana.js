"use strict";

let gl;
let allVertices;

// "game objects"
let playa;
let playaProjectiles;
// let projectiles = [
    // {x: 0.4, y: 0.2, d: false},
    // {x: 0.6, y: 0.3, d: true}
// ];
let badGuys;
let badGuyProjectiles;

// let dx = 0.0;
// let dxLoc;

const NUM_ELEMENTS_PER_POSITION = 2;
const NUM_BAD_GUYS_PER_ROW = 4;
const PROJECTILE_SPEED = 0.005;
const BAD_GUY_SPEED = 0.001;
const XUNIT = 0.05;
const SQ_SIZE = 0.1;

const T_SIZE = 0.025;

// point is some vec2
const sqPointToTriangles = (point) => {
    const {x, y} = point;

    return [
        vec2(x - SQ_SIZE, y + SQ_SIZE),
        vec2(x + SQ_SIZE, y + SQ_SIZE),
        vec2(x + SQ_SIZE, y - SQ_SIZE),
        vec2(x - SQ_SIZE, y + SQ_SIZE),
        vec2(x - SQ_SIZE, y - SQ_SIZE),
        vec2(x + SQ_SIZE, y - SQ_SIZE)        
    ]
};

// true = facing down
const tPointToTriangle = (point) => {
    const {x, y, d} = point;
    const m = d ? 1 : -1;

    return [
        vec2(x - T_SIZE / 2, y + m * T_SIZE),
        vec2(x + T_SIZE / 2, y + m * T_SIZE),
        vec2(x, y - m * T_SIZE),
    ];
};

const makePlayaProjectile = () => {
    return {
        x: playa.x, y: playa.y + 2*SQ_SIZE, d: false
    };
};

const stomp = (p, c) => p.concat(c);

const updateGameObjects = () => {
    let projectiles = playaProjectiles.concat(badGuyProjectiles);

    // move projectiles
    for (let i = 0; i < projectiles.length; i++) {
        const projectile = projectiles[i];
        const m = projectile.d ? -1 : 1;
        projectile.y += PROJECTILE_SPEED * m;
    }

    // move the bad guys
    // d = -1 means moving left, 1 right
    // also move down
    for (let i = 0; i < badGuys.length; i++) {
        let badGuyRow = badGuys[i];

        for (let j = 0; j < badGuyRow.length; j++) {
            let badGuy = badGuyRow[j];
            badGuy.x += badGuy.d * BAD_GUY_SPEED;

            badGuy.y -= BAD_GUY_SPEED;
        }
    }

    // change direction of bad guys collide each other or wall
    for (let i = 0; i < badGuys.length; i++) {
        let badGuyRow = badGuys[i];

        for (let j = 0; j < badGuyRow.length; j++) {
            let badGuy = badGuyRow[j];
            let hasCollided = false;

            // left guy is left guy or wall. same w right guy
            // operate in clip space
            let leftX = -1 - SQ_SIZE;
            let rightX = 1 + SQ_SIZE;

            if (j > 0) {
                leftX = badGuyRow[j - 1].x;
            }
            
            if (j < badGuyRow.length - 1) {
                rightX = badGuyRow[j + 1].x;
            }

            const M = 4;
            hasCollided = badGuy.x < leftX + 2*SQ_SIZE + M*BAD_GUY_SPEED || badGuy.x > rightX - 2*SQ_SIZE - M*BAD_GUY_SPEED;

            if (hasCollided) {
                badGuy.d = -1 * badGuy.d;
            }
        }
    }

    // convert shit to vertices
    let playaVertices = sqPointToTriangles(playa);
    let projectileVertices = projectiles.map(tPointToTriangle).reduce(stomp, []);
    let badGuyVertices = badGuys.reduce(stomp, []).map(sqPointToTriangles).reduce(stomp, []);
    
    return flatten(playaVertices.concat(projectileVertices).concat(badGuyVertices));
};

const isGameOver = () => {
    // bad guy projectile hits playa
    for (let i = 0; i < badGuyProjectiles.length; i++) {
        const projectile = badGuyProjectiles[i];
        const {y} = projectile;
        
        if (y < T_SIZE + SQ_SIZE + playa.y) {
            return true;
        }
    }

    // bad guy hits playa or goin off screen
    const badGuysFlat = badGuys.reduce(stomp, []);
    // console.log(badGuysFlat);
    for (let i = 0; i < badGuysFlat.length; i++) {
        const badGuy = badGuysFlat[i];
        const {x, y} = badGuy;

        // hit playa
        if (y < 2*SQ_SIZE + BAD_GUY_SPEED + playa.y && x > playa.x - 2*SQ_SIZE - BAD_GUY_SPEED) {
            return true;
        }

        // off screen
        if (y < -1 + SQ_SIZE) {
            return true;
        }
    }

    return false;
};

const resetGame = () => {
    playa = {x: 0.4, y: -0.7};
    playaProjectiles = [];
    badGuys = initBadGuys();
    badGuyProjectiles = [];
};

const initBadGuys = () => {
    const Y1 = 0.8;
    const Y2 = Y1 - 2*SQ_SIZE - 0.05;
    const rowYs = [Y1, Y2];
    const bg = [];

    for (let r = 0; r < rowYs.length; r++) {
        let currRow = [];

        for (let i = 0; i < NUM_BAD_GUYS_PER_ROW; i++) {
            const badGuy = {
                x: -0.8 + i / 2,
                y: rowYs[r],
                d: Math.round(Math.random() * 100) % 2 ? 1 : -1
            };
    
            currRow.push(badGuy);
        }

        bg.push(currRow);
    }

    return bg;
};

const sendShitToGPU = () => {
    allVertices = updateGameObjects();
    // console.log(`all vertices: ${allVertices}`);

    gl.bufferData( gl.ARRAY_BUFFER, allVertices, gl.STATIC_DRAW );
};

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    // Associate out shader variables with our data buffer
    let vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, NUM_ELEMENTS_PER_POSITION, gl.FLOAT, false, NUM_ELEMENTS_PER_POSITION * Float32Array.BYTES_PER_ELEMENT, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    resetGame();
    sendShitToGPU();

    // event handlers
    window.onkeydown = function(event) {
        const key = event.keyCode;

        // console.log(key);
        switch(key) {
          // left
          case 37:
            playa.x -= XUNIT;
            break;

          // right
          case 39:
            playa.x += XUNIT;
            break;
        
          // space
          case 32:
            playaProjectiles.push(makePlayaProjectile());
            break;
        }
    };

    render();
};

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    // gl.drawArrays( gl.TRIANGLE_STRIP, 0, playa.length / NUM_ELEMENTS_PER_POSITION );

    if (isGameOver()){
        resetGame();
    }
    
    sendShitToGPU();
    gl.drawArrays( gl.TRIANGLES, 0, allVertices.length / NUM_ELEMENTS_PER_POSITION );
    // gl.drawArrays( gl.TRIANGLES, 0, points.length / NUM_ELEMENTS_PER_POSITION );
    // dx += 0.001;
    // gl.uniform1f( dxLoc, dx );

    window.requestAnimFrame(render);
}
