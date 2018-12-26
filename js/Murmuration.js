/* 
 * @author manueleiria
 * This project is heavily based on Mr. Doob's three.js
 * webgl_gpgpu_birds example, as well as Gene Kogan's
 * Processing 1.5 FlockingBoids model geometry.
 * Both can be found at:
 * https://github.com/mrdoob/three.js
 * https://github.com/genekogan/FlockingBoids
*/

/* WEBGL CHECK */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();                                                      // detector checks if browser is webgl compatible

/* TEXTURE MULTIPLIER */
var hash = document.location.hash.substr( 1 );                                                              // hash value is a multiplier for test purposes
if (hash) hash = parseInt(hash, 0);                                                                         // hash parsing

/* TEXTURE DIMENSION */
var WIDTH = hash || 64;                                                                                     // if no hash, texture width is 64
var BIRDS = WIDTH * WIDTH;                                                                                  // bird shader is a WIDTH*WIDTH square

/* SETUP */
var BOUNDS = 8000, BOUNDS_HALF = BOUNDS / 2;                                                                // establish the geometric boundaries for the bird mesh to move in
var camera, scene, renderer, birdMesh;                                                                      // initialize essential variables to the various functions: the camera, the scene, the 3d renderer and the bird mesh

/* BIRD GEOMETRY */
THREE.BirdGeometry = function (tail,     nose,     span,     head,     wing,    flapWing,   flapTail) {     // bird geometry depends on scales for body parts, as specified in arguments
//                            (15  ,     6   ,     2   ,     2   ,     8   ,    7       ,   4       )

    var triangles = BIRDS * 22;                                                                             // number of triangles * bird total
    var points = triangles * 3;                                                                             // number of vertices per triangle
        
    THREE.BufferGeometry.call( this );                                                                      // BirdGeometry is a BufferGeometry
        
    var vertices   = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );                        // creates vertex positions for each vertex * 3 coordinates
    var birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );                        // creates vertex positions for each triangle * 3 colors (RGB)
    var references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );                        // creates x & y for each point
    var birdVertex = new THREE.BufferAttribute( new Float32Array( points     ), 1 );                        // number each vertex
				
    this.addAttribute( 'position', vertices );                                                              // adds the vertex positions as an attribute to the bird geometry
    this.addAttribute( 'birdColor', birdColors );                                                           // adds the shader coloring as an attribute to the bird geometry
    this.addAttribute( 'reference', references );                                                           // adds a reference point for each individual bird as an attribute to the bird geometry
    this.addAttribute( 'birdVertex', birdVertex );                                                          // adds the vertex shader as an attribute to the bird geometry

    /* VERTICES */
    var verts = new Array(16);                                                                              // array for unique vertices
    verts[ 0] = [         0, -1.5*span,     -tail ];                                                        // tail left
    verts[ 1] = [         0,  1.5*span,     -tail ];                                                        // tail right
    verts[ 2] = [         0, -0.6*span, -0.7*tail ];                                                        // waist left
    verts[ 3] = [         0,  0.6*span, -0.7*tail ];                                                        // waist right
    verts[ 4] = [  0.5*head,         0, -0.5*tail ];                                                        // waist top
    verts[ 5] = [ -0.5*head,         0, -0.5*tail ];                                                        // waist bottom
    verts[ 6] = [         0,     -span,         0 ];                                                        // left ear
    verts[ 7] = [         0,      span,         0 ];                                                        // right ear
    verts[ 8] = [      head,         0,         0 ];                                                        // head
    verts[ 9] = [     -head,         0,         0 ];                                                        // chin
    verts[10] = [         0,         0,      nose ];                                                        // nose
    verts[11] = [         0,         0, -0.1*tail ];                                                        // wing base front
    verts[12] = [         0,         0, -0.4*tail ];                                                        // wing base back
    verts[13] = [         0, -0.8*wing, -0.7*tail ];                                                        // wing tip back left
    verts[14] = [         0,  0.8*wing, -0.7*tail ];                                                        // wing tip back right
    verts[15] = [         0,     -wing, -0.2*tail ];                                                        // wing tip front left
    verts[16] = [         0,      wing, -0.2*tail ];                                                        // wing tip front right
    
    /* BIRD FACTORY */
    var v = 0;                                                                                              // total vertex counter for the full bird geometry
    for ( var f = 0; f<BIRDS; f++ ) {                                                                       // each cycle builds a bird at 3D space center

        /* TAIL TRIANGLES */
        verts_push(verts[ 4], verts[ 3], verts[ 1]);
        verts_push(verts[ 4], verts[ 1], verts[ 0]);
        verts_push(verts[ 4], verts[ 2], verts[ 0]);
        verts_push(verts[ 5], verts[ 3], verts[ 1]);
        verts_push(verts[ 5], verts[ 1], verts[ 0]);
        verts_push(verts[ 5], verts[ 2], verts[ 1]);

        /* TORSO TRIANGLES */
        verts_push(verts[ 4], verts[ 3], verts[ 7]);
        verts_push(verts[ 4], verts[ 7], verts[ 8]);
        verts_push(verts[ 4], verts[ 2], verts[ 6]);
        verts_push(verts[ 4], verts[ 6], verts[ 8]);
        verts_push(verts[ 5], verts[ 3], verts[ 7]);
        verts_push(verts[ 4], verts[ 7], verts[ 9]);
        verts_push(verts[ 5], verts[ 2], verts[ 6]);
        verts_push(verts[ 5], verts[ 6], verts[ 9]);

        /* HEAD TRIANGLES */
        verts_push(verts[ 7], verts[ 8], verts[10]);
        verts_push(verts[ 6], verts[ 8], verts[10]);
        verts_push(verts[ 7], verts[ 9], verts[10]);
        verts_push(verts[ 6], verts[ 9], verts[10]);
        
        /* WING TRIANGLES */
        verts_push(verts[11], verts[12], verts[13]);
        verts_push(verts[11], verts[13], verts[15]);
        verts_push(verts[11], verts[12], verts[14]);
        verts_push(verts[11], verts[14], verts[16]);

    }

    /* PUSH TO VERTEX ARRAY */
    function verts_push() {                                                                                 // write vertices to geometry array, each set of three is interpreted as a triangle
        
        for (var j=0; j < arguments.length; j++) {                                                          // for each vertex ...
            for (var i=0; i < arguments[j].length; i++) {                                                   // for each coordinate ...
                vertices.array[v++] = arguments[j][i];                                                      // add to vertex array
            }
        }
    }

    for( var v = 0; v < triangles * 22; v++ ) {

        var i = ~~(v / 66);
        var x = (i % WIDTH) / WIDTH;
        var y = ~~(i / WIDTH) / WIDTH;

        var c = new THREE.Color(
            0x444444 +
            ~~(v / 9) / BIRDS * 0x666666
        );

        birdColors.array[ v * 3 + 0 ] = c.r;
        birdColors.array[ v * 3 + 1 ] = c.g;
        birdColors.array[ v * 3 + 2 ] = c.b;

        references.array[ v * 2     ] = x;
        references.array[ v * 2 + 1 ] = y;

        birdVertex.array[ v         ] = v % 9;

    }
    
    this.scale( 0.5, 0.5, 0.5 );

}

THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );                             // the bird geometry prototype is just a collection of geometric points, or vertices, in a three dimensional matrix

var last = performance.now();
			
var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var birdUniforms;

/* INITIALIZE ENVIRONMENT */
init();                                                                                                     // the init function prepares of the scene

/* ANIMATE FRAME */
animate();                                                                                                  // each new frame is drawn by this function

/* INITIALIZATION FUNCTION */
function init() {

    var mainContainer = document.createElement( 'div' );                                                    // a new div container is created in the html document
    document.body.appendChild( mainContainer );                                                             // the div container is added to the html document body
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );            // a new camera is created
    camera.position.z = 600;                                                                                 // the camera is positioned close to the origin point
    
    scene = new THREE.Scene();                                                                              // the scene is created
    scene.background = new THREE.Color( 0xffffff );                                                         // scene's background is set to white
    scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );                                                      // a fog is added to the scene. at the current camera position it's not noticeable
    
    renderer = new THREE.WebGLRenderer();                                                                   // the webgl renderer is created
    renderer.setPixelRatio( window.devicePixelRatio );                                                      //the renderer uses pixel 1:1 ratio
    renderer.setSize( window.innerWidth, window.innerHeight );                                              // the renderer fully occupies the window size
    mainContainer.appendChild( renderer.domElement );                                                       // the renderer is appended to the main container
    
    initComputeRenderer();

    /* BIRD GEOMETRY INITIALIZATION */
    initBirds();                                                                                            // this function takes care of the steps for creating a new bird mesh instance

}

function initComputeRenderer() {
			
    gpuCompute = new GPUComputationRenderer( WIDTH, WIDTH, renderer );

    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();
    fillPositionTexture( dtPosition );
    fillVelocityTexture( dtVelocity );

    velocityVariable = gpuCompute.addVariable( "textureVelocity", document.getElementById( 'fragmentShaderVelocity' ).textContent, dtVelocity );
    positionVariable = gpuCompute.addVariable( "texturePosition", document.getElementById( 'fragmentShaderPosition' ).textContent, dtPosition );

    gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
    gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;

    positionUniforms.time = { value: 0.0 };
    positionUniforms.delta = { value: 0.0 };
    velocityUniforms.time = { value: 1.0 };
    velocityUniforms.delta = { value: 0.0 };
    velocityUniforms.testing = { value: 1.0 };
    velocityUniforms.seperationDistance = { value: 1.0 };
    velocityUniforms.alignmentDistance = { value: 1.0 };
    velocityUniforms.cohesionDistance = { value: 1.0 };
    velocityUniforms.freedomFactor = { value: 1.0 };
    velocityUniforms.predator = { value: new THREE.Vector3() };
    velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

    velocityVariable.wrapS = THREE.RepeatWrapping;
    velocityVariable.wrapT = THREE.RepeatWrapping;
    positionVariable.wrapS = THREE.RepeatWrapping;
    positionVariable.wrapT = THREE.RepeatWrapping;

    var error = gpuCompute.init();
    if ( error !== null ) {
        console.error( error );
    }

}

/* INITIATE BIRDS */
function initBirds() {
    
    var geometry = new THREE.BirdGeometry( 15, 6, 2, 2, 8, 7, 4 );                                          // a new bird geometry is created, along with the main vertex point scale
    
    // For Vertex and Fragment
    birdUniforms = {
        color: { value: new THREE.Color( 0xff2200 ) },
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 1.0 },
        delta: { value: 0.0 }
    };

    // ShaderMaterial
    var material = new THREE.ShaderMaterial( {
        uniforms:       birdUniforms,
        vertexShader:   document.getElementById( 'birdVS' ).textContent,
        fragmentShader: document.getElementById( 'birdFS' ).textContent,
        side: THREE.DoubleSide
    });

    birdMesh = new THREE.Mesh( geometry, material );// the bird mesh is created from the geometry points and the provided material
    birdMesh.rotation.y = Math.PI / 2;
    birdMesh.matrixAutoUpdate = false;
    birdMesh.updateMatrix();
    
    scene.add( birdMesh );                                                                                  // the bird mesh is added to the scene. it contains the complete geometry for all birds
    
    console.log( geometry );                                                                                // log the full geometry to the console

}

function fillPositionTexture( texture ) {
			
    var theArray = texture.image.data;

    for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

        var x = Math.random() * BOUNDS - BOUNDS_HALF;
        var y = Math.random() * BOUNDS - BOUNDS_HALF;
        var z = Math.random() * BOUNDS - BOUNDS_HALF;

        theArray[ k + 0 ] = x;
        theArray[ k + 1 ] = y;
        theArray[ k + 2 ] = z;
        theArray[ k + 3 ] = 1;

    }
}

function fillVelocityTexture( texture ) {

    var theArray = texture.image.data;

    for ( var k = 0, kl = theArray.length; k < kl; k += 4 ) {

        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        var z = Math.random() - 0.5;

        theArray[ k + 0 ] = x * 10;
        theArray[ k + 1 ] = y * 10;
        theArray[ k + 2 ] = z * 10;
        theArray[ k + 3 ] = 1;

    }

}

/* ANIMATE FUNCTION */
function animate() {

    requestAnimationFrame( animate );                                                                       // at the start of the animate function, a new animation frame is requested

    render();                                                                       // the new frame is sent to the renderer to draw

}

function render() {
				
    var now = performance.now();
    var delta = (now - last) / 1000;

    if (delta > 1) delta = 1; // safety cap on large deltas
    last = now;
    
    positionUniforms.time.value = now;
    positionUniforms.delta.value = delta;
    velocityUniforms.time.value = now;
    velocityUniforms.delta.value = delta;
    birdUniforms.time.value = now;
    birdUniforms.delta.value = delta;
    
    gpuCompute.compute();

    birdUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;
    birdUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget( velocityVariable ).texture;
    
    renderer.render( scene, camera );

}