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

let imageMode = 4; // set default imageMode


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

}



function draw() {
  fpsHtml.innerHTML = "FPS: " + frameRate().toFixed(2);
  stroke(0, 0, 0, 0);
  camera.loadPixels();


  if(imageMode == 0){ // squares
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
  }

  if(imageMode == 1){ // circles
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
  }

  if(imageMode == 2){ // sobel edge
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
  }

  if(imageMode == 3){ // sobel edge with threshold
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
  }

  if(imageMode == 4){ // sobel edge with dot size changing
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
  }

  if(imageMode == 5){ // sobel edge with dot size changing better (worse?) detection
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
  }
}




function mousePressed(){
  imageMode++;
  if(imageMode > 5) imageMode = 0;
}


function keyPressed(){
  if(key == "a") imageMode--;
  if(key == "d") imageMode++;
  if(imageMode > 5) imageMode = 0;
  if(imageMode < 0) imageMode = 5;
}






















