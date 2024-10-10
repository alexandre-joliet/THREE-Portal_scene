uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;

void main () {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Animating the y position and randomizing the speed
  modelPosition.y += sin(uTime / 2.0 + modelPosition.x * 100.0) * aScale * 0.2; // We use aScale here as it's already randomizing value

  modelPosition.x += sin(uTime / 2.0 + modelPosition.z * 100.0) * aScale * 0.5 ; // We use aScale here as it's already randomizing value


  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // We need to manage the points size accordingly to the pixel ratio
  // We randomize the scale with the imported attribute
  gl_PointSize = uSize * aScale * uPixelRatio;

  // Adjust the size of the fireflies depending of their position = size attenuation
  //! No explanation for the formula
  gl_PointSize *= (1.0 / - viewPosition.z);
}