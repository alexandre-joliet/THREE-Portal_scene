void main () {
  // Creating the pattern
  
  // gl_PointCoord is a vec2() that gets the UV coordinates
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5, 0.5));

  // We want to have a gradient that fade really fast, so we can divide the distanceToCenter by a small number
  float fadeStrength = 0.05 / distanceToCenter;

  // Then, we want the faded aera to be transparent (= going below 0) so we have to substract the strengh by the its double 
  fadeStrength -= (0.05 * 2.0); 

  gl_FragColor = vec4(0.8, 0.2, 0.2, fadeStrength);

}