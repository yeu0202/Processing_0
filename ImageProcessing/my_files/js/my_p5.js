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

let fpsHtml;

const sampleSize = 6;
const maxColor = 765; // 255*3 for grayscale calculation

let imageMode = 24; // set default imageMode
let maxModes = 24; // set maximum number of modes


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


function setup() {
	if (windowHeight < windowWidth) {
		createCanvas(round(windowHeight * proportion)*size_decrease, windowHeight*size_decrease);
		scaleToCam = width/camWidth;
	} else {
		createCanvas(windowWidth*size_decrease, round(windowHeight / proportion)*size_decrease);
		scaleToCam = height/camHeight;
  }
  
  camera = createCapture(VIDEO);
  camera.size(camWidth, camHeight);


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
}



function draw() {
  fpsHtml.innerHTML = "FPS: " + frameRate().toFixed(2);
  camera.loadPixels();

  function display_title(words){
    stroke(0);
    fill(255)
    text(words, 30, 40);
    stroke(0, 0);
  }



  if(imageMode == 0){ // display camera
    scale(scaleToCam);
    background(255);
    
    image(camera, 0, 0);
    display_title('display camera');
  }


  if(imageMode == 1){ // squares
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
  }

  if(imageMode == 2){ // circles
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
  }

  if(imageMode == 3){ // circles, grayscale
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
  }

  if(imageMode == 4){ // sobel edge
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
        
        fill(absG);
        ellipse(x+sampleSize/2, y+sampleSize/2, sampleSize, sampleSize);
      }
    }
    display_title('sobel edge detection, circles');
  }

  if(imageMode == 5){ // sobel edge with threshold
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
  }

  if(imageMode == 6){ // sobel edge with dot size changing
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
  }

  if(imageMode == 7){ // sobel edge with dot size changing better (worse?) detection
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
  }

  if(imageMode == 8){ // dot size based on pixel darkness (color)
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
  }

  if(imageMode == 9){ // dot size based on pixel darkness (grayscale)
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
  }


  if(imageMode == 10){ // camera with sobel edge
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

  if(imageMode == 11){ // remove last 7 bits of color information
    processMask(1);
  }
  if(imageMode == 12){ // remove last 6 bits of color information
    processMask(2);
  }
  if(imageMode == 13){ // remove last 5 bits of color information
    processMask(3);
  }
  if(imageMode == 14){ // remove last 4 bits of color information
    processMask(4);
  }
  if(imageMode == 15){ // remove last 3 bits of color information
    processMask(5);
  }
  if(imageMode == 16){ // remove last 2 bits of color information
    processMask(6);
  }
  if(imageMode == 17){ // remove last 1 bits of color information
    processMask(7);
  }
  if(imageMode == 18){ // remove last 0 bits of color information (same as display camera)
    processMask(8);
  }

  if(imageMode == 19){ // RGB threshold
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
  }

  if(imageMode == 20){ // threshold
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
  }


  if(imageMode == 21){ // camera with sobel edge addition
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
  }

  if(imageMode == 22){ // camera with sobel edge addition 2
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
  }

  if(imageMode == 23){ // camera with sobel edge addition 3
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
  }

  if(imageMode == 24){ // sobel edge with threshold
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
  }
}




function mousePressed(){
  imageMode++;
  if(imageMode > maxModes) imageMode = 0;
}


function keyPressed(){
  if(key == "a") imageMode--;
  if(key == "d") imageMode++;
  if(keyCode == LEFT_ARROW) imageMode--;
  if(keyCode == RIGHT_ARROW) imageMode++;
  if(key == "0") imageMode = 0;
  if(imageMode > maxModes) imageMode = 0;
  if(imageMode < 0) imageMode = maxModes;
}






















