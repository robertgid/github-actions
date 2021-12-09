import * as github from '@actions/github'
import * as core from '@actions/core'

function getBranchFromRef(ref: string): string {
  return ref.replace(/refs\/(heads|tags)\//, '')
}

function run(): void {
  try {
    const deployableBranches = core.getInput('deployableBranches')
    if (github.context.payload.repository === undefined) {
      throw new Error('repository missing in the payload')
    }
    const repoName = github.context.payload.repository.name
    const ref = github.context.ref
    core.notice(`The repo: ${repoName}`)
    core.notice(`Ref: ${ref}`)

    const idx = repoName.indexOf('-')
    const group = repoName.substr(0, idx)
    const imageName = repoName.substr(idx + 1)
    const fullImageName = `${group}/${imageName}`
    const shortRef = ref.substring(ref.lastIndexOf('/') + 1)
    const currentBranchOrTag = getBranchFromRef(ref)
    const release = deployableBranches.split(',').some(value => currentBranchOrTag.indexOf(value) === 0)

    core.notice(`Ref: ${ref}, short ref: ${shortRef}`)
    const imageTag = ref.startsWith('refs/tags') ? shortRef : github.context.sha
    core.notice(`Group: ${group}`)
    core.notice(`Image name: ${imageName}`)
    core.notice(`full image name: ${fullImageName}`)
    core.notice(`namespace: ${group}`)
    core.notice(`release: ${String(release)}`)

    core.setOutput('group', group)
    core.setOutput('name', imageName)
    core.setOutput('image-name', fullImageName)
    core.setOutput('image-tag', imageTag)
    core.setOutput('namespace', group)
    core.setOutput('release', release)
  } catch (error) {
    core.setFailed((<Error>error).message)
  }
}

run()
