"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-lines-per-function */
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const devBranches = new RegExp(/^refs\/heads\/(master|main|feat-.*)/);
// eslint-disable-next-line unicorn/better-regex
const tagFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}(-alpha\.[0-9]{1,})?/);
// eslint-disable-next-line unicorn/better-regex
const releaseFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}$/);
// eslint-disable-next-line unicorn/better-regex
const prereleaseFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}(-alpha\.[0-9]{1,})$/);
const deploymentValues = {
    legacyDev: {
        environment: 'legacy-dev',
        context: 'legacy-dev',
        namespace: 'dev',
        manifest: 'dev_manifest.yaml',
    },
    eksDev: {
        environment: 'eks-dev',
        context: 'new-dev',
        namespace: 'dev',
        manifest: 'eks_dev_manifest.yaml',
    },
    legacyStg: {
        environment: 'legacy-stg',
        context: 'legacy-stg',
        namespace: 'staging',
        manifest: 'stg_manifest.yaml',
    },
};
function run() {
    try {
        if (github.context.payload.repository === undefined) {
            throw new Error('repository missing in the payload');
        }
        const repoName = github.context.payload.repository.name;
        const ref = github.context.ref;
        core.notice(`The repo: ${repoName}`);
        core.notice(`Ref: ${ref}`);
        const idx = repoName.indexOf('-');
        const group = repoName.substring(0, idx);
        const imageName = repoName.substring(idx + 1);
        const fullImageName = `${group}/${imageName}`;
        const shortRef = ref.substring(ref.lastIndexOf('/') + 1);
        core.notice(`Ref: ${ref}, short ref: ${shortRef}`);
        const tagName = ref.startsWith('refs/tags') ? shortRef : github.context.sha;
        let releaseType = '';
        deploymentValues.eksDev.namespace = group;
        let config = [];
        if (ref.startsWith('refs/tags') && tagFormat.test(tagName)) {
            if (releaseFormat.test(tagName)) {
                releaseType = 'release';
            }
            else if (prereleaseFormat.test(tagName)) {
                releaseType = 'prerelease';
            }
            config = getDeploymentConfig('staging');
        }
        else if (devBranches.test(ref)) {
            config = getDeploymentConfig('dev');
        }
        core.notice(`Group: ${group}`);
        core.notice(`Image name: ${imageName}`);
        core.notice(`Full image name: ${fullImageName}`);
        core.notice(`Tag name: ${tagName}`);
        core.notice(`Namespace: ${group}`);
        core.notice(`Release type: ${releaseType} - ${ref}`);
        core.notice(`Deploy config: ${JSON.stringify(config)}`);
        core.setOutput('group', group);
        core.setOutput('name', imageName);
        core.setOutput('image-name', fullImageName);
        core.setOutput('tag-name', tagName);
        core.setOutput('namespace', group);
        core.setOutput('release-type', releaseType);
        if (config.length > 0) {
            core.setOutput('deploy-config', JSON.stringify(config));
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
function getDeploymentConfig(environment) {
    switch (environment) {
        case 'staging':
            return [deploymentValues.legacyStg];
        default:
            //return [deploymentValues.legacyDev, deploymentValues.eksDev]
            return [deploymentValues.legacyDev];
    }
}
run();
