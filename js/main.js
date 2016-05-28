/*global THREE */
/*global console */
/*jshint browser: true */
/*jshint jquery: true */
/*jshint strict: false*/
/*jshint -W104 */

const NUM_OF_BUSTS = 6,
      NUM_OF_LIGHTINGS = 7;
var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera( 70, 2, 0.1, 1000 ),
    renderer = new THREE.WebGLRenderer(),
    canvas,
    loadedBusts = new Array(NUM_OF_BUSTS),
    currentBust,
    currentLighting,
    startTime = new Date().getTime(),
    tElapsed,
    paused = false,
    mouseDown = false,
    beingDragged = false,
    cameraLocked = true,
    dragStartX, dragStartY,
    savedRotationZ, savedCameraPosition,
    colladaLoader = new THREE.ColladaLoader(),
    jsonLoader = new THREE.ObjectLoader();
colladaLoader.options.centerGeometry = true;
var mesh,
    pointLight1 = new THREE.PointLight(0x000000, 0),
    pointLight2 = new THREE.PointLight(0x000000, 0),
    pointLight3 = new THREE.PointLight(0x000000, 0),
    pointLight4 = new THREE.PointLight(0x000000, 0),
    hemisphereLight = new THREE.HemisphereLight(0x000000, 0x000000),
    directionalLight = new THREE.DirectionalLight(0x000000, 0);
pointLight1.name = "pointLight1";
pointLight2.name = "pointLight2";
pointLight3.name = "pointLight3";
pointLight4.name = "pointLight4";
hemisphereLight.name = "hemisphereLight";
directionalLight.name = "directionalLight";
scene.add(pointLight1, pointLight2, pointLight3, pointLight4,
          directionalLight, hemisphereLight);


/**
* Loads a collada file.
* @param {String} name The location of the collada file without ".dae" extension
*/
function colladaLoad(name) {
  colladaLoader.load(name + ".dae", function(collada) {
    mesh = collada.scene;
    currentBust = name;
    mesh.color = "0x222222";
    mesh.name = name;

    var box = new THREE.Box3().setFromObject( mesh ),
        maxDim = Math.max(box.size().x, box.size().y, box.size().z);
    console.log(maxDim);
    //console.log(mesh.computeBoundingBox());
    var scaleFactor = 10 / maxDim;

    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    mesh.position.set(0, 0, -11);
    mesh.rotation.x = - Math.PI / 2;
    loadedBusts[getBustNumber(name)] = mesh;
    scene.add(mesh);
  });
}

function jsonLoad(name) {
  jsonLoader.load(name + ".json", function(json) {
    mesh = json;
    currentBust = name;
    mesh.color = "0x222222";
    mesh.name = name;

    var box = new THREE.Box3().setFromObject( mesh ),
        maxDim = Math.max(box.size().x, box.size().y, box.size().z),
        scaleFactor = 10 / maxDim;

    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    mesh.position.set(0, 0, -11);
    loadedBusts[getBustNumber(name)] = mesh;
    scene.add(mesh);

    document.getElementById("nameOfLight").innerHTML = getLightName(currentLighting);
    console.log("Loaded " + name + ".json of max bound " + maxDim);
  }, function() {
    document.getElementById("nameOfLight").innerHTML = "Loading . . .";
  });
}

const lightsUsed = [["pointLight1", "pointLight2", "hemisphereLight"],
                   ["pointLight1", "hemisphereLight"],
                   ["pointLight1", "directionalLight"],
                   ["pointLight1", "pointLight2", "pointLight3",
                    "pointLight4", "hemisphereLight"],
                   ["pointLight1", "pointLight2", "pointLight3"],
                   ["pointLight1", "directionalLight", "hemisphereLight"],
                   ["pointLight1", "pointLight2", "pointLight3"]];
/**
* Sets up lighting based on its parameter.
* 0: Three-Quarter
* 1: Frontal
* 2: Edge / Rim
* 3: Contre Jour
* 4: From Below
* 5: Spotlighting
* 6: Multicolour
*/
function generateLighting(num) {
  var pointLHelper1, pointLHelper2, dirLightHelper;
  if (num === 0) {
    pointLight1.intensity = 0.8;
    pointLight1.color.setHex(0xcccccc);
    pointLight1.position.set(3, 5, -5);

    pointLight2.intensity = 0.2;
    pointLight2.color.setHex(0x648038);
    pointLight2.position.set(-3, -5, -5);

    hemisphereLight.intensity = 0.2;
    hemisphereLight.color.setHex(0x3e1c09);
    hemisphereLight.groundColor.setHex(0xb92d12);

//    pointLight1.name = "pointLight1";
//    hemisphereLight.name = "hemisphereLight";
//    scene.add(pointLight1, hemisphereLight);
  } else if (num == 1) {
    pointLight1.intensity = 0.8;
    pointLight1.color.setHex(getRandomColour(0xcc, 0xfa, 0xc5, 0xfa, 0xcc, 0xfa));
    pointLight1.position.set(0, 9, 0);

    hemisphereLight.intensity = 0.5;
    hemisphereLight.color.setHex(0x3e1c09);
    hemisphereLight.groundColor.setHex(0x9b5649);

//    pointLight1.name = "pointLight1";
//    scene.add(pointLight1);
  } else if (num == 2) {
    pointLight1.intensity = 6;
    pointLight1.color.setHex(0xffc682);
    pointLight1.position.set(14, 18, -23);

    directionalLight.intensity = 0.5;
    directionalLight.color.setHex(0xddcccc);
    directionalLight.position.set(0, 10, 0);

//    pointLight1.name = "pointLight1";
//    directionalLight.name = "directionalLight";
//    scene.add(pointLight1, directionalLight);
  } else if (num == 3) {
    hemisphereLight.intensity = 0.5;
    hemisphereLight.color.setHex(0x427a98);
    hemisphereLight.groundColor.setHex(0x24221f);

    pointLight1.intensity = 1;
    pointLight1.color.setHex(0xff9327);
    pointLight1.position.set(8, 10, -25);

    pointLight2.intensity = 1;
    pointLight2.color.setHex(0xff9327);
    pointLight2.position.set(-8, 10, -25);

    pointLight3.intensity = 1;
    pointLight3.color.setHex(0xff9327);
    pointLight3.position.set(16, 10, -25);

    pointLight4.intensity = 1;
    pointLight4.color.setHex(0xff9327);
    pointLight4.position.set(-16, 10, -25);

//    pointLHelper1 = new THREE.PointLightHelper(pointLight1, 10);
//    pointLHelper2 = new THREE.PointLightHelper(pointLight2, 10);

//    hemisphereLight.name = "hemisphereLight";
//    pointLight1.name = "pointLight1";
//    pointLight2.name = "pointLight2";
//    pointLight3.name = "pointLight3";
//    pointLight4.name = "pointLight4";
//    scene.add(pointLight1, pointLight2, pointLight3, pointLight4,
//              hemisphereLight);
  } else if (num == 4) {
    pointLight1.intensity = 1.2;
    pointLight1.color.setHex(0xff6026);
    pointLight1.position.set(0, -10, -6);

    pointLight2.intensity = 0.6;
    pointLight2.color.setHex(0x7c9aaa);
    pointLight2.position.set(11, -10, -8);

    pointLight3.intensity = 0.6;
    pointLight3.color.setHex(0xc3a2d0);
    pointLight3.position.set(-11, -10, -8);

//    pointLight1.name = "pointLight1";
//    pointLight2.name = "pointLight2";
//    pointLight3.name = "pointLight3";
//    scene.add(pointLight1, pointLight2, pointLight3);
  } else if (num == 5) {
    hemisphereLight.intensity = 0.5;
    hemisphereLight.color.setHex(0x427a98);
    hemisphereLight.groundColor.setHex(0x24221f);

    pointLight1.intensity = 3;
    pointLight1.distance = 4.4;
    pointLight1.color.set(0xf2d24b);
    pointLight1.position.set(1.8, 2.5, -6);
//    pointLHelper1 = new THREE.PointLightHelper(pointLight1, 2);

    directionalLight.intensity = 0.5;
    directionalLight.color.setHex(0xf2d24b);
    directionalLight.position.set(4, 20, -5);
//    dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 20);

//    pointLight1.name = "pointLight1";
//    directionalLight.name = "directionalLight";
//    hemisphereLight.name = "hemisphereLight";
//    scene.add(hemisphereLight, directionalLight, pointLight1);
  } else if (num == 6) {
    pointLight1.intensity = 0.6;
    pointLight1.color.setHex(0xff0000);
    pointLight1.position.set(5, 10, -4);

    pointLight2.intensity = 0.6;
    pointLight2.color.setHex(0x00ff00);
    pointLight2.position.set(-7, 10, -9);

    pointLight3.intensity = 0.6;
    pointLight3.color.setHex(0x0000ff);
    pointLight3.position.set(-0.3, -2, -4);

//    pointLight1.name = "pointLight1";
//    pointLight2.name = "pointLight2";
//    pointLight3.name = "pointLight3";
//    scene.add(pointLight1, pointLight2, pointLight3);
  }
  console.log("Objects in scene: ");
  console.log(scene.children);
}

/**
* Returns random hexadecimal-colour-appropriate number.
* @param {Number} rL Lower bound for amount of red, as Integer[0x0, 0xff]
* @param {Number} rU Upper bound for amount of red, as Integer[rL, 0xff]
* @param {Number} gL Lower bound for amount of green, as Integer[0x0, 0xff]
* @param {Number} gU Upper bound for amount of green, as Integer[gL, 0xff]
* @param {Number} bL Lower bound for amount of blue, as Integer[0x0, 0xff]
* @param {Number} bU Upper bound for amount of blue, as Integer[bL, 0xff]
*/
function getRandomColour(rL, rU, gL, gU, bL, bU) {
  if (rL === undefined)
    return ~~(0xffffff * Math.random());
  else {
    var rComp, gComp, bComp;
    rComp = ~~(rL + (rU - rL) * Math.random());
    gComp = ~~(gL + (gU - gL) * Math.random());
    bComp = ~~(bL + (bU - bL) * Math.random());
    return rComp * 0x10000 + gComp * 0x100 + bComp;
  }
}

/** Outputs the name of a random bust. */
function getRandomBust() {
  return getBustName(~~(Math.random() * (NUM_OF_BUSTS - 1)));
}

/** Gets the bust name. */
function getBustName(num) {
  switch (num) {
    case 0:
      return "Lincoln";
    case 1:
      return "Socrates";
    case 2:
      return "Tissot";
    case 3:
      return "Armand";
    case 4:
      return "Sipiere";
    case 5:
      return "Wailly";
    default:
      return null;
  }
}

/** Gets the bust number. */
function getBustNumber(name) {
  switch (name) {
    case "Lincoln":
      return 0;
    case "Socrates":
      return 1;
    case "Tissot":
      return 2;
    case "Armand":
      return 3;
    case "Sipiere":
      return 4;
    case "Wailly":
      return 5;
    default:
      return null;
  }
}

/** Changes the displayed bust. */
function setBust(num) {
  if (typeof num === "string")
    num = getBustNumber(num);

  if (num == -1 || currentBust === getBustName(num)) return;

  scene.remove(loadedBusts[getBustNumber(currentBust)]);
  if (num < NUM_OF_BUSTS) {
    if (loadedBusts[num] === undefined) {
      document.getElementById("nameOfLight").innerHTML = "Loading . . .";
      jsonLoad(getBustName(num));
    } else {
      scene.add(loadedBusts[num]);
      mesh = loadedBusts[num];
      currentBust = getBustName(num);
    }
  }
}

function getRandomLighting() {
  return ~~(NUM_OF_LIGHTINGS * Math.random());
}

/**
* Returns string of type of light
* 0: Three-Quarter
* 1: Frontal
* 2: Edge / Rim
* 3: Contre Jour
* 4: From Below
* 5: Spotlighting
* 6: Multicolour
* @param {Number} num Type of light
* @param {Boolean} suffix If true, attaches " Light" to end of name if appropriate.
*   Default: true
*/
function getLightName(num, suffix) {
  suffix = (suffix !== undefined ? suffix : true);
  if (currentLighting === 0) {
    if (!suffix)
      return "Three-Quarter";
    else
      return "Three-Quarter Lighting";
  } else if (currentLighting == 1) {
    if (!suffix)
      return "Frontal";
    else
      return "Frontal Lighting";
  } else if (currentLighting == 2) {
    if (!suffix)
      return "Edge / Rim";
    else
      return "Edge / Rim Lighting";
  } else if (currentLighting == 3) {
    return "Contre Jour";
  } else if (currentLighting == 4) {
    if (!suffix)
      return "From Below";
    else
      return "Light From Below";
  } else if (currentLighting == 5) {
    return "Spotlighting";
  } else if (currentLighting == 6) {
    if (!suffix)
      return "Multicolour";
    else
      return "Multicolour Lighting";
  } else
    return null;
}

function getDivId(num) {
  var str = getLightName(num, false).replace(/\s+|\//g, "");
  return "#" + str;
}

/** Sets the lighting. */
function setLighting(num) {
  if (num == -1 || currentLighting == num) return;

  if (currentLighting !== undefined) {
    var i, arr = lightsUsed[currentLighting], length = arr.length;
    for (i = 0; i < length; i++) {
      var o = scene.getObjectByName(arr[i]);
      console.log("Removed " + o.name + " from scene.");
      o.intensity = 0;
      o.distance = 0;
    }
  }
  if (num < NUM_OF_LIGHTINGS) {
    if (currentLighting !== undefined)
      $(getDivId(currentLighting)).slideUp(200);

    if (mesh !== undefined) mesh.children[0].children[0].material.needsUpdate = true;
    generateLighting(num);
    currentLighting = num;
    if (mesh !== undefined)
      mesh.children[0].children[0].material.needsUpdate = true;
    document.getElementById("nameOfLight").innerHTML = getLightName(currentLighting);
    $(getDivId(currentLighting)).slideDown(200);
  }
}

function render() {
  requestAnimationFrame( render );

  if (mesh !== undefined) {
    if (!paused && !beingDragged)
      mesh.rotation.z += 0.005;
    tElapsed = new Date().getTime() - startTime;
    mesh.position.y = 1 - Math.sin(tElapsed/1000) / 3;
  }
  renderer.render(scene, camera);
}

function init() {
  /** HTML element init */
  renderer.setSize( $(window).innerWidth(), 0.5 * $(window).innerWidth(), false );
  renderer.domElement.setAttribute("id", "threeapp");
  document.getElementById("app").appendChild( renderer.domElement );
  canvas = renderer.domElement;
  $("#app").css("height", ~~(0.5 * $(window).innerWidth()));

  /**
  * Dragging controls
  * Source: http://stackoverflow.com/a/10502101
  */
  $.widget('ui.custommouse', $.ui.mouse, {
    options: {
      delay: 100,
      distance: 2,
      mouseStart: function(e) {},
      mouseDrag: function(e) {},
      mouseStop: function(e) {},
      mouseCapture: function(e) { return true; }
    },
    // Forward events to custom handlers
    _mouseStart: function(e) { return this.options.mouseStart(e); },
    _mouseDrag: function(e) { return this.options.mouseDrag(e); },
    _mouseStop: function(e) { return this.options.mouseStop(e); },
    _mouseCapture: function(e) { return this.options.mouseCapture(e); },
    // Bookkeeping, inspired by Draggable
    widgetEventPrefix: 'custommouse',
    _init: function() {
      return this._mouseInit();
    },
    _create: function() {
      return this.element.addClass('ui-custommouse');
    },
    _destroy: function() {
      this._mouseDestroy();
      return this.element.removeClass('ui-custommouse');
    },
  });
  function mouseStart(event, ui) {
    // console.log("Drag initialized.");
    dragStartX = event.pageX;
    dragStartY = event.pageY;
    savedRotationZ = mesh.rotation.z;
    savedCameraPosition = camera.position.y;
  }
  function mouseDrag(event, ui) {
    // console.log("Dragging! Firing events.");
    var xDifference = event.pageX - dragStartX;
    var yDifference = event.pageY - dragStartY;
    if (!beingDragged)
      beingDragged = true;
    if (!cameraLocked) {
      camera.position.y = Math.max(-10, Math.min(savedCameraPosition + yDifference / 20, 10));
      camera.position.z = Math.sqrt(121 - Math.pow(camera.position.y, 2)) - 11;
      camera.lookAt(new THREE.Vector3(0, 0, -11));
    }
    mesh.rotation.z = savedRotationZ + xDifference / 200;
  }
  function mouseStop(event, ui) {
    // console.log("Drag ended.");
    beingDragged = false;
  }

  $('#app').custommouse({
    mouseStart: mouseStart,
    mouseDrag: mouseDrag,
    mouseStop: mouseStop
  }).click(function() {
    if (!beingDragged)
      paused = !paused;
  });

  /** Setup Init */
  setBust(getRandomBust());
  setLighting(getRandomLighting());
  camera.position.set(0, 0, 0);

  render();
}
$(document).ready(init);
