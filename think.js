// VANTA Globe effect
VANTA.GLOBE({
  el: ".about-globe-canvas",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  // Nghiêng địa cầu về phía cực nam
  onInit: function() {
    if (this.scene && this.scene.children && this.scene.children[0]) {
      this.scene.children[0].rotation.x = Math.PI / 12; // Nghiêng 45 độ về phía nam
    }
  }
});

// Three.js particles globe
const globeContainer = document.getElementById('earth-particles-globe');
const width = globeContainer.offsetWidth;
const height = globeContainer.offsetHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
camera.position.z = 300;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setSize(width, height);
globeContainer.appendChild(renderer.domElement);

// Tải ảnh bản đồ Trái Đất (ảnh phẳng)
const earthMapURL = 'https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg';
const loader = new THREE.TextureLoader();
loader.load(earthMapURL, (texture) => {
  const image = texture.image;
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height).data;

  const radius = 115;
  const numPoints = 32000;
  const positions = [];
  const targets = [];
  const startPositions = [];

  // Tạo các điểm trên cầu, tất cả start từ tâm (0,0,0)
  for (let i = 0; i < numPoints; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    const u = theta / (2 * Math.PI);
    const v = phi / Math.PI;
    const xPix = Math.floor(u * image.width);
    const yPix = Math.floor((1 - v) * image.height);
    const idx = (yPix * image.width + xPix) * 4;

    const r = imageData[idx];
    const g = imageData[idx + 1];
    const b = imageData[idx + 2];

    if (!(b > g && b > r)) {
      // Vị trí đích trên cầu
      const tx = radius * Math.sin(phi) * Math.cos(theta);
      const ty = radius * Math.cos(phi);
      const tz = radius * Math.sin(phi) * Math.sin(theta);
      targets.push(tx, ty, tz);

      // Vị trí bắt đầu: tất cả từ tâm (0,0,0)
      startPositions.push(0, 0, 0);

      // Khởi tạo positions tại tâm
      positions.push(0, 0, 0);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.9
  });

  const earthPoints = new THREE.Points(geometry, material);
  scene.add(earthPoints);

  // Animation bung ra từ tâm thành cầu
  let startTime = null;
  const duration = 0.9; 

  let exploded = true;

  function animate(now) {
    requestAnimationFrame(animate);
    if (!startTime) startTime = now;
    const elapsed = (now - startTime) / 1000;

    const pos = geometry.attributes.position.array;
    if (elapsed < duration) {
      // Tween từng điểm từ tâm ra vị trí cầu
      const t = Math.min(elapsed / duration, 1);
      for (let i = 0; i < pos.length; i += 3) {
        pos[i]   = startPositions[i]   + (targets[i]   - startPositions[i])   * t;
        pos[i+1] = startPositions[i+1] + (targets[i+1] - startPositions[i+1]) * t;
        pos[i+2] = startPositions[i+2] + (targets[i+2] - startPositions[i+2]) * t;
      }
      geometry.attributes.position.needsUpdate = true;
    } else if (exploded) {
      // Đảm bảo các điểm về đúng vị trí cầu sau tween
      for (let i = 0; i < pos.length; i++) {
        pos[i] = targets[i];
      }
      geometry.attributes.position.needsUpdate = true;
      exploded = false;
    }
    if (!exploded) {
      earthPoints.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
});

window.addEventListener('resize', () => {
  const w = globeContainer.offsetWidth;
  const h = globeContainer.offsetHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
