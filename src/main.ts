import './reset.css'
import './index.css'
import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui'

const VITE_GITHUB_PAGES_PATH = import.meta.env.VITE_GITHUB_PAGES_PATH || '/'

const WIDTH = 800
const HEIGHT = 600

// レンダラー
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(WIDTH, HEIGHT)
renderer.shadowMap.enabled = true

// シーン
const scene = new THREE.Scene()
// カメラ
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 10000)
camera.position.set(10, 10, 10)
camera.lookAt(scene.position)

// 地面
const planeGeometry = new THREE.PlaneGeometry(10, 10)
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x213573 })
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = -Math.PI / 2
// plane.material.side = THREE.DoubleSide;
plane.receiveShadow = true
scene.add(plane)

// 平行光源
const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 1)
scene.add(directionalLight)

// 環境光源
const ambientlight = new THREE.AmbientLight(0xffffff, 1.0)
scene.add(ambientlight)

// スポットライト
const spotLight = new THREE.SpotLight(0xffffff, 24, 12, Math.PI / 4, 10, 0.5)
spotLight.position.set(0, 8, 0)
spotLight.castShadow = true
spotLight.shadow.mapSize.set(4096, 4096)
scene.add(spotLight)
const spotLightHepler = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHepler)

// 金属テクスチャ
const textureloader = new THREE.TextureLoader()
const metalTexture = textureloader.load(
  `${VITE_GITHUB_PAGES_PATH}/assets/models/metal_texture.jpg`
)

// gltf オブジェクト
let gltfObject: GLTF
let gltfObjectHelper: THREE.BoxHelper

// lil-gui
const gui = new GUI()
gui
  .addColor({ groundColor: 0x213573 }, 'groundColor')
  .onChange((value: string) => {
    planeMaterial.color = new THREE.Color(value)
  })
gui
  .addColor({ directionalLightColor: 0xffffff }, 'directionalLightColor')
  .onChange((value: string) => {
    directionalLight.color = new THREE.Color(value)
  })
gui
  .add({ showDirectionalLight: true }, 'showDirectionalLight')
  .onChange((value: boolean) => {
    directionalLight.visible = value
  })
gui
  .addColor({ ambientlightColor: 0xffffff }, 'ambientlightColor')
  .onChange((value: string) => {
    ambientlight.color = new THREE.Color(value)
  })
gui
  .add({ showAmbientlight: true }, 'showAmbientlight')
  .onChange((value: boolean) => {
    ambientlight.visible = value
  })
gui.addColor({ spotLight: 0xffffff }, 'spotLight').onChange((value: string) => {
  spotLight.color = new THREE.Color(value)
})
gui
  .add({ spotLightCastShadow: true }, 'spotLightCastShadow')
  .onChange((value: boolean) => {
    spotLight.castShadow = value
  })
gui
  .add({ spotLightIntensity: 24 }, 'spotLightIntensity', 0, 48, 0.1)
  .onChange((value: number) => {
    spotLight.intensity = value
  })
gui
  .add({ spotLightHepler: true }, 'spotLightHepler')
  .onChange((value: boolean) => {
    spotLightHepler.visible = value
  })
gui
  .add({ gltfObjectAddMaterial: false }, 'gltfObjectAddMaterial')
  .onChange((value: boolean) => {
    if (!gltfObject) return

    gltfObject.scene.traverse((child) => {
      if (child.name === 'Torus' && child instanceof THREE.Mesh) {
        if (value) {
          child.material.map = metalTexture
          child.material.metalness = 0.75
          child.material.roughness = 0.1
        } else {
          child.material.map = null
          child.material.metalness = 0
          child.material.roughness = 1
        }
      }
    })
  })
gui
  .add({ gltfObjectHelper: true }, 'gltfObjectHelper')
  .onChange((value: boolean) => {
    gltfObjectHelper.visible = value
  })

// OrbitControls
const orbitController = new OrbitControls(camera, renderer.domElement)
orbitController.maxPolarAngle = Math.PI * 0.5
orbitController.minDistance = 0.1
orbitController.maxDistance = 10000
orbitController.autoRotateSpeed = 1.0

// gltf ファイルの読み込み
const gltfLoader = new GLTFLoader()

gltfLoader.load(`${VITE_GITHUB_PAGES_PATH}/assets/models/model.glb`, (data) => {
  gltfObject = data

  // scene.children.map() ではなく scene.traverse() とするのが正しい様子
  gltfObject.scene.traverse((child) => {
    // child.receiveShadow = true; // 不要っぽい
    child.castShadow = true
  })

  gltfObject.scene.scale.set(1, 1, 1)
  gltfObject.scene.position.set(0, 2.5, 0)
  scene.add(gltfObject.scene)

  gltfObjectHelper = new THREE.BoxHelper(gltfObject.scene, 0xffff00)
  scene.add(gltfObjectHelper)
})

const wrapper = document.querySelector<HTMLDivElement>('#app')!
wrapper.appendChild(renderer.domElement)

// 画面に表示＋アニメーション
const ticker = () => {
  requestAnimationFrame(ticker)

  // gltfObject の回転
  const time = Date.now() * 0.001
  if (gltfObject) {
    gltfObject.scene.position.set(Math.cos(time) * 2, 2.5, Math.sin(time) * 2)
    gltfObject.scene.rotation.y += 0.01
  }

  // helper の更新
  spotLightHepler.update()
  if (gltfObjectHelper) gltfObjectHelper.update()

  orbitController.update()
  renderer.render(scene, camera)
}
ticker()
