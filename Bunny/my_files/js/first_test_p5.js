$(function(){
  
});

function setup() {
  createCanvas(1000, 1000);
}


function draw() {
  // setup
  background(250);
  stroke(200);
  rect(1, 1, 998, 998);


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
  
  // grey box because I don't feel like deleting the old stuff yet
  fill(250);
  stroke(250);
  rect(2, 2, 500, 500);


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
  ear_radius = 900;
  arc(750, 251, ear_radius, ear_radius, 3*PI/4+0.3, 5*PI/4-0.3, OPEN);
  arc(-46, 251, ear_radius, ear_radius, 7*PI/4+0.3, 1*PI/4-0.3, OPEN);
  inner_ear = ear_radius - 150;
  stroke(255, 182, 193);
  fill(255, 182, 193);
  arc(690, 251, inner_ear, inner_ear, 3*PI/4+0.3, 5*PI/4-0.338, OPEN);
  arc(14, 251, inner_ear, inner_ear, 7*PI/4+0.338, 1*PI/4-0.30, OPEN);
  // right ear
  stroke(0, 0, 0);
  fill(255, 255, 255);
  shift_distance = 300;
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
  arc_radius = 235;
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
  
  // eyes
  fill(0, 0, 0);
  stroke(0, 0, 0);
  ellipse(400, 500, 30, 100);
  ellipse(600, 500, 30, 100);
  fill(200,200,200);
  ellipse(395, 470, 10, 10);
  ellipse(595, 470, 10, 10);

  // nose
  stroke(0, 0, 0, 0);
  fill(255, 182, 193);
  triangle(470, 600, 530, 600, 500, 640);
  // mouth
  stroke(217, 152, 160);
  line(500, 640, 500, 660);
  fill(0, 0, 0, 0);
  arc(475, 660, 50, 50, 0, 3*PI/4, OPEN);
  arc(525, 660, 50, 50, PI/4, PI, OPEN);

  // whiskers
  stroke(100, 100, 100);
  whisker_radius = 1400;
  // left whiskers
  arc(130, 1270, whisker_radius, whisker_radius, 3*PI/2-0.1, 3*PI/2+0.3, OPEN);
  arc(164, 1295, whisker_radius, whisker_radius, 3*PI/2-0.15, 3*PI/2+0.25, OPEN);
  arc(198, 1315, whisker_radius, whisker_radius, 3*PI/2-0.2, 3*PI/2+0.2, OPEN);
  // right whiskers
  arc(1000-130, 1270, whisker_radius, whisker_radius, 3*PI/2-0.3, 3*PI/2+0.1, OPEN);
  arc(1000-164, 1295, whisker_radius, whisker_radius, 3*PI/2-0.25, 3*PI/2+0.15, OPEN);
  arc(1000-198, 1315, whisker_radius, whisker_radius, 3*PI/2-0.2, 3*PI/2+0.2, OPEN);

}



































