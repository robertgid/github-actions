"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = __importDefault(require("@actions/github"));
const core_1 = __importDefault(require("@actions/core"));
const io_1 = __importDefault(require("@actions/io"));
const path_1 = __importDefault(require("path"));
const logger = console;
function getDockerFilePath() {
    const tempDirectory = process.env.RUNNER_TEMP;
    if (tempDirectory !== undefined) {
        return path_1.default.join(tempDirectory, `dockerfile-${new Date().getTime().toString()}`);
    }
    else {
        throw new Error('Unable to create temp directory.');
    }
}
function copyDockerFile(runtime) {
    return __awaiter(this, void 0, void 0, function* () {
        const tempFile = getDockerFilePath();
        logger.log(`temp file: ${tempFile}`);
        logger.log(`setting runtime for: ${runtime}`);
        yield io_1.default.cp(`${__dirname}/docker/${runtime}`, tempFile).catch(e => {
            logger.log(e);
        });
        return tempFile;
    });
}
// Get the JSON webhook payload for the event that triggered the workflow
//const payload = JSON.stringify(github.context.payload, undefined, 2)
//logger.log(`The event payload: ${payload}`);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const runtime = core_1.default.getInput('runtime');
            const docker = core_1.default.getInput('docker');
            const customDockerFile = core_1.default.getInput('dockerFile');
            logger.log(`inputs runtime: ${runtime}, docker: ${docker}, custom docker file: ${customDockerFile}`);
            if (github_1.default.context.payload.repository === undefined) {
                throw new Error('repository missing in the payload');
            }
            const repoName = github_1.default.context.payload.repository.name;
            const ref = github_1.default.context.ref;
            logger.log(`The repo: ${repoName}`);
            logger.log(`Ref: ${ref}`);
            const idx = repoName.indexOf('-');
            const group = repoName.substr(0, idx);
            const imageName = repoName.substr(idx + 1);
            const fullImageName = `${group}/${imageName}`;
            const shortRef = ref.substring(ref.lastIndexOf('/') + 1);
            logger.log(`Ref: ${ref}, short ref: ${shortRef}`);
            const imageTag = ref.startsWith('refs/tags') ? shortRef : github_1.default.context.sha;
            logger.log(`Group: ${group}`);
            logger.log(`Image name: ${imageName}`);
            logger.log(`full image name: ${fullImageName}`);
            logger.log(`namespace: ${group}`);
            core_1.default.setOutput('group', group);
            core_1.default.setOutput('name', imageName);
            core_1.default.setOutput('image-name', fullImageName);
            core_1.default.setOutput('image-tag', imageTag);
            core_1.default.setOutput('namespace', group);
            if (docker) {
                let dockerFile;
                if (typeof customDockerFile != 'undefined' && customDockerFile !== '') {
                    logger.log(`using user provided docker file: ${customDockerFile}`);
                    dockerFile = customDockerFile;
                }
                else {
                    dockerFile = yield copyDockerFile(runtime);
                }
                logger.log(`Docker file: ${dockerFile}`);
                core_1.default.setOutput('docker-file', dockerFile);
            }
        }
        catch (error) {
            core_1.default.setFailed(error.message);
        }
    });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
