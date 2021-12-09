import * as github from '@actions/github'
import * as core from '@actions/core'

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
    const group = repoName.substr(0, idx)
    const imageName = repoName.substr(idx + 1)
    const fullImageName = `${group}/${imageName}`
    const shortRef = ref.substring(ref.lastIndexOf('/') + 1)

    core.notice(`Ref: ${ref}, short ref: ${shortRef}`)
    const imageTag = ref.startsWith('refs/tags') ? shortRef : github.context.sha
    core.notice(`Group: ${group}`)
    core.notice(`Image name: ${imageName}`)
    core.notice(`full image name: ${fullImageName}`)
    core.notice(`namespace: ${group}`)

    core.setOutput('group', group)
    core.setOutput('name', imageName)
    core.setOutput('image-name', fullImageName)
    core.setOutput('image-tag', imageTag)
    core.setOutput('namespace', group)
  } catch (error) {
    core.setFailed((<Error>error).message)
  }
}

run()
