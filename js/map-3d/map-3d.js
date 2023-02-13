function open3dMap() {
    if (query("#map-3d").query("canvas")) { // already here
        query("#map-3d").classList.remove("invisible")
    }
}

function close3dMap() {
    if (query("#map-3d").query("canvas")) { // already here
        query("#map-3d").classList.add("invisible")
    }
}

function load3dMap() {
    // console.warn = () => {} // too many warnings
    //Scene

    const scene = new THREE.Scene()

    //Camera
    const height = window.innerHeight
    const width = window.innerWidth
    const distance = 5000
    const diag = Math.sqrt(height ** 2 + width ** 2)
    const fov = 2 * Math.atan((diag) / (2 * distance)) * (180 / Math.PI) //Field of View
    const camera = new THREE.PerspectiveCamera(
        fov, width / height, 0.1, distance)
    camera.position.set(0, 25, -50)

    //Renderer
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: document.createElement("canvas"),
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.gammaInput = true
    renderer.gammaOutput = true
    renderer.antialias = true
    
    query("#map-3d").appendChild(renderer.domElement)

    const light = new THREE.AmbientLight(0xffffff, 3)
    light.power = 6640  // GE Lumens @ 60W incade.
    light.decay = 2
    light.distance = Infinity
    light.position.set(0, 2, 0)
    // light.castShadow = true
    // light.shadowCameraVisible = true
    scene.add(light)

    //OrbitControls
    const orbit = new THREE.OrbitControls(camera, renderer.domElement)
    orbit.maxPolarAngle = Math.PI / 2
    orbit.update()

    let mesh
    // Instantiate a loader
    new THREE.GLTFLoader().load('./map/map-3d.glb', gltf => {
        mesh = gltf.scene
        scene.add(mesh)
    })

	//Render loop
	render()
	function render() {
		renderer.toneMappingExposure = Math.pow(0.7, 5.0);  // -> exposure: 0.168
		renderer.render(scene, camera);

		requestAnimationFrame(render)
	}
}