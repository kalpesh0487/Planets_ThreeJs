import gsap from "gsap";
import "./style.css"
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true
});

// Configure renderer
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// HDRI Environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    
});


const radius = 1.3;
const segments = 64;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const textures = ['./csilla/color.png', './earth/map.jpg', './venus/map.jpg', '/volcanic/color.png'];
const spheres = new THREE.Group();

// Create a large sphere for the starfield background
const starfieldGeometry = new THREE.SphereGeometry(75, 64, 64);
const starfieldTexture = new THREE.TextureLoader().load('./stars.jpg');
starfieldTexture.colorSpace = THREE.SRGBColorSpace;
starfieldTexture.wrapS = THREE.RepeatWrapping;
starfieldTexture.wrapT = THREE.RepeatWrapping;
const starfieldMaterial = new THREE.MeshStandardMaterial({
    map: starfieldTexture,
    side: THREE.BackSide // Render on the inside of the sphere
});
const starfield = new THREE.Mesh(starfieldGeometry, starfieldMaterial);
scene.add(starfield);

const orbitRadis = 4.5;

// Add ambient light for base illumination


const spheresMesh = [];


for(let i = 0; i < 4 ; i++){

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace =THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);

    spheresMesh.push(sphere)

    const angle = (i/4) * (Math.PI * 2);
    sphere.position.x = orbitRadis * Math.cos(angle); // 3D plane mai circular lane ki equation
    sphere.position.z = orbitRadis * Math.sin(angle); // 3 is center se 3 point dur

    spheres.add(sphere);
}
spheres.rotation.x = 0.15;
spheres.position.y = -0.45;
scene.add(spheres);



// Position camera
camera.position.z = 9;

let isThrottled = false;
let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;
window.addEventListener('wheel', (event) => {
    const currentTime = Date.now();
    if(currentTime - lastWheelTime >= throttleDelay){
        lastWheelTime = currentTime;

        const direction = event.deltaY > 0 ? 1 : -1;
        scrollCount = (scrollCount + direction + 4) % 4;
        
        // Rotate planets immediately on scroll
        gsap.to(spheres.rotation, {
            duration: 1,
            y: `+=${direction * Math.PI / 2}`,
            ease: "power2.inOut"
        });

        // Delay the heading animation
        setTimeout(() => {
            const headings = document.querySelectorAll('.heading');
            if(direction > 0) {
                // Scrolling down
                if(scrollCount === 0) {
                    // Reset to first heading when reaching end
                    gsap.to(headings, {
                        duration: 1,
                        y: "0%",
                        ease: "power2.inOut"
                    });
                } else {
                    gsap.to(headings, {
                        duration: 1,
                        y: `-=${100}%`,
                        ease: "power2.inOut"
                    });
                }
            } else {
                // Scrolling up
                if(scrollCount === 3) {
                    gsap.to(headings, {
                        duration: 1,
                        y: "-300%", // Position to show last heading
                        ease: "power2.inOut"
                    });
                } else {
                    gsap.to(headings, {
                        duration: 1,
                        y: `+=${100}%`,
                        ease: "power2.inOut"
                    });
                }
            }
        }, 500); // 500ms delay for heading animation
    }
});


// Clock setup
const clock = new THREE.Clock();


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    for(let i = 0; i < spheresMesh.length; i++){
        const sphere = spheresMesh[i];
        sphere.rotation.y = clock.getElapsedTime() * 0.02;
    }
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
