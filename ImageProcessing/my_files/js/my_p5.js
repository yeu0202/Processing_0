$(function(){
  
});

/*
  camera setup code copied from https://www.openprocessing.org/sketch/956277
*/

let camera; // I still don't like using let, reminds me of maths
const camWidth = 720;
const camHeight = 540;
let proportion = camWidth/camHeight;
let scaleToCam;
let size_decrease = 0.95;
let function_array;

let fpsHtml;

const sampleSize = 6;
const maxColor = 765; // 255*3 for grayscale calculation

let imageMode = 27; // set default imageMode

var display_memory_lock = -1;
var display_memory;

let positions;
let eye_distance;

/* Initialize the two edge kernel Gx and Gy for sobel edge */
/*  
    Prewitt: 1 and 1
    Sobel: 1 and 2
    I like: 1 and 3 <- gives more emphasis on middle pixel
    Scharr: 3 and 10
    Scharr optimal: 47 and 162
*/
let smaller_change = 1; 
let bigger_change = 3;

var Gx = [
  [-smaller_change, 0, smaller_change],
  [-bigger_change, 0, bigger_change],
  [-smaller_change, 0, smaller_change]
];
var Gy = [
  [-smaller_change,-bigger_change,-smaller_change],
  [ 0, 0, 0],
  [ smaller_change, bigger_change, smaller_change]
];

/*
let polygonArray;

class Polygon{
  constructor(s_){
    this.x = 0;
    this.y = 0;
    this.s = s_;
  }

  display(){
    push();
    translate(this.x, this.y);
    shape(this.s);
    pop();
  }
}*/

let tracker;


let color_out;


function setup() {
	if (windowHeight < windowWidth) {
		createCanvas(round(windowHeight * proportion)*size_decrease, windowHeight*size_decrease);
    scaleToCam = width/camWidth;
    console.log(round(windowHeight * proportion)*size_decrease);
    console.log(windowHeight*size_decrease);
	} else {
		createCanvas(windowWidth*size_decrease, round(windowHeight / proportion)*size_decrease);
		scaleToCam = height/camHeight;
    console.log(windowWidth*size_decrease);
    console.log(round(windowHeight / proportion)*size_decrease);
  }
  
  
  camera = createCapture(VIDEO);
  camera.size(camWidth, camHeight);
  camera.elt.setAttribute('playsinline', '');


  tracker = new clm.tracker();
  tracker.init();
  tracker.start(camera.elt);

/* createShape() isn't implemented in p5.js
  let mySquare = createShape();
  mySquare.beginShape();
  mySquare.noStroke();
  mySquare.fill(0);
  mySquare.vertex(0, 0);
  mySquare.vertex(0, sampleSize);
  mySquare.vertex(sampleSize, sampleSize);
  mySquare.vertex(sampleSize, 0);
  mySquare.endShape(CLOSE);

  for(let i=0; i<camWidth/sampleSize; i++){
    for(let j=0; j<camHeight/sampleSize; j++){
      polygonArray.push(new Polygon(mySquare));
    }
  }*/

  fpsHtml = document.getElementById("fps_text");
  stroke(0, 0); // put this here because I don't think I'll ever need a stroke
  textSize(18);
  strokeWeight(3);


  display_memory = createImage(camWidth, camHeight);
  display_memory.loadPixels();







  function display_title(words){
    stroke(0);
    fill(255)
    let text_to_display = imageMode + ": " + words;
    text(text_to_display, 30, 40);
    stroke(0, 0);
  }

  function processMask(mask_size){
    scale(scaleToCam);
    background(255);

    let output = createImage(camWidth, camHeight);
    output.loadPixels();

    let mask = 0;
    for(var i=0; i < mask_size; i++){
      mask >>= 1;
      mask |= 128;
    }

    for (let y = 0; y < camHeight; y++) {
      for (let x = 0; x < camWidth; x++) {
        const cam_index = ((y * camWidth) + x) * 4;
        
        output.pixels[cam_index] = camera.pixels[cam_index] & mask;
        output.pixels[cam_index+1] = camera.pixels[cam_index+1] & mask;
        output.pixels[cam_index+2] = camera.pixels[cam_index+2] & mask;
        output.pixels[cam_index+3] = 255;
      }
    }
    output.updatePixels();
    image(output, 0, 0);
    display_title(mask_size + ' bits of information, camera');
  }

  /*                                                                                                   
88888888888                                                 88                                       88  
88                                                   ,d     ""                                       88  
88                                                   88                                              88  
88aaaaa      88       88  8b,dPPYba,    ,adPPYba,  MM88MMM  88   ,adPPYba,   8b,dPPYba,   ,adPPYba,  88  
88"""""      88       88  88P'   `"8a  a8"     ""    88     88  a8"     "8a  88P'   `"8a  I8[    ""  88  
88           88       88  88       88  8b            88     88  8b       d8  88       88   `"Y8ba,   ""  
88           "8a,   ,a88  88       88  "8a,   ,aa    88,    88  "8a,   ,a8"  88       88  aa    ]8I  aa  
88            `"YbbdP'Y8  88       88   `"Ybbd8"'    "Y888  88   `"YbbdP"'   88       88  `"YbbdP"'  88  
  */

  
  function_array = [
    function(){ // display camera
      scale(scaleToCam);
      background(255);
      
      image(camera, 0, 0);


      noFill();
      stroke(255);
      beginShape();
      for (var i = 0; i < positions.length; i++) {
          vertex(positions[i][0], positions[i][1]);
      }
      endShape();

      noStroke();
      for (var i = 0; i < positions.length; i++) {
          fill(map(i, 0, positions.length, 0, 360), 255, 100);
          ellipse(positions[i][0], positions[i][1], 4, 4);
          text(i, positions[i][0], positions[i][1]);
      }
      
      stroke(255,255,255);
      //if(positions)console.log(Math.hypot((positions[23][0]-positions[28][0]), (positions[23][1] - positions[28][1])));
      // distance between eyes goes between 120-200 
      if (positions.length > 0) {
          var mouthLeft = createVector(positions[44][0], positions[44][1]);
          var mouthRight = createVector(positions[50][0], positions[50][1]);
          var smile = mouthLeft.dist(mouthRight);
          // uncomment the line below to show an estimate of amount "smiling"
          // rect(20, 20, smile * 3, 20);

          // uncomment for a surprise
          // noStroke();
          // fill(0, 255, 255);
          // ellipse(positions[62][0], positions[62][1], 50, 50);
      }

      display_title('display camera');
    },

    function(){ // squares
      scale(scaleToCam);
      background(255);
  
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const i = ((y * camWidth) + x) * 4;
          const r = camera.pixels[i];
          const g = camera.pixels[i + 1];
          const b = camera.pixels[i + 2];
          fill(r,g,b);
          rect(x, y, x+sampleSize, y+sampleSize);
        }
      }
      display_title('squares');
    },

    function(){ // circles
      scale(scaleToCam);
      background(255);
  
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const i = ((y * camWidth) + x) * 4;
          const r = camera.pixels[i];
          const g = camera.pixels[i + 1];
          const b = camera.pixels[i + 2];
          fill(r,g,b);
          ellipse(x+sampleSize/2, y+sampleSize/2, sampleSize, sampleSize);
        }
      }
      display_title('circles');
    },

    function(){ // circles, grayscale
      scale(scaleToCam);
      background(255);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const i = ((y * camWidth) + x) * 4;
          const r = camera.pixels[i];
          const g = camera.pixels[i + 1];
          const b = camera.pixels[i + 2];
          fill((r+g+b)/3);
          ellipse(x+sampleSize/2, y+sampleSize/2, sampleSize, sampleSize);
        }
      }
      display_title('grayscale, circles');
    },

    function(){ // sobel edge
      scale(scaleToCam);
      background(0);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          
          fill(absG);
          ellipse(x+sampleSize/2, y+sampleSize/2, sampleSize, sampleSize);
        }
      }
      display_title('sobel edge detection, circles');
    },

    function(){ // sobel edge with threshold
      scale(scaleToCam);
      background(0);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          let threshold = 70;
          if(absG>threshold) fill(255);
          else fill(0);
          
          ellipse(x+sampleSize/2, y+sampleSize/2, sampleSize, sampleSize);
        }
      }
      display_title('sobel edge detection with threshold, circles');
    },

    function(){ // sobel edge with dot size changing
      scale(scaleToCam);
      background(0);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          fill(255)
          
          ellipse(x+sampleSize/2, y+sampleSize/2, absG/400*sampleSize, absG/400*sampleSize);
        }
      }
      display_title('sobel edge detection, circle size');
    },

    function(){ // sobel edge with dot size changing better (worse?) detection
      scale(scaleToCam);
      background(0);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4*sampleSize + j*camWidth*4*sampleSize;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          fill(255)
          
          ellipse(x+sampleSize/2, y+sampleSize/2, absG/400*sampleSize, absG/400*sampleSize);
        }
      }
      display_title('sobel edge detection 2, circle size');
    },

    function(){ // dot size based on pixel darkness (color)
      scale(scaleToCam);
      background(255);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const i = ((y * camWidth) + x) * 4;
          const r = camera.pixels[i];
          const g = camera.pixels[i + 1];
          const b = camera.pixels[i + 2];
          fill(r, g, b);
          ellipse(x+sampleSize/2, y+sampleSize/2, (1-((r+g+b)/3/255))*sampleSize, (1-((r+g+b)/3/255))*sampleSize);
        }
      }
      display_title('dot size based on pixel darkness (color), circles');
    },
  
    function(){ // dot size based on pixel darkness (grayscale)
      scale(scaleToCam);
      background(255);
    
      for (let y = 0; y < camHeight; y += sampleSize) {
        for (let x = 0; x < camWidth; x += sampleSize) {
          const i = ((y * camWidth) + x) * 4;
          const r = camera.pixels[i];
          const g = camera.pixels[i + 1];
          const b = camera.pixels[i + 2];
          fill((r+g+b)/3);
          ellipse(x+sampleSize/2, y+sampleSize/2, (1-((r+g+b)/3/255))*sampleSize, (1-((r+g+b)/3/255))*sampleSize);
        }
      }
      display_title('dot size based on pixel darkness (grayscale), circles');
    },

    function(){ // camera with sobel edge
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
      
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          
          output.pixels[cam_index] = 0;
          output.pixels[cam_index+1] = absG;
          output.pixels[cam_index+2] = absG;
          output.pixels[cam_index+3] = 255;
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
      display_title('sobel edge, camera');
    },

    function(){ // remove last 7 bits of color information
      processMask(1);
    },
    function(){ // remove last 6 bits of color information
      processMask(2);
    },
    function(){ // remove last 5 bits of color information
      processMask(3);
    },
    function(){ // remove last 4 bits of color information
      processMask(4);
    },
    function(){ // remove last 3 bits of color information
      processMask(5);
    },
    function(){ // remove last 2 bits of color information
      processMask(6);
    },
    function(){ // remove last 1 bits of color information
      processMask(7);
    },
    function(){ // remove last 0 bits of color information (same as display camera)
      processMask(8);
    },

    function(){ // RGB threshold
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
  
      for(let i = 0; i<camera.pixels.length; i++){
        if(camera.pixels[i] > 100){
          output.pixels[i] = 255;
        }
        else{
          output.pixels[i] = 0;
        }
      }
      output.updatePixels();
      image(output, 0, 0);
      display_title('threshold (color), camera');
    },

    function(){ // threshold
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
  
  
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          
          let pixel_strength = (camera.pixels[cam_index] + camera.pixels[cam_index+1] + camera.pixels[cam_index+2])/3;
  
          if(pixel_strength>127){
            output.pixels[cam_index] = 255;
            output.pixels[cam_index+1] = 255;
            output.pixels[cam_index+2] = 0;
          }
          else{
            output.pixels[cam_index] = 0;
            output.pixels[cam_index+1] = 0;
            output.pixels[cam_index+2] = 0;
          }
          output.pixels[cam_index+3] = 255;
        }
      }
      output.updatePixels();
      image(output, 0, 0);
      display_title('threshold, camera');
    },

    function(){ // camera with sobel edge addition
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
      
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          
          output.pixels[cam_index] = (absG + camera.pixels[cam_index])/2;
          output.pixels[cam_index+1] = (absG + camera.pixels[cam_index+1])/2;
          output.pixels[cam_index+2] = (absG + camera.pixels[cam_index+2])/2;
          output.pixels[cam_index+3] = 255;
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
      display_title('sobel edge addition, camera');
    },

    function(){ // camera with sobel edge addition 2
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
      
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          
          output.pixels[cam_index] = (absG + 2*camera.pixels[cam_index])/3;
          output.pixels[cam_index+1] = (absG + 2*camera.pixels[cam_index+1])/3;
          output.pixels[cam_index+2] = (absG + 2*camera.pixels[cam_index+2])/3;
          output.pixels[cam_index+3] = 255;
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
      display_title('sobel edge addition 2, camera');
    },

    function(){ // camera with sobel edge addition 3
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
      
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          
          output.pixels[cam_index] = absG/3 + camera.pixels[cam_index];
          output.pixels[cam_index+1] = absG/3 + camera.pixels[cam_index+1];
          output.pixels[cam_index+2] = absG/3 + camera.pixels[cam_index+2];
          output.pixels[cam_index+3] = 255;
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
      display_title('sobel edge addition 3, camera');
    },

    function(){ // sobel edge with threshold
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
      
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          if(absG>90){
            output.pixels[cam_index] = 255;
            output.pixels[cam_index+1] = 0;
            output.pixels[cam_index+2] = 255;
            output.pixels[cam_index+3] = 255;
          }
          else{
            output.pixels[cam_index] = 0;
            output.pixels[cam_index+1] = 0;
            output.pixels[cam_index+2] = 0;
            output.pixels[cam_index+3] = 255;
          }
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
      display_title('sobel edge with threshold, camera');
    },

    function(){ // movement detection
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
  
      if(display_memory_lock != 25){
        for (let i=0; i<camera.pixels.length; i++){
          display_memory.pixels[i] = camera.pixels[i];
        }
        display_memory_lock = 25;
      }
      for(let i=0; i<camera.pixels.length; i++){
        if(Math.abs(display_memory.pixels[i] - camera.pixels[i]) > 40){
          output.pixels[i] = camera.pixels[i];
        }
        else{
          output.pixels[i] = 255;
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
  
  
      for(let i=0; i<camera.pixels.length; i++){
        display_memory.pixels[i] = (9*display_memory.pixels[i] + camera.pixels[i])/10;
      }
  
      display_title('movement detection, camera');
    },

    function(){ // movement detection
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
  
      if(display_memory_lock != 26){
        for (let i=0; i<camera.pixels.length; i++){
          display_memory.pixels[i] = camera.pixels[i];
        }
        display_memory_lock = 26;
      }
      
      let numDifferentPixels = 0;
  
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          let pixel_difference = Math.abs(display_memory.pixels[cam_index] - camera.pixels[cam_index]) 
                      + Math.abs(display_memory.pixels[cam_index+1] - camera.pixels[cam_index+1])
                      + Math.abs(display_memory.pixels[cam_index+2] - camera.pixels[cam_index+2]);
          pixel_difference = pixel_difference/3
          if(pixel_difference > 30){
            output.pixels[cam_index] = camera.pixels[cam_index];
            output.pixels[cam_index+1] = camera.pixels[cam_index+1];
            output.pixels[cam_index+2] = camera.pixels[cam_index+2];
            numDifferentPixels++;
          }
          else{
            output.pixels[cam_index] = 255;
            output.pixels[cam_index+1] = 255;
            output.pixels[cam_index+2] = 255;
          }
          output.pixels[cam_index+3] = 255;
        }
      }
  
      /*for(let i=0; i<camera.pixels.length; i++){
        if(output.pixels[i] != 255) output.pixels[i] *= 10000/numDifferentPixels;
      }*/
  
      output.updatePixels();
      image(output, 0, 0);
  
  
      for(let i=0; i<camera.pixels.length; i++){
        display_memory.pixels[i] = (9*display_memory.pixels[i] + camera.pixels[i])/10;
      }
  
      display_title('movement detection 2, camera');
    },

    function(){ // sobel edge with threshold
      scale(scaleToCam);
      background(255);
  
      let output = createImage(camWidth, camHeight);
      output.loadPixels();
      
      for (let y = 0; y < camHeight; y++) {
        for (let x = 0; x < camWidth; x++) {
          const cam_index = ((y * camWidth) + x) * 4;
          /* Get the pixel
          multiply the rgb by the coefficient in the array like in blur
          find the mean of r, g, b
          repeat for Gy
          use hypot to find the |G| for each pixel   (a^2 + b^2)^(1/2)
          apply the |G| to output data*/
          var sumRx = 0, sumGx = 0, sumBx = 0, sumRy = 0, sumGy = 0, sumBy = 0, absG;
          //var meanGx, meanGy;
          for(var j = -1; j <= 1; j++){
            for(var i = -1; i <= 1; i++){
              const index_shift = cam_index + i*4 + j*camWidth*4;
              const r = camera.pixels[index_shift];
              const g = camera.pixels[index_shift + 1];
              const b = camera.pixels[index_shift + 2];
  
              // Gx
              var coeff = Gx[j+1][i+1];
              sumRx += r * coeff;
              sumGx += g * coeff;
              sumBx += b * coeff;
  
              // Gy
              coeff = Gy[j+1][i+1];
              sumRy += r * coeff;
              sumGy += g * coeff;
              sumBy += b * coeff;
            }
          }
  
          //meanGx = (sumRx + sumGx + sumBx)/3;
          //meanGy = (sumRy + sumGy + sumBy)/3;
          absG = Math.hypot((sumRx + sumGx + sumBx)/3, (sumRy + sumGy + sumBy)/3);
          if(absG>90){
            output.pixels[cam_index] = color_out.r * eye_distance;
            output.pixels[cam_index+1] = color_out.g * eye_distance;
            output.pixels[cam_index+2] = color_out.b * eye_distance;
            output.pixels[cam_index+3] = 255;
          }
          else{
            output.pixels[cam_index] = 0;
            output.pixels[cam_index+1] = 0;
            output.pixels[cam_index+2] = 0;
            output.pixels[cam_index+3] = 255;
          }
        }
      }
  
      output.updatePixels();
      image(output, 0, 0);
      display_title('sobel edge with threshold, face distance detection, camera');
    },
  ]
}



function draw() {
  fpsHtml.innerHTML = "FPS: " + frameRate().toFixed(2);
  camera.loadPixels();

  // get face tracker data
  positions = tracker.getCurrentPosition();
  // get eye distance for face distance
  eye_distance = 200;
  if(positions) eye_distance = Math.hypot((positions[23][0]-positions[28][0]), (positions[23][1] - positions[28][1]));
  eye_distance = (eye_distance-100)/100; // to make it a number between 0 and 1;
  if(eye_distance<0) eye_distance = 0;
  else if(eye_distance > 1) eye_distance = 1;
  // between 100 and 200;

  function HSVtoRGB(h, s, v) { // from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
  }

  if(positions){
    let nosePosition = positions[62];
    //console.log(nosePosition);
    let hueValue = (nosePosition[1]/camHeight*2)%1;// y value of nose looped twice over camHeight
    let saturationValue = 0;
    if(nosePosition[0]<camWidth/2){
      saturationValue = nosePosition[0]/(camWidth/2);
    }
    else{
      saturationValue = nosePosition[0] - camWidth/2;
      saturationValue = saturationValue/(camWidth/2);
      saturationValue = 1-saturationValue;
    }

    hueValue = hueValue + 90/360;
    hueValue = hueValue%1; // want cyan as centerish color
    color_out = HSVtoRGB(hueValue, saturationValue, 1);
    console.log(color_out);
  }


  function_array[imageMode]();
}




function mousePressed(){
  imageMode++;
  if(imageMode > function_array.length-1) imageMode = 0;
}


function keyPressed(){
  if(key == "a") imageMode--;
  if(key == "d") imageMode++;
  if(keyCode == LEFT_ARROW) imageMode--;
  if(keyCode == RIGHT_ARROW) imageMode++;
  if(key == "0") imageMode = 0;
  if(imageMode > function_array.length-1) imageMode = 0;
  if(imageMode < 0) imageMode = function_array.length-1;
}






















