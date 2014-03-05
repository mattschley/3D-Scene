// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
  
var floatsPerVertex = 6;

 
function main() {
//==============================================================================
  // Retrieve <canvas> element
   canvas = document.getElementById('webgl');

   var isOrtho = 1;
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

	gl.enable(gl.DEPTH_TEST); 
	
  
  var n = initVertexBuffers(gl);

  if (n < 0) {
    console.log('Failed to specify the vertex infromation');
    return;
  }

  // Specify the color of <canvas>
  gl.clearColor(0.4, 0.4, 0.4, 1.0);

  // Get the storage locations of u_ViewMatrix and u_ProjMatrix variables
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to get u_ViewMatrix or u_ProjMatrix');
    return;
  }
 
  console.log("isOrtho is initailly" ,isOrtho);
  // Create the matrix to specify the view matrix
  var viewMatrix = new Matrix4();
  var projMatrix = new Matrix4();
  // event handler called on key press
 document.onkeydown = function(ev){ keydown(ev, gl, u_ViewMatrix, viewMatrix,projMatrix, isOrtho,u_ProjMatrix) };
	

  console.log("Is ortho is: ",isOrtho, "when called in main!");
  if(isOrtho == 0){
  projMatrix.setPerspective(90, canvas.width/canvas.height, 1, 100)}
  else{
  projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100)}

  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  draw(gl, u_ViewMatrix, viewMatrix, isOrtho);   // Draw the triangles
  
}

function makeGroundGrid() {

	var xcount = 1000;			
	var ycount = 1000;		
	var xymax	= 50.0;			
 	var xColr = new Float32Array([0.0, 1.0, 1.0]);	// ocean blue
 	var yColr = new Float32Array([0.0, 1.0, 1.0]);	// ocean blue
 	
	
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						
						
	var xgap = xymax/(xcount-1);		
	var ygap = xymax/(ycount-1);	
	
	// step thru x values 
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	
			gndVerts[j  ] = -xymax + (v  )*xgap;	
			gndVerts[j+1] = -xymax;								
			gndVerts[j+2] = 0.0;									
		}
		else {				
			gndVerts[j  ] = -xymax + (v-1)*xgap;	
			gndVerts[j+1] = xymax;								
			gndVerts[j+2] = 0.0;									
		}
		gndVerts[j+3] = xColr[0];			
		gndVerts[j+4] = xColr[1];			
		gndVerts[j+5] = xColr[2];			
	}
	
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {					
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		gndVerts[j+3] = yColr[0];			
		gndVerts[j+4] = yColr[1];			
		gndVerts[j+5] = yColr[2];			
	}
}// grid logic c/o Professor Tumblin

function initVertexBuffers(gl) {
//==============================================================================
var c30 = Math.sqrt(0.75);          // == cos(30deg) == sqrt(3) / 2
  var sq2 = Math.sqrt(2.0); 
	// make our 'forest' of triangular-shaped trees:
  forestVerts = new Float64Array([
    // Vertex coordinates and color
     0.0,  0.0, sq2,      1.0,  1.0,  1.0,  // Node 0
     c30, -0.5, 0.0,      0.0,  0.0,  1.0,  // Node 1
     0.0,  1.0, 0.0,      1.0,  0.0,  0.0,  // Node 2
      // right side
     0.0,  0.0, sq2,     1.0,  1.0,  1.0,  // Node 0
     0.0,  1.0, 0.0,     1.0,  0.0,  0.0,  // Node 2
    -c30, -0.5, 0.0,     0.0,  1.0,  0.0,  // Node 3
      // lower side
     0.0,  0.0, sq2,     1.0,  1.0,  1.0,  // Node 0 
    -c30, -0.5, 0.0,      0.0,  1.0,  0.0,  // Node 3
     c30, -0.5, 0.0,     0.0,  0.0,  1.0,  // Node 1 
      // base side
    -c30, -0.5, 0.0,    0.0,  1.0,  0.0,  // Node 3
     0.0,  1.0, 0.0,  1.0,  0.0,  0.0,  // Node 2
     c30, -0.5, 0.0,     0.0,  0.0,  1.0,  // Node 1

     // cube 1
     1.0, -1.0, -3.0,     1.0, 0.0, 0.0,  // Node 3
     1.0,  1.0, -3.0,    1.0, 0.0, 0.0,  // Node 2
     1.0,  1.0,  -6.0,   1.0, 0.0, 0.0,  // Node 4
     
     1.0,  1.0,  -6.0,    1.0, 0.1, 0.1,  // Node 4
     1.0, -1.0,  -6.0,    1.0, 0.1, 0.1,  // Node 7
     1.0, -1.0, -3.0,     1.0, 0.1, 0.1,  // Node 3

    // +y face
    -1.0,  1.0, -3.0,     0.0, 1.0, 0.0,  // Node 1
    -1.0,  1.0,  -6.0,     0.0, 1.0, 0.0,  // Node 5
     1.0,  1.0,  -6.0,    0.0, 1.0, 0.0,  // Node 4

     1.0,  1.0,  -6.0,    0.1, 1.0, 0.1,  // Node 4
     1.0,  1.0, -3.0,     0.1, 1.0, 0.1,  // Node 2 
    -1.0,  1.0, -3.0,     0.1, 1.0, 0.1,  // Node 1

    // +z face
    -1.0,  1.0,  -6.0,     0.0, 0.0, 1.0,  // Node 5
    -1.0, -1.0,  -6.0,     0.0, 0.0, 1.0,  // Node 6
     1.0, -1.0,  -6.0,     0.0, 0.0, 1.0,  // Node 7

     1.0, -1.0,  -6.0,     0.1, 0.1, 1.0,  // Node 7
     1.0,  1.0,  -6.0,     0.1, 0.1, 1.0,  // Node 4
    -1.0,  1.0,  -6.0,    0.1, 0.1, 1.0,  // Node 5

    // -x face
    -1.0, -1.0,  -6.0,    1.0, 1.0, 1.0,  // Node 6 
    -1.0,  1.0,  -6.0,     1.0, 1.0, 1.0,  // Node 5 
    -1.0,  1.0, -3.0,     1.0, 1.0, 1.0,  // Node 1
    
    -1.0,  1.0, -3.0,    1.0, 1.0, 1.0,  // Node 1
    -1.0, -1.0, -3.0,   1.0, 1.0, 1.0,  // Node 0  
    -1.0, -1.0,  -6.0,    1.0, 1.0, 1.0,  // Node 6  
    
    // -y face
     1.0, -1.0, -3.0,     1.0, 0.0, 1.0,  // Node 3
     1.0, -1.0,  -6.0,     1.0, 0.0, 1.0,  // Node 7
    -1.0, -1.0,  -6.0,    1.0, 0.0, 1.0,  // Node 6

    -1.0, -1.0,  -6.0,     1.0, 0.1, 1.0,  // Node 6
    -1.0, -1.0, -3.0,    1.0, 0.1, 1.0,  // Node 0
     1.0, -1.0, -3.0,     1.0, 0.1, 1.0,  // Node 3

     // -z face
     1.0,  1.0, -3.0,     1.0, 1.0, 0.0,  // Node 2
     1.0, -1.0, -3.0,    1.0, 1.0, 0.0,  // Node 3
    -1.0, -1.0, -3.0,     1.0, 1.0, 0.0,  // Node 0   

    -1.0, -1.0, -3.0,     1.0, 1.0, 0.1,  // Node 0
    -1.0,  1.0, -3.0,    1.0, 1.0, 0.1,  // Node 1
     1.0,  1.0, -3.0,     1.0, 1.0, 0.1,  // Node 2

// cube two 
     1.0, -1.0, -9.0,     1.0, 0.0, 0.0,  // Node 3
     1.0,  1.0, -9.0,    1.0, 0.0, 0.0,  // Node 2
     1.0,  1.0,  -12.0,   1.0, 0.0, 0.0,  // Node 4
     
     1.0,  1.0,  -12.0,    1.0, 0.1, 0.1,  // Node 4
     1.0, -1.0,  -12.0,    1.0, 0.1, 0.1,  // Node 7
     1.0, -1.0, -9.0,     1.0, 0.1, 0.1,  // Node 3

    // +y face
    -1.0,  1.0, -9.0,     0.0, 1.0, 0.0,  // Node 1
    -1.0,  1.0,  -12.0,     0.0, 1.0, 0.0,  // Node 5
     1.0,  1.0,  -12.0,    0.0, 1.0, 0.0,  // Node 4

     1.0,  1.0,  -12.0,    0.1, 1.0, 0.1,  // Node 4
     1.0,  1.0, -9.0,     0.1, 1.0, 0.1,  // Node 2 
    -1.0,  1.0, -9.0,     0.1, 1.0, 0.1,  // Node 1

    // +z face
    -1.0,  1.0,  -12.0,     0.0, 0.0, 1.0,  // Node 5
    -1.0, -1.0,  -12.0,     0.0, 0.0, 1.0,  // Node 6
     1.0, -1.0,  -12.0,     0.0, 0.0, 1.0,  // Node 7

     1.0, -1.0,  -12.0,     0.1, 0.1, 1.0,  // Node 7
     1.0,  1.0,  -12.0,     0.1, 0.1, 1.0,  // Node 4
    -1.0,  1.0,  -12.0,    0.1, 0.1, 1.0,  // Node 5

    // -x face
    -1.0, -1.0,  -12.0,    1.0, 1.0, 1.0,  // Node 6 
    -1.0,  1.0,  -12.0,     1.0, 1.0, 1.0,  // Node 5 
    -1.0,  1.0, -9.0,     1.0, 1.0, 1.0,  // Node 1
    
    -1.0,  1.0, -9.0,    1.0, 1.0, 1.0,  // Node 1
    -1.0, -1.0, -9.0,   1.0, 1.0, 1.0,  // Node 0  
    -1.0, -1.0,  -12.0,    1.0, 1.0, 1.0,  // Node 6  
    
    // -y face
     1.0, -1.0, -9.0,     1.0, 0.0, 1.0,  // Node 3
     1.0, -1.0,  -12.0,     1.0, 0.0, 1.0,  // Node 7
    -1.0, -1.0,  -12.0,    1.0, 0.0, 1.0,  // Node 6

    -1.0, -1.0,  -12.0,     1.0, 0.1, 1.0,  // Node 6
    -1.0, -1.0, -9.0,    1.0, 0.1, 1.0,  // Node 0
     1.0, -1.0, -9.0,     1.0, 0.1, 1.0,  // Node 3

     // -z face
     1.0,  1.0, -9.0,     1.0, 1.0, 0.0,  // Node 2
     1.0, -1.0, -9.0,    1.0, 1.0, 0.0,  // Node 3
    -1.0, -1.0, -9.0,     1.0, 1.0, 0.0,  // Node 0   

    -1.0, -1.0, -9.0,     1.0, 1.0, 0.1,  // Node 0
    -1.0,  1.0, -9.0,    1.0, 1.0, 0.1,  // Node 1
     1.0,  1.0, -9.0,     1.0, 1.0, 0.1,  // Node 2
//cube 3
     1.0, 1.0, -9.0,     1.0, 0.0, 0.0,  // Node 3
     1.0,  3.0, -9.0,    1.0, 0.0, 0.0,  // Node 2
     1.0,  3.0,  -12.0,   1.0, 0.0, 0.0,  // Node 4
     
     1.0,  3.0,  -12.0,    1.0, 0.1, 0.1,  // Node 4
     1.0, 1.0,  -12.0,    1.0, 0.1, 0.1,  // Node 7
     1.0, 1.0, -9.0,     1.0, 0.1, 0.1,  // Node 3

    // +y face
    -1.0,  3.0, -9.0,     0.0, 1.0, 0.0,  // Node 1
    -1.0,  3.0,  -12.0,     0.0, 1.0, 0.0,  // Node 5
     1.0,  3.0,  -12.0,    0.0, 1.0, 0.0,  // Node 4

     1.0,  3.0,  -12.0,    0.1, 1.0, 0.1,  // Node 4
     1.0,  3.0, -9.0,     0.1, 1.0, 0.1,  // Node 2 
    -1.0,  3.0, -9.0,     0.1, 1.0, 0.1,  // Node 1

    // +z face
    -1.0,  3.0,  -12.0,     0.0, 0.0, 1.0,  // Node 5
    -1.0, 1.0,  -12.0,     0.0, 0.0, 1.0,  // Node 6
     1.0, 1.0,  -12.0,     0.0, 0.0, 1.0,  // Node 7

     1.0, 1.0,  -12.0,     0.1, 0.1, 1.0,  // Node 7
     1.0,  3.0,  -12.0,     0.1, 0.1, 1.0,  // Node 4
    -1.0,  3.0,  -12.0,    0.1, 0.1, 1.0,  // Node 5

    // -x face
    -1.0, 1.0,  -12.0,    1.0, 1.0, 1.0,  // Node 6 
    -1.0,  3.0,  -12.0,     1.0, 1.0, 1.0,  // Node 5 
    -1.0,  3.0, -9.0,     1.0, 1.0, 1.0,  // Node 1
    
    -1.0,  3.0, -9.0,    1.0, 1.0, 1.0,  // Node 1
    -1.0, 1.0, -9.0,   1.0, 1.0, 1.0,  // Node 0  
    -1.0, 1.0,  -12.0,    1.0, 1.0, 1.0,  // Node 6  
    
    // -y face
     1.0, 1.0, -9.0,     1.0, 0.0, 1.0,  // Node 3
     1.0, 1.0,  -12.0,     1.0, 0.0, 1.0,  // Node 7
    -1.0, 1.0,  -12.0,    1.0, 0.0, 1.0,  // Node 6

    -1.0, 1.0,  -12.0,     1.0, 0.1, 1.0,  // Node 6
    -1.0, 1.0, -9.0,    1.0, 0.1, 1.0,  // Node 0
     1.0, 1.0, -9.0,     1.0, 0.1, 1.0,  // Node 3

     // -z face
     1.0,  3.0, -9.0,     1.0, 1.0, 0.0,  // Node 2
     1.0, 1.0, -9.0,    1.0, 1.0, 0.0,  // Node 3
    -1.0, 1.0, -9.0,     1.0, 1.0, 0.0,  // Node 0   

    -1.0, 1.0, -9.0,     1.0, 1.0, 0.1,  // Node 0
    -1.0,  3.0, -9.0,    1.0, 1.0, 0.1,  // Node 1
     1.0,  3.0, -9.0,     1.0, 1.0, 0.1,  // Node 2

     /// first pac man 
     0.0,  2+0.0, sq2,      1.0,  1.0,  1.0,  // Node 0
     c30, -0.5+2, 0.0,      0.0,  0.0,  1.0,  // Node 1
     0.0,  1.0+2, 0.0,      1.0,  0.0,  0.0,  // Node 2
      // right side
     0.0,  0.0+2, sq2,     1.0,  1.0,  1.0,  // Node 0
     0.0,  1.0+2, 0.0,     1.0,  0.0,  0.0,  // Node 2
    -c30, -0.5+2, 0.0,     0.0,  1.0,  0.0,  // Node 3
      // lower side
     0.0,  0.0+2, sq2,     1.0,  1.0,  1.0,  // Node 0 
    -c30, -0.5+2, 0.0,      0.0,  1.0,  0.0,  // Node 3
     c30, -0.5+2, 0.0,     0.0,  0.0,  1.0,  // Node 1 
     //
     -c30, -0.5+2, 0.0,    0.0,  1.0,  0.0,  // Node 3
     0.0,  1.0+2, 0.0,  1.0,  0.0,  0.0,  // Node 2
     c30, -0.5+2, 0.0,     0.0,  0.0,  1.0,  // Node 1

      0.0,  2+0.0-1, sq2,      1.0,  1.0,  1.0,  // Node 0
     c30, -0.5+2, 0.0,      0.0,  0.0,  1.0,  // Node 1
     0.0,  1.0+2, 0.0,      1.0,  0.0,  0.0,  // Node 2
      // right side
     0.0,  0.0+2-1, sq2,     1.0,  1.0,  1.0,  // Node 0
     0.0,  1.0+2, 0.0,     1.0,  0.0,  0.0,  // Node 2
    -c30, -0.5+2, 0.0,     0.0,  1.0,  0.0,  // Node 3
      // lower side
     0.0,  0.0+2-1, sq2,     1.0,  1.0,  1.0,  // Node 0 
    -c30, -0.5+2, 0.0,      0.0,  1.0,  0.0,  // Node 3
     c30, -0.5+2, 0.0,     0.0,  0.0,  1.0,  // Node 1 
     //
     -c30, -0.5+2, 0.0,    0.0,  1.0,  0.0,  // Node 3
     0.0,  1.0+2, 0.0,  1.0,  0.0,  0.0,  // Node 2
     c30, -0.5+2, 0.0,     0.0,  0.0,  1.0,  // Node 1

     /// second pac man 
     0.0,  2+0.0, sq2-6,      1.0,  1.0,  1.0,  // Node 0
     c30, -0.5+2, 0.0-6,      0.0,  0.0,  1.0,  // Node 1
     0.0,  1.0+2, 0.0-6,      1.0,  0.0,  0.0,  // Node 2
      // right side
     0.0,  0.0+2, sq2-6,     1.0,  1.0,  1.0,  // Node 0
     0.0,  1.0+2, 0.0-6,     1.0,  0.0,  0.0,  // Node 2
    -c30, -0.5+2, 0.0-6,     0.0,  1.0,  0.0,  // Node 3
      // lower side
     0.0,  0.0+2, sq2-6,     1.0,  1.0,  1.0,  // Node 0 
    -c30, -0.5+2, 0.0-6,      0.0,  1.0,  0.0,  // Node 3
     c30, -0.5+2, 0.0-6,     0.0,  0.0,  1.0,  // Node 1 
     //
     -c30, -0.5+2, 0.0-6,    0.0,  1.0,  0.0,  // Node 3
     0.0,  1.0+2, 0.0-6,  1.0,  0.0,  0.0,  // Node 2
     c30, -0.5+2, 0.0-6,     0.0,  0.0,  1.0,  // Node 1

      0.0,  2+0.0-1, sq2-6,      1.0,  1.0,  1.0,  // Node 0
     c30, -0.5+2, 0.0-6,      0.0,  0.0,  1.0,  // Node 1
     0.0,  1.0+2, 0.0-6,      1.0,  0.0,  0.0,  // Node 2
      // right side
     0.0,  0.0+2-1, sq2-6,     1.0,  1.0,  1.0,  // Node 0
     0.0,  1.0+2, 0.0-6,     1.0,  0.0,  0.0,  // Node 2
    -c30, -0.5+2, 0.0-6,     0.0,  1.0,  0.0,  // Node 3
      // lower side
     0.0,  0.0+2-1, sq2-6,     1.0,  1.0,  1.0,  // Node 0 
    -c30, -0.5+2, 0.0-6,      0.0,  1.0,  0.0,  // Node 3
     c30, -0.5+2, 0.0-6,     0.0,  0.0,  1.0,  // Node 1 
     //
     -c30, -0.5+2, 0.0-6,    0.0,  1.0,  0.0,  // Node 3
     0.0,  1.0+2, 0.0-6,  1.0,  0.0,  0.0,  // Node 2
     c30, -0.5+2, 0.0-6,     0.0,  0.0,  1.0,  // Node 1

    
      
  ]);
  
  // Make our 'ground plane'
  makeGroundGrid();

	mySiz = forestVerts.length + gndVerts.length;

	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);

	// Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	forestStart = 0;							// we store the forest first.
  for(i=0,j=0; j< forestVerts.length; i++,j++) {
  	verticesColors[i] = forestVerts[j];
		} 
	gndStart = i;						// next we'll store the ground-plane;
	for(j=0; j< gndVerts.length; i++, j++) {
		verticesColors[i] = gndVerts[j];
		}

  
  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);
  // Assign the buffer object to a_Color and enable the assignment
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  return mySiz/floatsPerVertex;	
}

var g_EyeX = 0.0, g_EyeY = 0.0, g_EyeZ = 4.25; 
var lap_x = 0; lap_y = 0; lap_z = 0;
var up_x = 0;



function keydown(ev, gl, u_ViewMatrix, viewMatrix, projMatrix, isOrtho, u_ProjMatrix) {
//------------------------------------------------------

    if(ev.keyCode == 39) { // The right arrow key was pressed
    if(g_EyeZ <= 0){g_EyeX -= 0.2}
		else{g_EyeX += 0.2;}

    } else 
    if (ev.keyCode == 37) { // The left arrow key was pressed 
        if(g_EyeZ <= 0){g_EyeX += 0.2}
        else if(g_EyeZ == 0){g_EyeX+=0.2}
				else{g_EyeX -= 0.2;}	
    } else 
    if (ev.keyCode == 40) { // The up arrow key was pressed
        if(g_EyeZ < 0){g_EyeZ -= 0.21}
        else if(g_EyeZ <0){g_EyeZ -= 0.2}
        else{g_EyeZ += 0.2;  } 
    }else 
    if (ev.keyCode == 38) { // The down arrow key was pressed
         if(g_EyeZ <= 0){g_EyeZ += 0.21}
        else{g_EyeZ -= 0.2;}
    }else 
    if (ev.keyCode == 82) { // r key was pressed
        if(g_EyeZ < 0){lap_x -= 0.2}
        else{lap_x += 0.2;}    
    }else 
    if (ev.keyCode == 76) { // l key was pressed
        if(g_EyeZ < 0){lap_x += 0.2}
        else{lap_x -= 0.2;}   
    }else 
    if (ev.keyCode == 70) { // f key was pressed
        lap_y += 0.1;   
    }else 
    if (ev.keyCode == 68) { // d key was pressed
        lap_y -= 0.1;    
    }else 
    if (ev.keyCode == 84) { // t key was pressed
        g_EyeY += 0.2;    
    }
    else 
    if (ev.keyCode == 32) { // space key was pressed
        lap_x = 0;
        lap_y = 0;
        lap_z = 0;
    }else 
    if (ev.keyCode == 67) { // c key was pressed
//      
        
        
        if(isOrtho == 0){
          
          projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
          gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
          var isOrtho = 1; 
          console.log("is ortho = 1"  ,isOrtho);
          draw(gl, u_ViewMatrix, viewMatrix,isOrtho); 
        }
        else{
           
        projMatrix.setPerspective(90, canvas.width/canvas.height, 1, 100);
        gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

         var isOrtho = 0;
          console.log(isOrtho);
          
        }  

       
          
    }else 
    if (ev.keyCode == 89) { // y key was pressed
        g_EyeY -= 0.2;   
    }
    // Prevent the unnecessary drawing
    else{console.log("no button pressed that was found");}
    console.log("about to draw from cycle",isOrtho);
    draw(gl, u_ViewMatrix, viewMatrix,isOrtho);    
}

function draw(gl, u_ViewMatrix, viewMatrix,isOrtho) {
//==============================================================================
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // ====== Viewport 1 =========================
	gl.viewport(0, 0,	gl.drawingBufferWidth/2, gl.drawingBufferHeight/2);
  						
  //  camera view
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 	
  											lap_x, lap_y, lap_z, 								
  											up_x, 1, 0);								

  // Pass view projection matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	// Draw scene:
	drawMyScene(gl, u_ViewMatrix, viewMatrix,isOrtho);
 
  // =========== Viewport 2 =================
	gl.viewport(gl.drawingBufferWidth/2, 0, gl.drawingBufferWidth/2, gl.drawingBufferHeight/2);

	// view matrix:
  viewMatrix.setLookAt(-20.0, 0.0, -10.0, // eye position
  										0, 0, -5.0, 									// look-at point 
  										0, 1, 0);									// up vector

  // Pass  view projection matrix 
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	// Draw scene:
	drawMyScene(gl, u_ViewMatrix, viewMatrix,isOrtho);
    
  // ======== Third Viewport ===============
	gl.viewport(0	, gl.drawingBufferHeight/2, gl.drawingBufferWidth/2, gl.drawingBufferHeight/2);

	// view matrix:
  viewMatrix.setLookAt(1.0, 2.0, 8.0, 	
  											0, 0, 0, 								
  											0, 1, 0);								
  // Pass view projection matrix 
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  
	// Draw scene:
	drawMyScene(gl, u_ViewMatrix, viewMatrix,isOrtho);

  // =========== Viewport 4 ===================
  gl.viewport(gl.drawingBufferWidth/2, gl.drawingBufferWidth/2, gl.drawingBufferWidth/2, gl.drawingBufferHeight/2);
              
  // Set camera view
  viewMatrix.setLookAt(0, 35.0, 1.0,  
                        0, 0, -5,                
                        0, 1, 0);               

  // Pass projection matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Draw scene:
  drawMyScene(gl, u_ViewMatrix, viewMatrix,isOrtho);
  console.log("draw my scene! is ortho is:", isOrtho);
}

function drawMyScene(myGL, myu_ViewMatrix, myViewMatrix,isOrtho) {
//===============================================================================
console.log("isortho is this inside dms:", isOrtho);
myGL.drawArrays(myGL.TRIANGLES, 0,12);	

 myGL.drawArrays(myGL.TRIANGLES, 12,36); 

myGL.drawArrays(myGL.TRIANGLES, 36,60);

myGL.drawArrays(myGL.TRIANGLES, 60,84);

myGL.drawArrays(myGL.TRIANGLES, 60,84);

myGL.drawArrays(myGL.TRIANGLES,84,108);
myGL.drawArrays(myGL.TRIANGLES,108,120);
//myGL.drawArrays(myGL.TRIANGLES,120,132);
//myGL.drawArrays(myGL.LINE_STRIP,120,121);
  
  // translate our view 
 
  myViewMatrix.rotate(-90.0, 1,0,0);								
	myViewMatrix.translate(0.0, 0.0, -0.6);	
	myViewMatrix.scale(0.4, 0.4,0.4);		

  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  

 //draw ground: 
  myGL.drawArrays(myGL.LINES,	gndStart/floatsPerVertex,	gndVerts.length/floatsPerVertex);		

}


function reload(){
location.reload();

}

function help(){
alert("These are your directions!\n\nUse up and down arrow to go forward and backwards.\n\nUse right and left arrow to move right and left\n\nuUse f to look up and d to look down\n\nUse r and l to look right and left.\n\nUse t to fly up and y to dive down.\n\nUse the space bar to look at origin!\n\nUse c to adjust camera (only works once)");

}
