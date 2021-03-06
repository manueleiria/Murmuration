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
THREE.BirdGeometry = Object.create( THREE.BufferGeometry );

/* BIRD GEOMETRY */
THREE.BirdGeometry = function (tail,     nose,     span,     head,     wing,    flapWing,   flapTail) {     // bird geometry depends on scales for body parts, as specified in arguments
//                            (15  ,     6   ,     2   ,     2   ,     8   ,    7       ,   4       )

    var triangles = BIRDS * 22;						                                                        // number of triangles * bird total
    var points = triangles * 3;						                                                        // number of vertices per triangle
        
    THREE.BufferGeometry.call( this );				                                                        // BirdGeometry is a BufferGeometry
        
    var vertices   = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );	                    // creates vertex positions for each vertex * 3 coordinates
    this.addAttribute( 'position', vertices );                                                              // adds the vertex positions as an attribute to the bird geometry
    
    /* VERTICES */
    var verts = new Array(16);                                                                              // array for unique vertices
    verts[ 0] = [     -tail,         0, -1.5*span ];	                                                    // tail left
    verts[ 1] = [     -tail,         0,  1.5*span ];	                                                    // tail right
    verts[ 2] = [ -0.7*tail,         0, -0.6*span ];	                                                    // waist left
    verts[ 3] = [ -0.7*tail,         0,  0.6*span ];	                                                    // waist right
    verts[ 4] = [ -0.5*tail,  0.5*head,         0 ];	                                                    // waist top
    verts[ 5] = [ -0.5*tail, -0.5*head,         0 ];	                                                    // waist bottom
    verts[ 6] = [         0,         0,     -span ];	                                                    // left ear
    verts[ 7] = [         0,         0,      span ];	                                                    // right ear
    verts[ 8] = [         0,      head,         0 ];	                                                    // head
    verts[ 9] = [         0,     -head,         0 ];	                                                    // chin
    verts[10] = [      nose,         0,         0 ];	                                                    // nose
    verts[11] = [ -0.1*tail,         0,         0 ];	                                                    // wing base front
    verts[12] = [ -0.4*tail,         0,         0 ];	                                                    // wing base back
    verts[13] = [ -0.7*tail,         0, -0.8*wing ];	                                                    // wing tip back left
    verts[14] = [ -0.7*tail,         0,  0.8*wing ];	                                                    // wing tip back right
    verts[15] = [ -0.2*tail,         0,     -wing ];	                                                    // wing tip front left
    verts[16] = [ -0.2*tail,         0,      wing ];	                                                    // wing tip front right
    
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
    function verts_push() {									                                                // write vertices to geometry array, each set of three is interpreted as a triangle
        
        for (var j=0; j < arguments.length; j++) {			                                                // for each vertex ...
            for (var i=0; i < arguments[j].length; i++) {	                                                // for each coordinate ...
                vertices.array[v++] = arguments[j][i];		                                                // add to vertex array
            }
        }
    }
}

THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );                             // the bird geometry prototype is just a collection of geometric points, or vertices, in a three dimensional matrix

/* INITIALIZE ENVIRONMENT */
init();                                                                                                     // the init function prepares of the scene

/* ANIMATE FRAME */
animate();                                                                                                  // each new frame is drawn by this function

/* INITIALIZATION FUNCTION */
function init() {

    container = document.createElement( 'div' );                                                            // a new div container is created in the html document
    document.body.appendChild( container );                                                                 // the div container is added to the html document body
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );            // a new camera is created
    camera.position.z = 15;                                                                                 // the camera is positioned close to the origin point
    
    scene = new THREE.Scene();                                                                              // the scene is created
    scene.background = new THREE.Color( 0xffffff );                                                         // scene's background is set to white
    scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );                                                      // a fog is added to the scene. at the current camera position it's not noticeable
    
    renderer = new THREE.WebGLRenderer();                                                                   // the webgl renderer is created
    renderer.setPixelRatio( window.devicePixelRatio );                                                      //the renderer uses pixel 1:1 ratio
    renderer.setSize( window.innerWidth, window.innerHeight );                                              // the renderer fully occupies the window size
    container.appendChild( renderer.domElement );                                                           // the renderer is appended to the main container
    
    /* BIRD GEOMETRY INITIALIZATION */
    initBirds();                                                                                            // this function takes care of the steps for creating a new bird mesh instance

}

/* INITIATE BIRDS */
function initBirds() {
    
    var geometry = new THREE.BirdGeometry( 15, 6, 2, 2, 8, 7, 4 );                                          // a new bird geometry is created, along with the main vertex point scale
    
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );                                      // a new basic green material
    material.wireframe = true;                                                                              // instead of a full fill, the material is composed of wireframe only
    
    birdMesh = new THREE.Mesh( geometry, material );                                                        // the bird mesh is created from the geometry points and the provided material
    scene.add( birdMesh );                                                                                  // the bird mesh is added to the scene. it contains the complete geometry for all birds
    
    console.log( geometry );                                                                                // log the full geometry to the console

}

/* ANIMATE FUNCTION */
function animate() {

    requestAnimationFrame( animate );                                                                       // at the start of the animate function, a new animation frame is requested

    birdMesh.rotation.x += 0.01;                                                                            // the bird is rotated along the x axis
    birdMesh.rotation.z += 0.01;                                                                            // the bird is rotated along the y axis
    
    renderer.render( scene, camera );                                                                       // the new frame is sent to the renderer to draw

}