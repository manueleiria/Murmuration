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
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

/* TEXTURE MULTIPLIER */
var hash = document.location.hash.substr( 1 );
if (hash) hash = parseInt(hash, 0);

/* TEXTURE DIMENSION */
var WIDTH = hash || 64;
var BIRDS = WIDTH * WIDTH;

/* BIRD GEOMETRY */
THREE.BirdGeometry = function (tail,     nose,     span,     head,     wing,     flapWing, flapTail) {
//                            (15  ,     6   ,     2   ,     2   ,     8   ,     7       , 4       )

    var triangles = BIRDS * 22;						// number of triangles * bird total
    var points = triangles * 3;						// number of vertices per triangle
        
    THREE.BufferGeometry.call( this );				// BirdGeometry is a BufferGeometry
        
    var vertices   = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );	// creates vertex positions for each vertex  * 3 coordinates
    var birdColors = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );	// creates vertex positions for each triangle * 3 colors (RGB)
    var references = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );	// creates x & y for each point
    var birdVertex = new THREE.BufferAttribute( new Float32Array( points     ), 1 );	// number each vertex
        
    this.addAttribute( 'position', vertices ); 		// adds the vertex positions as an attribute to the bird geometry
    
    var v = 0;												// total vertex counter
    function verts_push() {									// write vertices
        verts[ 0] = [     -tail,         0, -1.5*span ];	// tail left
        verts[ 1] = [     -tail,         0,  1.5*span ];	// tail right
        verts[ 2] = [ -0.7*tail,         0, -0.6*span ];	// waist left
        verts[ 3] = [ -0.7*tail,         0,  0.6*span ];	// waist right
        verts[ 4] = [ -0.5*tail,  0.5*head,         0 ];	// waist top
        verts[ 5] = [ -0.5*tail, -0.5*head,         0 ];	// waist bottom
        verts[ 6] = [         0,         0,     -span ];	// left ear
        verts[ 7] = [         0,         0,      span ];	// right ear
        verts[ 8] = [         0,      head,         0 ];	// head
        verts[ 9] = [         0,     -head,         0 ];	// chin
        verts[10] = [      nose,         0,         0 ];	// nose
        verts[11] = [ -0.1*tail,         0,         0 ];	// wing base front
        verts[12] = [ -0.4*tail,         0,         0 ];	// wing base back
        verts[13] = [ -0.7*tail,         0, -0.8*wing ];	// wing tip back left
        verts[14] = [ -0.7*tail,         0,  0.8*wing ];	// wing tip back right
        verts[15] = [ -0.2*tail,         0,     -wing ];	// wing tip front left
        verts[16] = [ -0.2*tail,         0,      wing ];	// wing tip front right
        for (var j=0; j < arguments.length; j++) {			// for each vertex ...
            for (var i=0; i < arguments[j].length; i++) {	// for each coordinate   ...
                vertices.array[v++] = arguments[j][i];		// add to vertex array
            }
        }
    }
    
    /* VERTICES */
    var verts = new Array(16);
    verts[ 0] = [     -tail,         0, -1.5*span ];	// tail left
    verts[ 1] = [     -tail,         0,  1.5*span ];	// tail right
    verts[ 2] = [ -0.7*tail,         0, -0.6*span ];	// waist left
    verts[ 3] = [ -0.7*tail,         0,  0.6*span ];	// waist right
    verts[ 4] = [ -0.5*tail,  0.5*head,         0 ];	// waist top
    verts[ 5] = [ -0.5*tail, -0.5*head,         0 ];	// waist bottom
    verts[ 6] = [         0,         0,     -span ];	// left ear
    verts[ 7] = [         0,         0,      span ];	// right ear
    verts[ 8] = [         0,      head,         0 ];	// head
    verts[ 9] = [         0,     -head,         0 ];	// chin
    verts[10] = [      nose,         0,         0 ];	// nose
    verts[11] = [ -0.1*tail,         0,         0 ];	// wing base front
    verts[12] = [ -0.4*tail,         0,         0 ];	// wing base back
    verts[13] = [ -0.7*tail,         0, -0.8*wing ];	// wing tip back left
    verts[14] = [ -0.7*tail,         0,  0.8*wing ];	// wing tip back right
    verts[15] = [ -0.2*tail,         0,     -wing ];	// wing tip front left
    verts[16] = [ -0.2*tail,         0,      wing ];	// wing tip front right
    
    /* BUILD-A-BIRD */
    for ( var f = 0; f<BIRDS; f++ ) {
    

        /* TAIL */
        verts_push(verts[ 4], verts[ 3], verts[ 1]);
        verts_push(verts[ 4], verts[ 1], verts[ 0]);
        verts_push(verts[ 4], verts[ 2], verts[ 0]);
        verts_push(verts[ 5], verts[ 3], verts[ 1]);
        verts_push(verts[ 5], verts[ 1], verts[ 0]);
        verts_push(verts[ 5], verts[ 2], verts[ 1]);

        /* TORSO */
        verts_push(verts[ 4], verts[ 3], verts[ 7]);
        verts_push(verts[ 4], verts[ 7], verts[ 8]);
        verts_push(verts[ 4], verts[ 2], verts[ 6]);
        verts_push(verts[ 4], verts[ 6], verts[ 8]);
        verts_push(verts[ 5], verts[ 3], verts[ 7]);
        verts_push(verts[ 4], verts[ 7], verts[ 9]);
        verts_push(verts[ 5], verts[ 2], verts[ 6]);
        verts_push(verts[ 5], verts[ 6], verts[ 9]);

        /* HEAD */
        verts_push(verts[ 7], verts[ 8], verts[10]);
        verts_push(verts[ 6], verts[ 8], verts[10]);
        verts_push(verts[ 7], verts[ 9], verts[10]);
        verts_push(verts[ 6], verts[ 9], verts[10]);
        
        /* WINGS */
        verts_push(verts[11], verts[12], verts[13]);
        verts_push(verts[11], verts[13], verts[15]);
        verts_push(verts[11], verts[12], verts[14]);
        verts_push(verts[11], verts[14], verts[16]);
    }
}

/* SETUP */
THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

var camera, scene, renderer, birdMesh;

var BOUNDS = 8000, BOUNDS_HALF = BOUNDS / 2;

/* INITIALIZE */			
init();

/* ANIMATE */
animate();

/* INIT FUNCTION */
function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 15;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    initBirds();

}

/* INITIATE BIRDS */
function initBirds() {
    
    var geometry = new THREE.BirdGeometry(15, 6, 2, 2, 8, 7, 4);
    
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    material.wireframe = true;
    
    birdMesh = new THREE.Mesh( geometry, material );
    scene.add( birdMesh );
    
    console.log(geometry);

}

/* ANIMATE FUNCTION */
function animate() {

    requestAnimationFrame( animate );

    birdMesh.rotation.x += 0.01;
    birdMesh.rotation.z += 0.01;
    
    renderer.render( scene, camera );

}