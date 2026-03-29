import * as THREE from 'three';
import { gsap } from 'gsap';

// --- 1. 基础配置 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // 纯黑背景

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// 相机初始高度设为 50，向下俯视
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 灯光
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const pointLight = new THREE.PointLight(0x00ffff, 2, 200);
pointLight.position.set(0, 50, 0);
scene.add(pointLight);

// --- 2. 游戏边界 (蓝色网格) ---
const size = 100;
const grid = new THREE.GridHelper(size, 20, 0x00ffff, 0x222222);
scene.add(grid);

// --- 3. 核心对象 ---
let snake = [];
let foods = [];
let pathHistory = [];
const snakeSpeed = 0.4;
let targetPoint = new THREE.Vector3(10, 0, 0); // 初始目标点
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// 音乐
const bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
bgMusic.loop = true;

// --- 4. 方块创建函数 ---
function createBlock(val, pos, isHead = false) {
    const s = isHead ? 2.5 : 2.0; // 蛇头稍微大一点，方便分辨
    const group = new THREE.Group();
    
    // 材质：霓虹色
    const color = new THREE.Color(`hsl(${(Math.log2(val) * 50) % 360}, 80%, 60%)`);
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 0.5 
        })
    );
    mesh.scale.set(s, s, s);
    group.add(mesh);

    // 数字标注
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64; canvas.height = 64;
    ctx.fillStyle = "white"; ctx.font = "bold 40px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(val, 32, 32);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
    sprite.scale.set(s, s, 1);
    sprite.position.y = s * 0.6;
    group.add(sprite);

    group.position.copy(pos);
    group.userData = { value: val, s: s };
    scene.add(group);
    return group;
}

function spawnFood() {
    const r = () => (Math.random() - 0.5) * (size - 10);
    const pos = new THREE.Vector3(r(), 0, r());
    foods.push(createBlock(Math.pow(2, Math.floor(Math.random() * 3) + 1), pos));
}

// --- 5. 动画循环 ---
function animate() {
    requestAnimationFrame(animate);

    if (snake.length > 0) {
        const head = snake[0];

        // 1. 蛇头移动逻辑
        const moveDir = targetPoint.clone().sub(head.position).normalize();
        if (head.position.distanceTo(targetPoint) > 1) {
            head.position.add(moveDir.multiplyScalar(snakeSpeed));
            head.lookAt(head.position.clone().add(moveDir));
        }

        // 2. 相机死死锁定蛇头 (这就是为什么你一定能看到蛇)
        camera.position.x = head.position.x;
        camera.position.z = head.position.z + 40; // 偏移一点产生俯视感
        camera.position.y = 50;
        camera.lookAt(head.position);

        // 3. 记录路径并让身体跟随
        pathHistory.unshift(head.position.clone());
        if (pathHistory.length > 1000) pathHistory.pop();

        for (let i = 1; i < snake.length; i++) {
            // 身体跟随前一节的路径点，间距固定为 12 帧
            const targetPos = pathHistory[i * 12]; 
            if (targetPos) {
                snake[i].position.lerp(targetPos, 0.2);
            }
        }

        // 4. 吃食物逻辑
        foods.forEach((f, i) => {
            if (head.position.distanceTo(f.position) < 3) {
                // 吃到食物，身体变长
                const newPart = createBlock(f.userData.value, f.position.clone());
                snake.push(newPart);
                scene.remove(f);
                foods.splice(i, 1);
                spawnFood();
                
                // 简单的合并逻辑：如果最后两节数字相同，合并
                // 这里为了稳定暂时只做变长
            }
        });
    }

    renderer.render(scene, camera);
}

// --- 6. 交互监听 ---
window.addEventListener('mousedown', e => {
    // 鼠标点击哪里，蛇就去哪里
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, intersects);
    targetPoint.copy(intersects);

    // 激活音乐
    if (bgMusic.paused) bgMusic.play();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 初始化：生成蛇头和食物
snake.push(createBlock(2, new THREE.Vector3(0, 0, 0), true));
for (let i = 0; i < 30; i++) spawnFood();
animate();