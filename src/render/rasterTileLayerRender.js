import glMatrix from 'gl-matrix';
import { ShaderLoader } from '../shader/shaderLoader';
import { RasterTileShader } from '../shader/rasterTileShader';

const EARTH_RADIUS = 6378137;

export class RasterTileLayerRender {
    constructor(gl) {
        this._gl = gl;
        this._shaderProgram = null;
        this._setup();
    }

    _setup() {
        const gl = this._gl;
        const vertexShader = ShaderLoader.loadVertex(gl, RasterTileShader.vertexSource);
        const fragmentShader = ShaderLoader.loadFragment(gl, RasterTileShader.fragmentSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Failed to setup shaders');
        }
        this._shaderProgram = shaderProgram;
    }

    render(renderTiles, camera) {
        const gl = this._gl;
        const program = this._shaderProgram;
        gl.useProgram(program);

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.CULL_FACE);

        this._uploadModels(camera);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderTiles.forEach(tile => tile.render(gl, program));
    }

    _uploadModels(camera) {
        const gl = this._gl;
        const program = this._shaderProgram;

        const uniformMVMatrixLoc = gl.getUniformLocation(program, 'uMVMatrix');
        const uniformProjMatrixLoc = gl.getUniformLocation(program, 'uPMatrix');
        const modelViewMatrix = glMatrix.mat4.create();
        const projectionMatrix = glMatrix.mat4.create();

        glMatrix.mat4.perspective(
            projectionMatrix,
            60 * Math.PI / 180,
            gl.viewportWidth / gl.viewportHeight,
            0.001, 18 * EARTH_RADIUS);

        glMatrix.mat4.identity(modelViewMatrix);
        glMatrix.mat4.lookAt(modelViewMatrix, camera.eye, camera.center, camera.up);

        gl.uniformMatrix4fv(
            uniformMVMatrixLoc,
            false,
            modelViewMatrix);
        gl.uniformMatrix4fv(
            uniformProjMatrixLoc,
            false,
            projectionMatrix);
    }
}
