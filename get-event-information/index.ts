/* eslint-disable max-lines-per-function */
import * as github from '@actions/github'
import * as core from '@actions/core'

const devBranches = new RegExp(/^refs\/heads\/(master|main|feat-.*)/)
// eslint-disable-next-line unicorn/better-regex
const tagFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}(-alpha\.[0-9]{1,})?/)
// eslint-disable-next-line unicorn/better-regex
const releaseFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}$/)
// eslint-disable-next-line unicorn/better-regex
const prereleaseFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}(-alpha\.[0-9]{1,})$/)

interface EnvironmentContext {
  environment: string
  context: string
  namespace: string
  manifest: string
}

const deploymentValues: Record<string, EnvironmentContext> = {
  eksDev: {
    environment: 'eks-dev',
    context: 'legacy-dev',
    namespace: 'dev',
    manifest: 'dev_manifest.yaml',
  },
  eksStaging: {
    environment: 'eks-staging',
    context: 'legacy-dev',
    namespace: 'dev',
    manifest: 'dev_manifest.yaml',
  },
  legacyDev: {
    environment: 'legacy-dev',
    context: 'legacy-dev',
    namespace: 'dev',
    manifest: 'dev_manifest.yaml',
  },
  legacyStg: {
    environment: 'legacy-staging',
    context: 'legacy-dev',
    namespace: 'dev',
    manifest: 'dev_manifest.yaml',
  },
}

function run(): void {
  try {
    if (github.context.payload.repository === undefined) {
      throw new Error('repository missing in the payload')
    }
    const repoName = github.context.payload.repository.name
    const ref = github.context.ref
    core.notice(`The repo: ${repoName}`)
    core.notice(`Ref: ${ref}`)

    const idx = repoName.indexOf('-')
    const group = repoName.substring(0, idx)
    const imageName = repoName.substring(idx + 1)
    const fullImageName = `${group}/${imageName}`
    const shortRef = ref.substring(ref.lastIndexOf('/') + 1)

    core.notice(`Ref: ${ref}, short ref: ${shortRef}`)
    const tagName = ref.startsWith('refs/tags') ? shortRef : github.context.sha
    let releaseType: string = ''
    // deploymentValues.eksDev.namespace = group
    // deploymentValues.eksStaging.namespace = group
    let config: EnvironmentContext[] = []
    if (ref.startsWith('refs/tags') === true && tagFormat.test(tagName) === true) {
      if (releaseFormat.test(tagName) === true) {
        releaseType = 'release'
      } else if (prereleaseFormat.test(tagName) === true) {
        releaseType = 'prerelease'
      }
      config = getDeploymentConfig('staging')
    } else if (devBranches.test(ref)) {
      config = getDeploymentConfig('dev')
    }

    core.notice(`Group: ${group}`)
    core.notice(`Image name: ${imageName}`)
    core.notice(`Full image name: ${fullImageName}`)
    core.notice(`Tag name: ${tagName}`)
    core.notice(`Namespace: ${group}`)
    core.notice(`Release type: ${releaseType} - ${ref}`)
    core.notice(`Deploy config: ${JSON.stringify(config)}`)

    core.setOutput('group', group)
    core.setOutput('name', imageName)
    core.setOutput('image-name', fullImageName)
    core.setOutput('tag-name', tagName)
    core.setOutput('namespace', group)
    core.setOutput('release-type', releaseType)
    if (config.length > 0) {
      core.setOutput('deploy-config', JSON.stringify(config))
    }
  } catch (error) {
    core.setFailed((<Error>error).message)
  }
}

function getDeploymentConfig(environment: string): EnvironmentContext[] {
  switch (environment) {
    case 'staging':
      return [deploymentValues.legacyStg, deploymentValues.eksStaging]
    default:
      return [deploymentValues.legacyDev, deploymentValues.eksDev]
  }
}

run()
