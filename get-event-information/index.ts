import * as github from '@actions/github'
import * as core from '@actions/core'

const devBranches = new RegExp(/^refs\/heads\/(master|main|feat-.*)/)
// eslint-disable-next-line unicorn/better-regex
const tagFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}(-alpha\.[0-9]{1,})?/)
// eslint-disable-next-line unicorn/better-regex
const releaseFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}$/)
// eslint-disable-next-line unicorn/better-regex
const prereleaseFormat = new RegExp(/^v([0-9]{1,}\.){2}[0-9]{1,}(-alpha\.[0-9]{1,})$/)

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
    let envName: string = ''
    if (ref.startsWith('refs/tags') === true && tagFormat.test(tagName) === true) {
      if (releaseFormat.test(tagName) === true) {
        releaseType = 'release'
      } else if (prereleaseFormat.test(tagName) === true) {
        releaseType = 'prerelease'
      }
      envName = 'stg'
    } else if (devBranches.test(ref)) {
      envName = 'dev'
    }

    core.notice(`Group: ${group}`)
    core.notice(`Image name: ${imageName}`)
    core.notice(`Full image name: ${fullImageName}`)
    core.notice(`Tag name: ${tagName}`)
    core.notice(`Namespace: ${group}`)
    core.notice(`Release type: ${releaseType} - ${ref}`)
    core.notice(`Environment name: ${envName}`)

    core.setOutput('group', group)
    core.setOutput('name', imageName)
    core.setOutput('image-name', fullImageName)
    core.setOutput('tag-name', tagName)
    core.setOutput('namespace', group)
    core.setOutput('release-type', releaseType)
    core.setOutput('env-name', envName)
  } catch (error) {
    core.setFailed((<Error>error).message)
  }
}

run()
