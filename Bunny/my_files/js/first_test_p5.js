$(function(){
  
});

// global variables because why not
var blinking_timer = 0;

function setup() {
  createCanvas(1000, 1000);
  smooth();
  background(250);
  stroke(200);
  rect(1, 1, 998, 998);
  for(var i=0; i<1000; i++){
    var randX = random(1,1000);
    var randY = random(1,1000);
    var color = floor(random(1,4));
    stroke(0, 0, 0, 0);
    switch(color){
      case 1:
        fill(255,255,0,80);
        break;
      case 2:
        fill(0,255,255,80);
        break;
      default:
        fill(255,0,255,80);
    }
    var circ_size = random(5,50);
    ellipse(randX, randY, circ_size, circ_size);
  }
}



function draw() {
  blinking_timer++;
  if(blinking_timer > 1000) blinking_timer = 101;
/*
  // ding dong
  ellipseMode(CENTER);
  fill(123,35,73); // 255,218,185
  stroke(235,123,23);
  ellipse(130,225,200,50); // 100,150,50,200
  ellipse(125,250,50,50); // 75,250,50,50
  ellipse(155,250,50,50);// 125,250,50,50
  
  // squares
  stroke(0,0,0);
  fill(0,0,0,130);
  rect(10,10,50,50);
  fill(255,255,255,130);
  rect(10,60,50,50);
  rect(60,10,50,50);
  fill(127,127,127,130);
  rect(60,60,50,50);
  
  // red line
  stroke(0,255,255);
  point(270,270);
  line(234,363,163,264);
  */

  // dynamic drawing_test
  stroke(0);
  fill(255, 0, 255);
  /*rectMode(CENTER);
  rect(mouseX, mouseY, 10, 10);
  fill(0, 255, 0);
  rect(pmouseX, pmouseY, 15, 5);*/
  var mouse_speed = pow(pow((mouseX-pmouseX), 2) + pow((mouseY-pmouseY), 2), (1/2));
  stroke(mouse_speed*2, mouse_speed+100, mouse_speed*3+100);
  strokeWeight(mouse_speed);
  line(pmouseX, pmouseY, mouseX, mouseY);
  rectMode(CORNER);
  strokeWeight(1);


  /*
                                                                          
  88888888ba   88        88  888b      88  888b      88  8b        d8  88  
  88      "8b  88        88  8888b     88  8888b     88   Y8,    ,8P   88  
  88      ,8P  88        88  88 `8b    88  88 `8b    88    Y8,  ,8P    88  
  88aaaaaa8P'  88        88  88  `8b   88  88  `8b   88     "8aa8"     88  
  88""""""8b,  88        88  88   `8b  88  88   `8b  88      `88'      88  
  88      `8b  88        88  88    `8b 88  88    `8b 88       88       ""  
  88      a8P  Y8a.    .a8P  88     `8888  88     `8888       88       aa  
  88888888P"    `"Y8888Y"'   88      `888  88      `888       88       88  
                                                                                
  https://www.messletters.com/en/big-text/  
  */
  // ears
  // left ear
  stroke(0, 0, 0);
  fill(255, 255, 255);
  var ear_radius = 900;
  arc(750, 251, ear_radius, ear_radius, 3*PI/4+0.3, 5*PI/4-0.3, OPEN);
  arc(-46, 251, ear_radius, ear_radius, 7*PI/4+0.3, 1*PI/4-0.3, OPEN);
  var inner_ear = ear_radius - 150;
  stroke(255, 182, 193);
  fill(255, 182, 193);
  arc(690, 251, inner_ear, inner_ear, 3*PI/4+0.3, 5*PI/4-0.338, OPEN);
  arc(14, 251, inner_ear, inner_ear, 7*PI/4+0.338, 1*PI/4-0.30, OPEN);
  // right ear
  stroke(0, 0, 0);
  fill(255, 255, 255);
  var shift_distance = 300;
  arc(750+shift_distance, 251, ear_radius, ear_radius, 3*PI/4+0.3, 5*PI/4-0.3, OPEN);
  arc(-46+shift_distance, 251, ear_radius, ear_radius, 7*PI/4+0.3, 1*PI/4-0.3, OPEN);
  stroke(255, 182, 193);
  fill(255, 182, 193);
  arc(690+shift_distance, 251, inner_ear, inner_ear, 3*PI/4+0.3, 5*PI/4-0.338, OPEN);
  arc(14+shift_distance, 251, inner_ear, inner_ear, 7*PI/4+0.338, 1*PI/4-0.30, OPEN);

  // Face
  stroke(0, 0, 0);
  fill(255, 255, 255);
  ellipse(500, 550, 500, 500); // midpoint, midpoint, diameter x2
  stroke(0, 0, 0, 0); // make the rect lines invisible
  rect(250, 550, 500, 250); 
  stroke(0, 0, 0);
  line(250, 550, 250, 650); // then add the needed outlines back
  line(750, 550, 750, 650);
  line(250, 800, 750, 800);
  //cheeks
  var arc_radius = 235;
  arc(283, 687, arc_radius, arc_radius, PI/2+0.28, 3*PI/2-0.28, OPEN);
  arc(1000-283, 687, arc_radius, arc_radius, PI + (PI/2+0.28), PI + (3*PI/2-0.28), OPEN);

  // feet
  arc(330, 780, 125, 115, PI-0.5, 0+0.5, CHORD);
  arc(670, 780, 125, 115, PI-0.5, 0+0.5, CHORD);
  // toe lines
  stroke(150, 150, 150);
  line(305, 785, 305, 808);
  line(330, 780, 330, 808);
  line(355, 785, 355, 808);
  line(500+(500-305), 785, 500+(500-305), 808);
  line(500+(500-330), 780, 500+(500-330), 808);
  line(500+(500-355), 785, 500+(500-355), 808);
  
  if(blinking_timer > 10){
    // eyes
    var left_eyeX = 400;
    var left_eyeY = 500;
    var right_eyeX = 600;
    var right_eyeY = 500;
    var left_X_shift = (mouseX - left_eyeX)/15;
    var left_Y_shift = (mouseY - left_eyeY)/15;
    var right_X_shift = (mouseX - right_eyeX)/15;
    var right_Y_shift = (mouseY - right_eyeY)/15;

    var rand_color = random(100,255);

    fill(rand_color, 0, 255);
    stroke(0, 0, 0);
    ellipse(400+left_X_shift, 500+left_Y_shift, 30, 100);
    ellipse(600+right_X_shift, 500+right_Y_shift, 30, 100);
    fill(200,200,200);
    ellipse(395+left_X_shift, 470+left_Y_shift, 10, 10);
    ellipse(595+right_X_shift, 470+right_Y_shift, 10, 10);
  }

  // nose
  stroke(0, 0, 0, 0);
  fill(255-mouseX/4, 182, 193); // 255, 182, 193
  triangle(470, 600, 530, 600, 500, 640);
  // mouth
  strokeWeight(2);
  stroke(255-mouseY/4, 152, 160); // 217, 152, 160
  line(500, 640, 500, 660);
  fill(0, 0, 0, 0);
  arc(475, 660, 50, 50, 0, 3*PI/4, OPEN);
  arc(525, 660, 50, 50, PI/4, PI, OPEN);
  strokeWeight(1);

  // whiskers
  stroke(100, 100, 100);
  var whisker_radius = 1400;
  // left whiskers
  arc(130, 1270, whisker_radius, whisker_radius, 3*PI/2-0.1, 3*PI/2+0.3, OPEN);
  arc(164, 1295, whisker_radius, whisker_radius, 3*PI/2-0.15, 3*PI/2+0.25, OPEN);
  arc(198, 1315, whisker_radius, whisker_radius, 3*PI/2-0.2, 3*PI/2+0.2, OPEN);
  // right whiskers
  arc(1000-130, 1270, whisker_radius, whisker_radius, 3*PI/2-0.3, 3*PI/2+0.1, OPEN);
  arc(1000-164, 1295, whisker_radius, whisker_radius, 3*PI/2-0.25, 3*PI/2+0.15, OPEN);
  arc(1000-198, 1315, whisker_radius, whisker_radius, 3*PI/2-0.2, 3*PI/2+0.2, OPEN);

}



function mousePressed(){
  stroke(0, 0, 0, 0);
  fill(255, 20, 147);
  ellipse(mouseX, mouseY, 30, 30);
  blinking_timer = 0;
}

function mouseDragged(){
  stroke(0, 0, 0, 0);
  fill(255, 20, 147);
  ellipse(mouseX, mouseY, 30, 30);
}

function keyPressed(){
  stroke(0, mouseX/4, 255);
  fill(255, mouseX/4, 0);
  strokeWeight(7);
  line(500, 500, mouseX, mouseY);
  blinking_timer = 0;
  strokeWeight(1);
  if(key == " "){
    background(250);
    stroke(200);
    fill(255);
    rect(1, 1, 998, 998);
    for(var i=0; i<1000; i++){
      var randX = random(1,1000);
      var randY = random(1,1000);
      var color = floor(random(1,4));
      stroke(0, 0, 0, 0);
      switch(color){
        case 1:
          fill(255,255,0,80);
          break;
        case 2:
          fill(0,255,255,80);
          break;
        default:
          fill(255,0,255,80);
      }
      var circ_size = random(5,50);
      ellipse(randX, randY, circ_size, circ_size);
    }
  }
  if(key == "r"){ // don't set it to i<1000 and j<1000 or else it will freeze
    for(var i=0; i<100; i++){
      for(var j=0; j<100; j++){
        stroke(255, i*10/4, 0);
        line(500, 500, i*10, j*10);
      }
    }
  }
  if(key == "x"){
    for(var i=0; i<1000; i++){
      var randX = random(1,1000);
      var randY = random(1,1000);
      var color = floor(random(1,4));
      stroke(0, 0, 0, 0);
      switch(color){
        case 1:
          fill(255,255,0,80);
          break;
        case 2:
          fill(0,255,255,80);
          break;
        default:
          fill(255,0,255,80);
      }
      var circ_size = random(5,50);
      ellipse(randX, randY, circ_size, circ_size);
    }
  }
}

































